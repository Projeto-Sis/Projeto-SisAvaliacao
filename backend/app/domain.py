from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from math import asin, cos, radians, sin, sqrt
from typing import Iterable, Literal
import re
import unicodedata


DuplicateDecision = Literal["automatic", "review", "distinct"]
IssueSeverity = Literal["error", "warning"]


@dataclass(frozen=True, slots=True)
class Listing:
    listing_id: str
    source: str
    source_reference: str
    price: float
    area: float
    collected_at: datetime
    last_seen_at: datetime
    active: bool = True
    source_reliability: float = 0.5
    source_url: str | None = None
    property_type: str = "apartment"
    transaction_type: str = "sale"
    address: str | None = None
    unit_number: str | None = None
    condominium_name: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    location_precision: str = "unknown"
    bedrooms: int | None = None
    suites: int | None = None
    bathrooms: int | None = None
    parking_spaces: int | None = None
    photo_hashes: frozenset[str] = field(default_factory=frozenset)


@dataclass(frozen=True, slots=True)
class ValidationIssue:
    code: str
    severity: IssueSeverity
    message: str


@dataclass(frozen=True, slots=True)
class DuplicateResult:
    score: float
    decision: DuplicateDecision
    reasons: tuple[str, ...]


@dataclass(frozen=True, slots=True)
class PriceSelection:
    listing_id: str
    price: float
    strategy: str
    active_prices: tuple[float, ...]
    spread_ratio: float
    requires_review: bool
    warnings: tuple[str, ...]


def normalized_text(value: str | None) -> str:
    decomposed = unicodedata.normalize("NFD", value or "")
    without_accents = "".join(char for char in decomposed if unicodedata.category(char) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", without_accents.lower()).strip()


def token_similarity(first: str | None, second: str | None) -> float:
    first_tokens = set(normalized_text(first).split())
    second_tokens = set(normalized_text(second).split())
    if not first_tokens or not second_tokens:
        return 0.0
    return len(first_tokens & second_tokens) / len(first_tokens | second_tokens)


def relative_difference(first: float, second: float) -> float:
    denominator = max(abs(first), abs(second), 1e-9)
    return abs(first - second) / denominator


def distance_meters(first: Listing, second: Listing) -> float | None:
    if None in (first.latitude, first.longitude, second.latitude, second.longitude):
        return None
    return geo_distance_meters(first.latitude, first.longitude, second.latitude, second.longitude)


def geo_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    lat1, lon1, lat2, lon2 = map(radians, (lat1, lon1, lat2, lon2))
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    haversine = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return 2 * 6_371_000 * asin(sqrt(haversine))


def _same_room_signature(first: Listing, second: Listing) -> bool:
    comparable = (
        (first.bedrooms, second.bedrooms),
        (first.suites, second.suites),
        (first.bathrooms, second.bathrooms),
        (first.parking_spaces, second.parking_spaces),
    )
    known = [(left, right) for left, right in comparable if left is not None and right is not None]
    return bool(known) and all(left == right for left, right in known)


def evaluate_duplicate(first: Listing, second: Listing) -> DuplicateResult:
    if normalized_text(first.property_type) != normalized_text(second.property_type):
        return DuplicateResult(0.0, "distinct", ("tipologias incompatíveis",))
    if normalized_text(first.transaction_type) != normalized_text(second.transaction_type):
        return DuplicateResult(0.0, "distinct", ("operações incompatíveis",))
    if (
        normalized_text(first.source) == normalized_text(second.source)
        and first.source_reference
        and first.source_reference == second.source_reference
    ):
        return DuplicateResult(1.0, "automatic", ("mesma referência na mesma fonte",))

    score = 0.0
    reasons: list[str] = []
    strong_signals = 0

    shared_photos = first.photo_hashes & second.photo_hashes
    if shared_photos:
        score += 0.45
        strong_signals += 1
        reasons.append("fotografia coincidente")

    distance = distance_meters(first, second)
    precise_locations = {first.location_precision, second.location_precision} <= {
        "exact",
        "street",
        "condominium",
    }
    if distance is not None and precise_locations:
        if distance <= 20:
            score += 0.22
            strong_signals += 1
            reasons.append("coordenadas a até 20 m")
        elif distance <= 80:
            score += 0.15
            reasons.append("coordenadas a até 80 m")
        elif distance <= 200:
            score += 0.07
            reasons.append("coordenadas próximas")

    address_similarity = token_similarity(first.address, second.address)
    both_units_known = bool(first.unit_number and second.unit_number)
    same_unit = bool(both_units_known and normalized_text(first.unit_number) == normalized_text(second.unit_number))
    conflicting_units = bool(both_units_known and not same_unit)
    if address_similarity >= 0.9 and same_unit:
        score += 0.28
        strong_signals += 1
        reasons.append("mesmo endereço e unidade")
    elif address_similarity >= 0.8:
        score += 0.12
        reasons.append("endereços muito semelhantes")

    same_condominium = bool(
        first.condominium_name
        and second.condominium_name
        and normalized_text(first.condominium_name) == normalized_text(second.condominium_name)
    )
    if same_condominium:
        score += 0.10
        reasons.append("mesmo condomínio")

    area_difference = relative_difference(first.area, second.area)
    if area_difference <= 0.01:
        score += 0.12
        reasons.append("áreas com diferença de até 1%")
        if same_condominium:
            strong_signals += 1
    elif area_difference <= 0.05:
        score += 0.07
        reasons.append("áreas com diferença de até 5%")

    if _same_room_signature(first, second):
        score += 0.08
        reasons.append("mesma configuração de cômodos")

    score = min(score, 1.0)
    if score >= 0.92 and strong_signals >= 2 and not conflicting_units:
        decision: DuplicateDecision = "automatic"
    elif score >= 0.70:
        decision = "review"
    else:
        decision = "distinct"
    return DuplicateResult(round(score, 4), decision, tuple(reasons))


def validate_listing(listing: Listing, now: datetime | None = None) -> tuple[ValidationIssue, ...]:
    now = now or datetime.now(timezone.utc)
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)
    last_seen_at = listing.last_seen_at if listing.last_seen_at.tzinfo else listing.last_seen_at.replace(tzinfo=timezone.utc)
    collected_at = listing.collected_at if listing.collected_at.tzinfo else listing.collected_at.replace(tzinfo=timezone.utc)
    issues: list[ValidationIssue] = []
    if listing.price <= 0:
        issues.append(ValidationIssue("invalid_price", "error", "Preço deve ser maior que zero."))
    if listing.area <= 0:
        issues.append(ValidationIssue("invalid_area", "error", "Área deve ser maior que zero."))
    elif listing.area < 10 or listing.area > 20_000:
        issues.append(ValidationIssue("unusual_area", "warning", "Área fora da faixa inicial de plausibilidade."))
    if listing.area > 0 and listing.price > 0:
        unit_price = listing.price / listing.area
        if unit_price < 300 or unit_price > 200_000:
            issues.append(ValidationIssue("unusual_unit_price", "warning", "Preço unitário exige conferência."))
    if listing.suites is not None and listing.bedrooms is not None and listing.suites > listing.bedrooms:
        issues.append(ValidationIssue("suites_gt_bedrooms", "error", "Suítes não podem superar quartos."))
    if listing.latitude is not None and not -90 <= listing.latitude <= 90:
        issues.append(ValidationIssue("invalid_latitude", "error", "Latitude inválida."))
    if listing.longitude is not None and not -180 <= listing.longitude <= 180:
        issues.append(ValidationIssue("invalid_longitude", "error", "Longitude inválida."))
    if listing.location_precision in {"neighborhood", "city", "unknown"}:
        issues.append(ValidationIssue("imprecise_location", "warning", "Localização insuficiente para confirmar distância exata."))
    if last_seen_at > now + timedelta(days=1):
        issues.append(ValidationIssue("future_last_seen", "error", "Data de verificação está no futuro."))
    if collected_at + timedelta(minutes=1) < last_seen_at:
        issues.append(ValidationIssue("collection_before_observation", "warning", "Coleta anterior à última observação; confira o histórico."))
    age_days = max((now - last_seen_at).days, 0)
    if age_days > 60 or not listing.active:
        issues.append(ValidationIssue("stale_listing", "warning", "Anúncio inativo ou sem confirmação há mais de 60 dias."))
    if not listing.source_url:
        issues.append(ValidationIssue("missing_source_url", "warning", "URL da evidência não informada."))
    return tuple(issues)


