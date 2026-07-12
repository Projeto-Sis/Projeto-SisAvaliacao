from __future__ import annotations

from dataclasses import asdict, dataclass
from statistics import median
from typing import Iterable

from .connectors.base import ListingConnector, SearchCriteria, SearchSubject
from .domain import Listing, evaluate_duplicate, geo_distance_meters, select_representative_price, validate_listing


MINIMUM_COMPARABLE_PROPERTIES = 20


@dataclass(frozen=True, slots=True)
class SearchCandidate:
    listing: Listing
    distance_meters: float
    issues: tuple
    duplicate_group: int


def _round_or_none(value: float | None, digits: int = 2) -> float | None:
    return round(value, digits) if value is not None else None


def _regional_context(
    subject: SearchSubject,
    criteria: SearchCriteria,
    properties: list[dict],
) -> dict:
    unit_prices = [item["unit_price"] for item in properties if item["unit_price"] > 0]
    distances = [item["distance_meters"] for item in properties]
    overall_median = median(unit_prices) if unit_prices else None
    band_limits = [(0, min(1_000, criteria.radius_meters))]
    if criteria.radius_meters > 1_000:
        band_limits.append((1_000, min(3_000, criteria.radius_meters)))
    if criteria.radius_meters > 3_000:
        band_limits.append((3_000, criteria.radius_meters))

    bands = []
    for lower, upper in band_limits:
        items = [
            item for item in properties
            if (lower == 0 and lower <= item["distance_meters"] <= upper)
            or (lower < item["distance_meters"] <= upper)
        ]
        prices = [item["unit_price"] for item in items if item["unit_price"] > 0]
        band_median = median(prices) if prices else None
        bands.append(
            {
                "label": f"{lower / 1_000:g}–{upper / 1_000:g} km" if lower else f"até {upper / 1_000:g} km",
                "min_distance_meters": lower,
                "max_distance_meters": upper,
                "property_count": len(items),
                "median_unit_price": _round_or_none(band_median),
                "relative_price_index": _round_or_none(
                    band_median / overall_median if band_median and overall_median else None,
                    4,
                ),
            }
        )

    return {
        "center": {"latitude": subject.latitude, "longitude": subject.longitude},
        "radius_meters": criteria.radius_meters,
        "property_count": len(properties),
        "median_distance_meters": _round_or_none(median(distances) if distances else None, 1),
        "closest_distance_meters": _round_or_none(min(distances) if distances else None, 1),
        "farthest_distance_meters": _round_or_none(max(distances) if distances else None, 1),
        "median_unit_price": _round_or_none(overall_median),
        "minimum_unit_price": _round_or_none(min(unit_prices) if unit_prices else None),
        "maximum_unit_price": _round_or_none(max(unit_prices) if unit_prices else None),
        "distance_bands": bands,
        "method_note": (
            "Indicadores territoriais exploratórios. O índice relativo compara a mediana da faixa "
            "com a mediana geral e não constitui fator automático de homogeneização."
        ),
    }


def _compatible(listing: Listing, subject: SearchSubject) -> bool:
    if listing.property_type != subject.property_type or listing.transaction_type != subject.transaction_type:
        return False
    if subject.bedrooms is not None and listing.bedrooms is not None and abs(listing.bedrooms - subject.bedrooms) > 1:
        return False
    if subject.area is not None and listing.area > 0:
        area_difference = abs(listing.area - subject.area) / subject.area
        if area_difference > 0.50:
            return False
    room_pairs = (
        (listing.suites, subject.suites),
        (listing.bathrooms, subject.bathrooms),
        (listing.parking_spaces, subject.parking_spaces),
    )
    if any(
        listing_value is not None
        and subject_value is not None
        and abs(listing_value - subject_value) > 1
        for listing_value, subject_value in room_pairs
    ):
        return False
    return listing.latitude is not None and listing.longitude is not None


def _group_duplicates(listings: list[Listing]) -> list[list[Listing]]:
    groups: list[list[Listing]] = []
    for listing in listings:
        selected_group = None
        for group in groups:
            decision = evaluate_duplicate(group[0], listing)
            if decision.decision in {"automatic", "review"}:
                selected_group = group
                break
        if selected_group is None:
            groups.append([listing])
        else:
            selected_group.append(listing)
    return groups


def execute_search(
    connector: ListingConnector,
    subject: SearchSubject,
    criteria: SearchCriteria,
    listings: Iterable[Listing] | None = None,
) -> dict:
    if not 100 <= criteria.radius_meters <= 5_000:
        raise ValueError("O raio deve estar entre 100 e 5.000 metros.")

    found = list(listings) if listings is not None else connector.search(subject, criteria)
    nearby: list[tuple[Listing, float]] = []
    for listing in found:
        if not _compatible(listing, subject):
            continue
        distance = geo_distance_meters(
            subject.latitude,
            subject.longitude,
            listing.latitude,
            listing.longitude,
        )
        if distance <= criteria.radius_meters:
            nearby.append((listing, distance))

    groups = _group_duplicates([listing for listing, _ in nearby])
    group_by_listing = {
        listing.listing_id: group_index
        for group_index, group in enumerate(groups, start=1)
        for listing in group
    }
    distances = {listing.listing_id: distance for listing, distance in nearby}
    candidates = [
        SearchCandidate(
            listing=listing,
            distance_meters=round(distances[listing.listing_id], 1),
            issues=validate_listing(listing),
            duplicate_group=group_by_listing[listing.listing_id],
        )
        for listing, _ in nearby
    ]
    consolidated = []
    regional_properties = []
    for index, group in enumerate(groups, start=1):
        selection = select_representative_price(group)
        representative = next(item for item in group if item.listing_id == selection.listing_id)
        group_distance = min(distances[item.listing_id] for item in group)
        unit_price = selection.price / representative.area
        consolidated.append(
            {
                "group": index,
                "listing_ids": [listing.listing_id for listing in group],
                "representative_price": asdict(selection),
                "distance_meters": round(group_distance, 1),
                "unit_price": round(unit_price, 2),
            }
        )
        regional_properties.append(
            {
                "group": index,
                "distance_meters": group_distance,
                "unit_price": unit_price,
            }
        )
    property_count = len(groups)
    meets_minimum = property_count >= MINIMUM_COMPARABLE_PROPERTIES
    return {
        "mode": "preview",
        "connector": connector.name,
        "found_count": len(found),
        "candidate_count": len(candidates),
        "property_count": property_count,
        "sample_sufficiency": {
            "minimum_required": MINIMUM_COMPARABLE_PROPERTIES,
            "available_properties": property_count,
            "shortage": max(0, MINIMUM_COMPARABLE_PROPERTIES - property_count),
            "meets_minimum": meets_minimum,
            "message": (
                f"Base suficiente: {property_count} imóveis comparáveis únicos."
                if meets_minimum
                else f"Base insuficiente: faltam {MINIMUM_COMPARABLE_PROPERTIES - property_count} imóveis comparáveis únicos para atingir o mínimo de {MINIMUM_COMPARABLE_PROPERTIES}."
            ),
        },
        "candidates": [
            {
                "listing": {
                    **asdict(candidate.listing),
                    "photo_hashes": sorted(candidate.listing.photo_hashes),
                },
                "distance_meters": candidate.distance_meters,
                "duplicate_group": candidate.duplicate_group,
                "issues": [asdict(issue) for issue in candidate.issues],
            }
            for candidate in candidates
        ],
        "consolidated": consolidated,
        "regional_context": _regional_context(subject, criteria, regional_properties),
        "approval_required": True,
    }
