import unittest
from unittest.mock import patch

from app.url_capture import UrlCaptureError, parse_listing_metadata, validate_listing_url


class UrlCaptureTests(unittest.TestCase):
    def test_rejects_non_portal_and_local_urls(self):
        with self.assertRaises(UrlCaptureError):
            validate_listing_url("http://127.0.0.1:8000/health")
        with self.assertRaises(UrlCaptureError):
            validate_listing_url("https://example.com/anuncio")

    @patch("app.url_capture.socket.getaddrinfo")
    def test_accepts_known_public_portal(self, getaddrinfo):
        getaddrinfo.return_value = [(2, 1, 6, "", ("23.1.2.3", 443))]
        url, source = validate_listing_url("https://www.vivareal.com.br/imovel/123")
        self.assertEqual(source, "Viva Real")
        self.assertEqual(url, "https://www.vivareal.com.br/imovel/123")

    def test_extracts_schema_org_listing_fields(self):
        html = """
        <html><head><script type="application/ld+json">
        {
          "@type": "Apartment",
          "name": "Apartamento real",
          "offers": {"price": "750000"},
          "floorSize": {"value": 100},
          "numberOfBedrooms": 3,
          "numberOfBathroomsTotal": 2,
          "address": {
            "streetAddress": "Rua Teste, 10",
            "addressLocality": "Salvador",
            "addressRegion": "BA"
          },
          "geo": {"latitude": -12.98, "longitude": -38.45}
        }
        </script></head></html>
        """
        result = parse_listing_metadata(html, "https://www.zapimoveis.com.br/imovel/123", "ZAP Imóveis")
        self.assertEqual(result["price"], 750000)
        self.assertEqual(result["area"], 100)
        self.assertEqual(result["bedrooms"], 3)
        self.assertEqual(result["address"], "Rua Teste, 10, Salvador, BA")
        self.assertEqual(result["latitude"], -12.98)


if __name__ == "__main__":
    unittest.main()
