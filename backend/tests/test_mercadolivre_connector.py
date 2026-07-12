from datetime import datetime, timezone
from urllib.parse import parse_qs, urlparse
import unittest

from app.connectors.base import SearchCriteria, SearchSubject
from app.connectors.mercadolivre import MercadoLivreConnector


class MercadoLivreConnectorTests(unittest.TestCase):
    def setUp(self):
        self.subject = SearchSubject(
            latitude=-12.981,
            longitude=-38.455,
            municipality="Salvador",
            state_code="BA",
            property_type="apartment",
            transaction_type="sale",
            bedrooms=3,
        )

    def test_requires_oauth_token(self):
        with self.assertRaisesRegex(ValueError, "Token OAuth"):
            MercadoLivreConnector("  ")

    def test_search_uses_geographic_box_and_normalizes_results(self):
        request = {}

        def transport(url, headers, timeout):
            request.update(url=url, headers=headers, timeout=timeout)
            return {
                "results": [
                    {
                        "id": "MLB123",
                        "title": "Apartamento à venda",
                        "price": 750000,
                        "permalink": "https://imovel.mercadolivre.com.br/MLB-123",
                        "thumbnail_id": "photo-123",
                        "location": {
                            "latitude": -12.9808,
                            "longitude": -38.4548,
                            "address_line": "Rua Exemplo, 100",
                            "exact_location": False,
                            "neighborhood": {"name": "Pituba"},
                            "city": {"name": "Salvador"},
                            "state": {"name": "Bahia"},
                        },
                        "attributes": [
                            {"id": "COVERED_AREA", "value_struct": {"number": 100}},
                            {"id": "BEDROOMS", "value_name": "3"},
                            {"id": "SUITES", "value_struct": {"number": 1}},
                            {"id": "FULL_BATHROOMS", "value_name": "2"},
                            {"id": "PARKING_LOTS", "value_name": "2"},
                            {"id": "PROPERTY_TYPE", "value_name": "Apartamento"},
                            {"id": "OPERATION_TYPE", "value_name": "Venda"},
                        ],
                    },
                    {
                        "id": "MLB-NO-AREA",
                        "price": 600000,
                        "location": {"latitude": -12.98, "longitude": -38.45},
                        "attributes": [],
                    },
                ]
            }

        connector = MercadoLivreConnector(
            "token-de-teste",
            transport=transport,
            now=lambda: datetime(2026, 6, 29, tzinfo=timezone.utc),
        )
        listings = connector.search(self.subject, SearchCriteria(radius_meters=5000))

        self.assertEqual(len(listings), 1)
        listing = listings[0]
        self.assertEqual(listing.listing_id, "MLB123")
        self.assertEqual(listing.source, "Mercado Livre")
        self.assertEqual(listing.price, 750000)
        self.assertEqual(listing.area, 100)
        self.assertEqual(listing.bedrooms, 3)
        self.assertEqual(listing.suites, 1)
        self.assertEqual(listing.bathrooms, 2)
        self.assertEqual(listing.parking_spaces, 2)
        self.assertEqual(listing.property_type, "apartment")
        self.assertEqual(listing.transaction_type, "sale")
        self.assertEqual(listing.location_precision, "street")
        self.assertEqual(listing.photo_hashes, frozenset({"meli:photo-123"}))

        query = parse_qs(urlparse(request["url"]).query)
        self.assertEqual(query["category"], ["MLB1459"])
        self.assertEqual(query["limit"], ["50"])
        self.assertRegex(query["item_location"][0], r"^lat:-?\d+\.\d+_-?\d+\.\d+,lon:-?\d+\.\d+_-?\d+\.\d+$")
        self.assertEqual(request["headers"]["Authorization"], "Bearer token-de-teste")
        self.assertEqual(request["timeout"], 20)

    def test_missing_room_attributes_remain_unknown(self):
        def transport(url, headers, timeout):
            return {
                "results": [{
                    "id": "MLB456",
                    "price": 500000,
                    "location": {"latitude": -12.981, "longitude": -38.455},
                    "attributes": [{"id": "TOTAL_AREA", "value_name": "80 m²"}],
                }]
            }

        listing = MercadoLivreConnector("token", transport=transport).search(
            self.subject,
            SearchCriteria(),
        )[0]
        self.assertIsNone(listing.bedrooms)
        self.assertIsNone(listing.suites)
        self.assertIsNone(listing.bathrooms)
        self.assertIsNone(listing.parking_spaces)


if __name__ == "__main__":
    unittest.main()
