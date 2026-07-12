import unittest

from fastapi.testclient import TestClient

from app.main import app


class SearchSourceTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_lists_configured_sources(self):
        response = self.client.get("/api/v1/search-sources")

        self.assertEqual(response.status_code, 200, response.text)
        body = response.json()
        source_ids = {source["id"] for source in body["sources"]}
        self.assertIn("fixture", source_ids)
        self.assertIn("mercadolivre", source_ids)
        self.assertIn("csv_upload", source_ids)
        self.assertIn("olx", source_ids)
        self.assertIn("zap", source_ids)
        self.assertIn("vivareal", source_ids)
        self.assertIn("quintoandar", source_ids)

    def test_portal_source_requires_authorized_access(self):
        response = self.client.post(
            "/api/v1/search-jobs/portal/olx",
            json={
                "subject": {
                    "latitude": -12.981,
                    "longitude": -38.455,
                    "municipality": "Salvador",
                    "state_code": "BA",
                    "property_type": "apartment",
                    "transaction_type": "sale",
                },
                "radius_meters": 5000,
            },
        )

        self.assertEqual(response.status_code, 501, response.text)
        self.assertIn("API, feed autorizado ou contrato", response.json()["detail"])


if __name__ == "__main__":
    unittest.main()
