import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.geocoding import GeocodeResult, GeocodingProviderError, address_query
from app.main import app


class GeocodingTests(unittest.TestCase):
    def test_address_query_uses_number_and_postal_code(self):
        query = address_query(
            "Avenida Exemplo",
            "2452",
            "Rio Vermelho",
            "Salvador",
            "ba",
            "41940-060",
        )

        self.assertEqual(
            query,
            "Avenida Exemplo 2452, Rio Vermelho, Salvador, BA, 41940-060, Brasil",
        )

    @patch("app.main.geocode_address")
    def test_endpoint_returns_coordinates(self, geocode_mock):
        geocode_mock.return_value = GeocodeResult(
            latitude=-13.012788,
            longitude=-38.490173,
            formatted_address="Avenida Exemplo, Salvador - BA",
            precision="rooftop",
            provider="google",
            postal_code="41940-060",
        )
        client = TestClient(app)

        response = client.post(
            "/api/v1/geocode/address",
            json={
                "street": "Avenida Exemplo",
                "number": "2452",
                "neighborhood": "Rio Vermelho",
                "city": "Salvador",
                "state": "BA",
                "postal_code": "41940-060",
            },
        )

        self.assertEqual(response.status_code, 200, response.text)
        body = response.json()
        self.assertEqual(body["latitude"], -13.012788)
        self.assertEqual(body["longitude"], -38.490173)
        self.assertEqual(body["postal_code"], "41940-060")
        self.assertIn("2452", body["query"])

    @patch("app.main.geocode_address")
    def test_endpoint_exposes_safe_google_configuration_error(self, geocode_mock):
        geocode_mock.side_effect = GeocodingProviderError(
            "Google Maps recusou a geocodificação (REQUEST_DENIED): billing disabled"
        )
        client = TestClient(app)

        response = client.post(
            "/api/v1/geocode/address",
            json={"city": "Salvador", "state": "BA"},
        )

        self.assertEqual(response.status_code, 502)
        self.assertIn("REQUEST_DENIED", response.json()["detail"])


if __name__ == "__main__":
    unittest.main()
