from __future__ import annotations

from collections.abc import Callable
from datetime import datetime, timezone
from math import cos, radians
import certifi
import json
import re
import ssl
from typing import Any
from urllib.parse import urlencode
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from .base import SearchCriteria, SearchSubject
from ..domain import Listing, normalized_text


JsonTransport = Callable[[str, dict[str, str], float], dict[str, Any]]
SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())


class MercadoLivreAPIError(RuntimeError):
    def __init__(self, status_code: int, api_code: str = "") -> None:
        super().__init__(f"Mercado Livre API HTTP {status_code}")
        self.status_code = status_code
        self.api_code = api_code


def _default_transport(url: str, headers: dict[str, str], timeout: float) -> dict[str, Any]:
    request = Request(url, headers=headers, method="GET")
    try:
        with urlopen(request, timeout=timeout, context=SSL_CONTEXT) as response:  # noqa: S310
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        api_code = ""
        try:
            payload = json.loads(exc.read().decode("utf-8"))
            api_code = str(payload.get("error") or payload.get("code") or "")
        except (json.JSONDecodeError, UnicodeDecodeError):
            pass
        raise MercadoLivreAPIError(exc.code, api_code) from exc


def _number(value: Any) -> float | None:
    if value is None or isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip().replace(" ", "")
    text = re.sub(r"[^0-9,.-]", "", text)
    if not text:
        return None
    if "," in text and "." in text:
        text = text.replace(".", "").replace(",", ".")
    else:
        text = text.replace(",", ".")
    try:
        return float(text)
    except ValueError:
        return None


def _integer(value: Any) -> int | None:
    number = _number(value)
    return int(number) if number is not None else None


def _attribute(item: dict[str, Any], aliases: set[str]) -> Any:
    normalized_aliases = {normalized_text(alias).replace(" ", "_") for alias in aliases}
    for attribute in item.get("attributes") or []:
        attribute_id = normalized_text(attribute.get("id")).replace(" ", "_")
        attribute_name = normalized_text(attribute.get("name")).replace(" ", "_")
        if attribute_id not in normalized_aliases and attribute_name not in normalized_aliases:
            continue
        value_struct = attribute.get("value_struct") or {}
        if value_struct.get("number") is not None:
            return value_struct["number"]
        if attribute.get("value_name") is not None:
            return attribute["value_name"]
        values = attribute.get("values") or []
        if values:
            first = values[0]
            return (first.get("struct") or {}).get("number") or first.get("name")
    return None


def _coordinates(item: dict[str, Any]) -> tuple[float | None, float | None]:
    location = item.get("location") or {}
    address = item.get("address") or {}
    latitude = _number(location.get("latitude") or address.get("latitude"))
    longitude = _number(location.get("longitude") or address.get("longitude"))
    return latitude, longitude


def _address(item: dict[str, Any]) -> tuple[str | None, str | None, str | None]:
    location = item.get("location") or {}
    address = item.get("address") or {}
    neighborhood = location.get("neighborhood") or {}
    city = location.get("city") or {}
    state = location.get("state") or {}
    address_line = location.get("address_line") or address.get("address_line")
    parts = [
        address_line,
        neighborhood.get("name") or address.get("area_name"),
        city.get("name") or address.get("city_name"),
        state.get("name") or address.get("state_name"),
    ]
    rendered = ", ".join(str(part).strip() for part in parts if part)
    return rendered or None, neighborhood.get("name") or address.get("area_name"), address_line


def _property_type(item: dict[str, Any], fallback: str) -> str:
    raw = normalized_text(
        _attribute(item, {"PROPERTY_TYPE", "TIPO_DE_IMOVEL", "Tipo de imóvel"}) or fallback
    )
    mappings = {
        "apartamento": "apartment",
        "apartment": "apartment",
        "casa": "house",
        "house": "house",
        "terreno": "land",
        "land": "land",
        "sala comercial": "office",
        "office": "office",
        "loja": "store",
        "store": "store",
        "galpao": "warehouse",
        "warehouse": "warehouse",
    }
    return mappings.get(raw, fallback)


def _transaction_type(item: dict[str, Any], fallback: str) -> str:
    raw = normalized_text(
        _attribute(item, {"OPERATION", "OPERATION_TYPE", "TIPO_DE_OPERACAO", "Operação"})
        or fallback
    )
    mappings = {
        "venda": "sale",
        "sale": "sale",
        "aluguel": "rent",
        "locacao": "rent",
        "rent": "rent",
    }
    return mappings.get(raw, fallback)


