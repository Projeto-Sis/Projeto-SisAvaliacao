from __future__ import annotations

from dataclasses import dataclass
import os


def _as_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "sim", "on"}


@dataclass(frozen=True, slots=True)
class Settings:
    environment: str
    database_url: str | None
    enable_fixture_connector: bool
    meli_access_token: str | None
    meli_client_id: str | None
    meli_client_secret: str | None
    meli_redirect_uri: str | None
    meli_category_id: str
    google_maps_api_key: str | None
    allowed_origins: tuple[str, ...]


def load_settings() -> Settings:
    environment = os.getenv("SISAVALIA_ENV", "development").strip().lower()
    default_fixture = environment == "development"
    origins = tuple(
        origin.strip()
        for origin in os.getenv(
            "SISAVALIA_ALLOWED_ORIGINS",
            "http://127.0.0.1:4173,http://localhost:4173",
        ).split(",")
        if origin.strip()
    )
    return Settings(
        environment=environment,
        database_url=os.getenv("SISAVALIA_DATABASE_URL") or None,
        enable_fixture_connector=_as_bool(
            os.getenv("SISAVALIA_ENABLE_FIXTURE_CONNECTOR"),
            default=default_fixture,
        ),
        meli_access_token=os.getenv("SISAVALIA_MELI_ACCESS_TOKEN") or None,
        meli_client_id=os.getenv("SISAVALIA_MELI_CLIENT_ID") or None,
        meli_client_secret=os.getenv("SISAVALIA_MELI_CLIENT_SECRET") or None,
        meli_redirect_uri=os.getenv("SISAVALIA_MELI_REDIRECT_URI") or None,
        meli_category_id=os.getenv("SISAVALIA_MELI_CATEGORY_ID", "MLB1459").strip(),
        google_maps_api_key=os.getenv("SISAVALIA_GOOGLE_MAPS_API_KEY") or None,
        allowed_origins=origins,
    )
