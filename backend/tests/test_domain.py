import unittest
from dataclasses import replace
from datetime import datetime, timedelta, timezone

from app.domain import Listing, evaluate_duplicate, select_representative_price, validate_listing
from app.connectors.base import SearchCriteria, SearchSubject
from app.connectors.fixture import FixtureConnector
from app.search_service import execute_search


NOW = datetime(2026, 6, 28, 15, 0, tzinfo=timezone.utc)


def listing(**overrides) -> Listing:
    base = Listing(
        listing_id="portal-a-123",
        source="Portal A",
        source_reference="123",
        source_url="https://example.test/123",
        price=700_000,
        area=92,
        collected_at=NOW,
        last_seen_at=NOW,
        active=True,
        source_reliability=0.8,
        address="Rua das Flores, 100, Pituba, Salvador",
        unit_number="802",
        condominium_name="Residencial Mar Azul",
        latitude=-12.981,
        longitude=-38.455,
        location_precision="exact",
        bedrooms=3,
        suites=1,
        bathrooms=2,
        parking_spaces=2,
        photo_hashes=frozenset({"photo-living-room", "photo-balcony"}),
    )
    return replace(base, **overrides)


class DuplicateTests(unittest.TestCase):
    def test_same_source_reference_is_automatic(self):
        result = evaluate_duplicate(listing(), listing(price=680_000))
        self.assertEqual(result.decision, "automatic")
        self.assertEqual(result.score, 1.0)

    def test_same_property_at_different_prices_is_grouped(self):
        second = listing(
            listing_id="portal-b-999",
            source="Portal B",
            source_reference="999",
            price=665_000,
            address="Rua das Flores 100 - Pituba - Salvador",
        )
        result = evaluate_duplicate(listing(), second)
        self.assertEqual(result.decision, "automatic")
        self.assertGreaterEqual(result.score, 0.92)

    def test_same_condominium_without_strong_evidence_is_not_automatic(self):
        second = listing(
            listing_id="other-unit",
            source="Portal B",
            source_reference="other",
            unit_number="1204",
            latitude=-12.9808,
            longitude=-38.4551,
            photo_hashes=frozenset(),
        )
        result = evaluate_duplicate(listing(photo_hashes=frozenset()), second)
        self.assertNotEqual(result.decision, "automatic")

    def test_conflicting_known_units_require_review(self):
        second = listing(
            listing_id="other-unit-with-reused-photos",
            source="Portal B",
            source_reference="other",
            unit_number="1204",
        )
        result = evaluate_duplicate(listing(), second)
        self.assertNotEqual(result.decision, "automatic")

    def test_incompatible_property_types_are_distinct(self):
        result = evaluate_duplicate(listing(), listing(property_type="house"))
        self.assertEqual(result.decision, "distinct")
        self.assertEqual(result.score, 0.0)


class PriceSelectionTests(unittest.TestCase):
    def test_uses_lowest_current_public_offer(self):
        offers = [
            listing(listing_id="a", price=720_000),
            listing(listing_id="b", source="Portal B", source_reference="b", price=690_000),
            listing(listing_id="c", source="Imobiliária", source_reference="c", price=700_000),
        ]
        result = select_representative_price(offers, now=NOW)
        self.assertEqual(result.listing_id, "b")
        self.assertEqual(result.price, 690_000)
        self.assertFalse(result.requires_review)

    def test_large_price_spread_requires_review(self):
        offers = [listing(listing_id="a", price=600_000), listing(listing_id="b", price=700_000)]
        result = select_representative_price(offers, now=NOW)
        self.assertTrue(result.requires_review)
        self.assertGreater(result.spread_ratio, 0.10)

    def test_stale_offers_are_not_silently_treated_as_current(self):
        stale = listing(last_seen_at=NOW - timedelta(days=120))
        result = select_representative_price([stale], now=NOW)
        self.assertTrue(result.requires_review)
        self.assertEqual(result.strategy, "most_recent_unverified_offer")


class ValidationTests(unittest.TestCase):
    def test_rejects_inconsistent_room_counts(self):
        issues = validate_listing(listing(bedrooms=2, suites=3), now=NOW)
        self.assertIn("suites_gt_bedrooms", {issue.code for issue in issues})

    def test_warns_when_location_is_not_precise(self):
        issues = validate_listing(listing(location_precision="neighborhood"), now=NOW)
        self.assertIn("imprecise_location", {issue.code for issue in issues})


class SearchServiceTests(unittest.TestCase):
    def test_fixture_search_filters_radius_and_consolidates_duplicates(self):
        subject = SearchSubject(
            latitude=-12.981,
            longitude=-38.455,
            municipality="Salvador",
            state_code="BA",
            property_type="apartment",
            transaction_type="sale",
            bedrooms=3,
        )
        result = execute_search(FixtureConnector(), subject, SearchCriteria(radius_meters=5_000))
        self.assertEqual(result["found_count"], 4)
        self.assertEqual(result["candidate_count"], 3)
        self.assertEqual(result["property_count"], 2)
        self.assertFalse(result["sample_sufficiency"]["meets_minimum"])
        self.assertEqual(result["sample_sufficiency"]["minimum_required"], 20)
        self.assertEqual(result["sample_sufficiency"]["shortage"], 18)
        duplicated = next(group for group in result["consolidated"] if len(group["listing_ids"]) == 2)
        self.assertEqual(duplicated["representative_price"]["price"], 690_000)
        self.assertGreater(duplicated["unit_price"], 0)
        self.assertEqual(result["regional_context"]["property_count"], 2)
        self.assertGreater(result["regional_context"]["median_unit_price"], 0)
        self.assertTrue(result["regional_context"]["distance_bands"])
        self.assertTrue(result["approval_required"])

    def test_radius_above_five_kilometers_is_rejected(self):
        subject = SearchSubject(-12.981, -38.455, "Salvador", "BA", "apartment")
        with self.assertRaises(ValueError):
            execute_search(FixtureConnector(), subject, SearchCriteria(radius_meters=5_001))


if __name__ == "__main__":
    unittest.main()
