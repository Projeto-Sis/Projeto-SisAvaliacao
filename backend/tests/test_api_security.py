from dataclasses import replace
import importlib
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient


main = importlib.import_module("app.main")


class ApiSecurityTests(unittest.TestCase):
    def test_mercadolivre_endpoint_refuses_request_without_backend_token(self):
        settings_without_token = replace(main.settings, meli_access_token=None)
        with patch.object(main, "settings", settings_without_token):
            response = TestClient(main.app).post(
                "/api/v1/search-jobs/mercadolivre",
                json={
                    "subject": {
                        "latitude": -12.981,
                        "longitude": -38.455,
                        "municipality": "Salvador",
                        "state_code": "BA",
                        "property_type": "apartment",
                        "transaction_type": "sale",
                        "bedrooms": 3,
                    },
                    "radius_meters": 5000,
                },
            )

        self.assertEqual(response.status_code, 503)
        self.assertEqual(
            response.json()["detail"],
            "Mercado Livre ainda não autorizado no backend.",
        )


if __name__ == "__main__":
    unittest.main()
