from urllib.parse import parse_qs, urlparse
import unittest

from app.oauth import MercadoLivreOAuth, OAuthError


class MercadoLivreOAuthTests(unittest.TestCase):
    def setUp(self):
        self.now = [1_000.0]
        self.requests = []
        self.responses = [{
            "access_token": "access-1",
            "refresh_token": "refresh-1",
            "expires_in": 120,
        }]

        def transport(url, body, headers, timeout):
            self.requests.append((url, parse_qs(body.decode()), headers, timeout))
            return self.responses.pop(0)

        self.oauth = MercadoLivreOAuth(
            "app-id",
            "segredo",
            "https://exemplo.ngrok-free.dev/api/v1/oauth/mercadolivre/callback",
            transport=transport,
            clock=lambda: self.now[0],
        )

    def test_authorization_and_code_exchange_use_state_and_pkce(self):
        authorization_url = self.oauth.authorization_url()
        query = parse_qs(urlparse(authorization_url).query)

        self.assertEqual(query["client_id"], ["app-id"])
        self.assertEqual(query["response_type"], ["code"])
        self.assertEqual(query["code_challenge_method"], ["S256"])
        self.assertTrue(query["state"][0])
        self.assertTrue(query["code_challenge"][0])

        self.oauth.exchange_code("codigo-unico", query["state"][0])
        token_request = self.requests[0][1]
        self.assertEqual(token_request["grant_type"], ["authorization_code"])
        self.assertEqual(token_request["code"], ["codigo-unico"])
        self.assertEqual(token_request["client_secret"], ["segredo"])
        self.assertTrue(token_request["code_verifier"][0])
        self.assertEqual(self.oauth.access_token(), "access-1")

    def test_state_is_single_use(self):
        state = parse_qs(urlparse(self.oauth.authorization_url()).query)["state"][0]
        self.oauth.exchange_code("codigo", state)
        with self.assertRaisesRegex(OAuthError, "inválida ou expirada"):
            self.oauth.exchange_code("codigo-repetido", state)

    def test_expired_access_token_is_refreshed(self):
        state = parse_qs(urlparse(self.oauth.authorization_url()).query)["state"][0]
        self.oauth.exchange_code("codigo", state)
        self.responses.append({
            "access_token": "access-2",
            "refresh_token": "refresh-2",
            "expires_in": 3600,
        })
        self.now[0] += 70

        self.assertEqual(self.oauth.access_token(), "access-2")
        refresh_request = self.requests[1][1]
        self.assertEqual(refresh_request["grant_type"], ["refresh_token"])
        self.assertEqual(refresh_request["refresh_token"], ["refresh-1"])

    def test_requires_https_redirect(self):
        oauth = MercadoLivreOAuth("id", "secret", "http://localhost/callback")
        with self.assertRaisesRegex(OAuthError, "HTTPS"):
            oauth.authorization_url()


if __name__ == "__main__":
    unittest.main()