def select_representative_price(
    listings: Iterable[Listing],
    now: datetime | None = None,
    freshness_days: int = 60,
) -> PriceSelection:
    now = now or datetime.now(timezone.utc)
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)
    candidates = [listing for listing in listings if listing.price > 0]
    if not candidates:
        raise ValueError("Nenhum preço positivo disponível para consolidação.")

    current = [
        listing
        for listing in candidates
        if listing.active
        and listing.source_reliability >= 0.5
        and max((now - (listing.last_seen_at if listing.last_seen_at.tzinfo else listing.last_seen_at.replace(tzinfo=timezone.utc))).days, 0) <= freshness_days
    ]
    warnings: list[str] = []
    requires_review = False

    if current:
        eligible = current
        selected = min(eligible, key=lambda item: (item.price, -item.source_reliability, -item.last_seen_at.timestamp()))
        strategy = "lowest_current_public_offer"
    else:
        eligible = candidates
        selected = max(eligible, key=lambda item: (item.last_seen_at, item.source_reliability))
        strategy = "most_recent_unverified_offer"
        requires_review = True
        warnings.append("Nenhum anúncio simultaneamente ativo, recente e confiável.")

    prices = tuple(sorted(item.price for item in eligible))
    spread_ratio = 0.0 if len(prices) == 1 else (prices[-1] - prices[0]) / prices[0]
    if spread_ratio > 0.10:
        requires_review = True
        warnings.append("Divergência de preços superior a 10%.")

    return PriceSelection(
        listing_id=selected.listing_id,
        price=selected.price,
        strategy=strategy,
        active_prices=prices,
        spread_ratio=round(spread_ratio, 4),
        requires_review=requires_review,
        warnings=tuple(warnings),
    )