class MercadoLivreConnector:
    """Busca imóveis pela API oficial do Mercado Livre, sempre com token OAuth."""

    name = "mercado-livre"
    api_base_url = "https://api.mercadolibre.com"

    def __init__(
        self,
        access_token: str,
        category_id: str = "MLB1459",
        limit: int = 50,
        timeout_seconds: float = 20,
        transport: JsonTransport | None = None,
        now: Callable[[], datetime] | None = None,
    ) -> None:
        if not access_token.strip():
            raise ValueError("Token OAuth do Mercado Livre não configurado.")
        self.access_token = access_token.strip()
        self.category_id = category_id
        self.limit = min(max(limit, 1), 50)
        self.timeout_seconds = timeout_seconds
        self.transport = transport or _default_transport
        self.now = now or (lambda: datetime.now(timezone.utc))

    @staticmethod
    def geographic_box(subject: SearchSubject, radius_meters: int) -> tuple[float, float, float, float]:
        latitude_delta = radius_meters / 111_320
        longitude_scale = max(abs(cos(radians(subject.latitude))), 0.01)
        longitude_delta = radius_meters / (111_320 * longitude_scale)
        return (
            subject.latitude - latitude_delta,
            subject.latitude + latitude_delta,
            subject.longitude - longitude_delta,
            subject.longitude + longitude_delta,
        )

    def search(self, subject: SearchSubject, criteria: SearchCriteria) -> list[Listing]:
        min_lat, max_lat, min_lon, max_lon = self.geographic_box(subject, criteria.radius_meters)
        params = {
            "item_location": f"lat:{min_lat:.7f}_{max_lat:.7f},lon:{min_lon:.7f}_{max_lon:.7f}",
            "category": self.category_id,
            "limit": str(self.limit),
            "offset": "0",
        }
        url = f"{self.api_base_url}/sites/MLB/search?{urlencode(params)}"
        payload = self.transport(
            url,
            {"Authorization": f"Bearer {self.access_token}", "Accept": "application/json"},
            self.timeout_seconds,
        )
        collected_at = self.now()
        listings = [self._normalize(item, subject, collected_at) for item in payload.get("results") or []]
        return [
            listing
            for listing in listings
            if listing.listing_id
            and listing.price > 0
            and listing.area > 0
            and listing.latitude is not None
            and listing.longitude is not None
        ]

    def _normalize(self, item: dict[str, Any], subject: SearchSubject, collected_at: datetime) -> Listing:
        latitude, longitude = _coordinates(item)
        address, _, address_line = _address(item)
        location = item.get("location") or {}
        area = _number(
            _attribute(
                item,
                {"COVERED_AREA", "PRIVATE_AREA", "BUILT_AREA", "Área construída", "Área privativa"},
            )
        ) or _number(_attribute(item, {"TOTAL_AREA", "Área total"})) or 0
        thumbnail_id = item.get("thumbnail_id") or item.get("thumbnail")
        picture_fingerprints = frozenset({f"meli:{thumbnail_id}"}) if thumbnail_id else frozenset()
        return Listing(
            listing_id=str(item.get("id") or ""),
            source="Mercado Livre",
            source_reference=str(item.get("id") or ""),
            source_url=item.get("permalink"),
            price=_number(item.get("price")) or 0,
            area=area,
            collected_at=collected_at,
            last_seen_at=collected_at,
            active=True,
            source_reliability=0.85,
            property_type=_property_type(item, subject.property_type),
            transaction_type=_transaction_type(item, subject.transaction_type),
            address=address,
            condominium_name=_attribute(item, {"CONDOMINIUM_NAME", "CONDOMINIO", "Condomínio"}),
            latitude=latitude,
            longitude=longitude,
            location_precision=(
                "exact"
                if location.get("exact_location") is True and latitude is not None
                else "street"
                if address_line and latitude is not None
                else "neighborhood"
            ),
            bedrooms=_integer(_attribute(item, {"BEDROOMS", "DORMITORIES", "Quartos"})),
            suites=_integer(_attribute(item, {"SUITES", "Suítes"})),
            bathrooms=_integer(_attribute(item, {"FULL_BATHROOMS", "BATHROOMS", "Banheiros"})),
            parking_spaces=_integer(_attribute(item, {"PARKING_LOTS", "PARKING_SPACES", "Vagas"})),
            photo_hashes=picture_fingerprints,
        )
