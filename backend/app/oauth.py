from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from hashlib import sha256
import base64
import certifi
import json
import secrets
import ssl
from threading import Lock
import time
from typing import Any
from urllib.parse import urlencode
from urllib.error import HTTPError
from urllib.request import Request, urlopen


TokenTransport = Callable[[str, bytes, dict[str, str], float], dict[str, Any]]
SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())


class OAuthError(RuntimeError):
    pass


def _default_token_transport(
    url: str,
    body: bytes,
    headers: dict[str, str],
    timeout: float,
) -> dict[str, Any]:
    request = Request(url, data=body, headers=headers, method="POST")
    with urlopen(request, timeout=timeout, context=SSL_CONTEXT) as response:  # noqa: S310
        return json.loads(response.read().decode("utf-8"))


@dataclass(slots=True)
class _AuthorizationAttempt:
    verifier: str
    expires_at: float


@dataclass(slots=True)
class _TokenSet:
    access_token: str
    refresh_token: str | None
    expires_at: float
    scopes: tuple[str, ...]


class MercadoLivreOAuth:
    authorization_endpoint = "https://auth.mercadolivre.com.br/authorization"
    token_endpoint = "https://api.mercadolibre.com/oauth/token"

    def __init__(
        self,
        client_id: str | None,
        client_secret: str | None,
        redirect_uri: str | None,
        *,
        transport: TokenTransport | None = None,
        clock: Callable[[], float] | None = None,
        timeout_seconds: float = 20,
    ) -> None:
        self.client_id = (client_id or "").strip()
        self.client_secret = (client_secret or "").strip()
        self.redirect_uri = (redirect_uri or "").strip()
        self.transport = transport or _default_token_transport
        self.clock = clock or time.time
        self.timeout_seconds = timeout_seconds
        self._attempts: dict[str, _AuthorizationAttempt] = {}
        self._tokens: _TokenSet | None = None
        self._lock = Lock()

    @property
    def configured(self) -> bool:
        return bool(self.client_id and self.client_secret and self.redirect_uri)

    @property
    def authorized(self) -> bool:
        return self._tokens is not None

    @property
    def scopes(self) -> tuple[str, ...]:
        return self._tokens.scopes if self._tokens else ()

    def _require_configuration(self) -> None:
        if not self.configured:
            raise OAuthError("OAuth do Mercado Livre ainda não foi configurado no backend.")
        if not self.redirect_uri.startswith("https://"):
            raise OAuthError("A URL de retorno do Mercado Livre deve usar HTTPS.")

    def authorization_url(self) -> str:
        self._require_configuration()
        now = self.clock()
        state = secrets.token_urlsafe(32)
        verifier = secrets.token_urlsafe(64)
        challenge = base64.urlsafe_b64encode(sha256(verifier.encode()).digest()).rstrip(b"=").decode()
        with self._lock:
            self._attempts = {
                key: attempt
                for key, attempt in self._attempts.items()
                if attempt.expires_at > now
            }
            self._attempts[state] = _AuthorizationAttempt(verifier=verifier, expires_at=now + 600)
        query = urlencode(
            {
                "response_type": "code",
                "client_id": self.client_id,
                "redirect_uri": self.redirect_uri,
                "state": state,
                "code_challenge": challenge,
                "code_challenge_method": "S256",
            }
        )
        return f"{self.authorization_endpoint}?{query}"

    def exchange_code(self, code: str, state: str) -> None:
        self._require_configuration()
        now = self.clock()
        with self._lock:
            attempt = self._attempts.pop(state, None)
        if attempt is None or attempt.expires_at <= now:
            raise OAuthError("Autorização inválida ou expirada. Inicie o processo novamente.")
        if not code.strip():
            raise OAuthError("O Mercado Livre não retornou o código de autorização.")
        payload = self._request_token(
            {
                "grant_type": "authorization_code",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "code": code.strip(),
                "redirect_uri": self.redirect_uri,
                "code_verifier": attempt.verifier,
            }
        )
        self._save_tokens(payload)

    def access_token(self) -> str | None:
        with self._lock:
            tokens = self._tokens
        if tokens is None:
            return None
        if tokens.expires_at > self.clock() + 60:
            return tokens.access_token
        if not tokens.refresh_token:
            return None
        payload = self._request_token(
            {
                "grant_type": "refresh_token",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "refresh_token": tokens.refresh_token,
            }
        )
        self._save_tokens(payload, fallback_refresh_token=tokens.refresh_token)
        with self._lock:
            return self._tokens.access_token if self._tokens else None

    def _request_token(self, fields: dict[str, str]) -> dict[str, Any]:
        try:
            return self.transport(
                self.token_endpoint,
                urlencode(fields).encode(),
                {
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                self.timeout_seconds,
            )
        except HTTPError as exc:
            error_code = ""
            try:
                payload = json.loads(exc.read().decode("utf-8"))
                error_code = str(payload.get("error") or payload.get("code") or "").lower()
            except (json.JSONDecodeError, UnicodeDecodeError):
                pass
            if error_code in {"invalid_client", "unauthorized_client"}:
                message = "O Mercado Livre recusou o Client ID ou o Client Secret."
            elif error_code in {"invalid_grant", "invalid_authorization_code"}:
                message = "O código de autorização expirou, já foi usado ou a URL de retorno diverge."
            elif error_code == "invalid_request":
                message = "O Mercado Livre recusou os parâmetros do pedido de token."
            else:
                message = f"O Mercado Livre recusou o pedido de token (HTTP {exc.code})."
            raise OAuthError(message) from exc
        except Exception as exc:
            raise OAuthError("Não foi possível concluir a autenticação com o Mercado Livre.") from exc

    def _save_tokens(self, payload: dict[str, Any], fallback_refresh_token: str | None = None) -> None:
        access_token = str(payload.get("access_token") or "").strip()
        if not access_token:
            raise OAuthError("Resposta de autenticação sem token de acesso.")
        refresh_token = str(payload.get("refresh_token") or fallback_refresh_token or "").strip() or None
        raw_scope = payload.get("scope") or ""
        scopes = tuple(sorted({scope for scope in str(raw_scope).split() if scope}))
        try:
            expires_in = max(int(payload.get("expires_in") or 0), 60)
        except (TypeError, ValueError) as exc:
            raise OAuthError("Resposta de autenticação com validade inválida.") from exc
        with self._lock:
            self._tokens = _TokenSet(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_at=self.clock() + expires_in,
                scopes=scopes,
            )
