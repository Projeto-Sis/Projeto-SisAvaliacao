import json
import unittest

from fastapi.testclient import TestClient

from app.connectors.base import SearchSubject
from app.connectors.csv_upload import parse_listings_csv
from app.main import app


class CsvUploadConnectorTests(unittest.TestCase):
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

    def test_parse_authorized_csv_with_portuguese_headers(self):
        content = (
            "codigo;fonte;preco;area;latitude;longitude;tipo_imovel;operacao;quartos;banheiros;vagas;endereco\n"
            "A-1;Parceiro Autorizado;750.000;100;-12.9808;-38.4548;Apartamento;Venda;3;2;2;Rua Exemplo, 100\n"
        ).encode("utf-8")

        listings = parse_listings_csv(content, self.subject)

        self.assertEqual(len(listings), 1)
        listing = listings[0]
        self.assertEqual(listing.source, "Parceiro Autorizado")
        self.assertEqual(listing.price, 750000)
        self.assertEqual(listing.area, 100)
        self.assertEqual(listing.property_type, "apartment")
        self.assertEqual(listing.transaction_type, "sale")
        self.assertEqual(listing.bedrooms, 3)

    def test_csv_endpoint_runs_same_search_pipeline(self):
        client = TestClient(app)
        subject = {
            "latitude": -12.981,
            "longitude": -38.455,
            "municipality": "Salvador",
            "state_code": "BA",
            "property_type": "apartment",
            "transaction_type": "sale",
            "bedrooms": 3,
        }
        content = (
            "codigo;fonte;preco;area;latitude;longitude;tipo_imovel;operacao;quartos\n"
            "A-1;Parceiro Autorizado;750000;100;-12.9808;-38.4548;Apartamento;Venda;3\n"
            "A-2;Parceiro Autorizado;600000;80;-13.2000;-38.8000;Apartamento;Venda;3\n"
        ).encode("utf-8")

        response = client.post(
            "/api/v1/search-jobs/csv",
            data={"subject": json.dumps(subject), "radius_meters": "5000"},
            files={"file": ("amostras.csv", content, "text/csv")},
        )

        self.assertEqual(response.status_code, 200, response.text)
        body = response.json()
        self.assertEqual(body["connector"], "csv-autorizado")
        self.assertEqual(body["found_count"], 2)
        self.assertEqual(body["candidate_count"], 1)
        self.assertEqual(body["property_count"], 1)


if __name__ == "__main__":
    unittest.main()
