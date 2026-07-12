import os
import unittest


DATABASE_URL = os.getenv("SISAVALIA_DATABASE_URL")


@unittest.skipUnless(DATABASE_URL, "SISAVALIA_DATABASE_URL não configurada")
class ApiDatabaseIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from fastapi.testclient import TestClient
        from app.main import app

        cls.client = TestClient(app)

    def test_fixture_search_persists_job_and_listings(self):
        response = self.client.post(
            "/api/v1/search-jobs/fixture",
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
        self.assertEqual(response.status_code, 200, response.text)
        body = response.json()
        self.assertEqual(body["persistence"], "postgresql")
        self.assertIsNotNone(body["job_id"])
        self.assertEqual(body["candidate_count"], 3)
        self.assertEqual(body["property_count"], 2)
        self.assertTrue(body["approval_required"])
        self.assertEqual(len(body["review_groups"]), 2)

        job_id = body["job_id"]
        review = self.client.get(f"/api/v1/search-jobs/{job_id}/review")
        self.assertEqual(review.status_code, 200, review.text)
        groups = review.json()["groups"]
        self.assertEqual(len(groups), 2)
        self.assertTrue(all(group["review_status"] == "pending" for group in groups))

        approved_group = groups[0]
        approval = self.client.post(
            f"/api/v1/search-jobs/{job_id}/properties/{approved_group['property_id']}/approve",
            json={
                "location": 2,
                "standard": 2,
                "conservation": 2,
                "reason": "Amostra comparável revisada no teste de integração.",
                "reviewer": "Teste SISAVALIA",
            },
        )
        self.assertEqual(approval.status_code, 200, approval.text)
        self.assertEqual(approval.json()["status"], "approved")

        rejected_group = groups[1]
        rejection = self.client.post(
            f"/api/v1/search-jobs/{job_id}/properties/{rejected_group['property_id']}/reject",
            json={
                "reason": "Amostra rejeitada para validar a trilha de auditoria.",
                "reviewer": "Teste SISAVALIA",
            },
        )
        self.assertEqual(rejection.status_code, 200, rejection.text)
        self.assertEqual(rejection.json()["status"], "rejected")

        approved = self.client.get(f"/api/v1/search-jobs/{job_id}/approved-samples")
        self.assertEqual(approved.status_code, 200, approved.text)
        samples = approved.json()["samples"]
        self.assertEqual(len(samples), 1)
        self.assertEqual(samples[0]["location"], 2)


if __name__ == "__main__":
    unittest.main()
