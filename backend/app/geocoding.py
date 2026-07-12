from __future__ import annotations

from dataclasses import dataclass
import ssl
import json
import re
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import certifi


SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())


class GeocodingProviderError(RuntimeError):
    """Erro seguro retornado por um provedor de geocodificação."""


@dataclass(frozen=True, slots=True)
class GeocodeResult:
    latitude: float
    longitude: float
    formatted_address: str
    precision: str
    provider: str
    postal_code: str | None = None


def _number(value: Any) -> float | None:
    try:
        number = float(str(value).strip().replace(",", "."))
    except (TypeError, ValueError):
        return None
    return number if -180 <= number <= 180 else None


def _clean(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def address_query(
    street: str | None,
    number: str | None,
    neighborhood: str | None,
    city: str,
    state: str,
    postal_code: str | None,
) -> str:
    street_line = " ".join(part for part in (_clean(street), _clean(number)) if part)
    return ", ".join(
        part
        for part in (
            street_line,
            _clean(neighborhood),
            _clean(city),
            _clean(state).upper(),
            _clean(postal_code),
            "Brasil",
        )
        if part
    )


def _http_json(url: str, headers: dict[str, str] | None = None, timeout: float = 10) -> Any:
    request = Request(url, headers=headers or {}, method="GET")
    with urlopen(request, timeout=timeout, context=SSL_CONTEXT) as response:  # noqa: S310
        return json.loads(response.read().decode("utf-8"))


def google_geocode(query: str, api_key: str, timeout: float = 10) -> GeocodeResult | None:
    params = urlencode({"address": query, "key": api_key, "region": "br", "language": "pt-BR"})
    payload = _http_json(f"https://maps.googleapis.com/maps/api/geocode/json?{params}", timeout=timeout)
    status = str(payload.get("status") or "UNKNOWN_ERROR")
    if status == "ZERO_RESULTS":
        return None
    if status != "OK":
        provider_message = str(payload.get("error_message") or "").strip()
        suffix = f": {provider_message}" if provider_message else ""
        raise GeocodingProviderError(f"Google Maps recusou a geocodificação ({status}){suffix}")
    if not payload.get("results"):
        return None
    first = payload["results"][0]
    postal_code = next(
        (
            str(component.get("long_name") or "").strip()
            for component in first.get("address_components", [])
            if "postal_code" in component.get("types", [])
        ),
        None,
    )
    location = first.get("geometry", {}).get("location", {})
    latitude = _number(location.get("lat"))
    longitude = _number(location.get("lng"))
    if latitude is None or longitude is None:
        return None
    location_type = first.get("geometry", {}).get("location_type") or "unknown"
    return GeocodeResult(
        latitude=latitude,
        longitude=longitude,
        formatted_address=first.get("formatted_address") or query,
        precision=str(location_type).lower(),
        provider="google",
        postal_code=postal_code or None,
    )


def nominatim_geocode(query: str, timeout: float = 10) -> GeocodeResult | None:
    params = urlencode(
        {"q": query, "format": "jsonv2", "limit": "1", "countrycodes": "br", "addressdetails": "1"}
    )
    payload = _http_json(
        f"https://nominatim.openstreetmap.org/search?{params}",
        headers={"User-Agent": "SISAVALIA local geocoder"},
        timeout=timeout,
    )
    first = payload[0] if isinstance(payload, list) and payload else None
    if not first:
        return None
    latitude = _number(first.get("lat"))
    longitude = _number(first.get("lon"))
    if latitude is None or longitude is None:
        return None
    return GeocodeResult(
        latitude=latitude,
        longitude=longitude,
        formatted_address=first.get("display_name") or query,
        precision=str(first.get("type") or first.get("class") or "unknown"),
        provider="nominatim",
        postal_code=str(first.get("address", {}).get("postcode") or "").strip() or None,
    )


def geocode_address(
    query: str,
    *,
    google_api_key: str | None = None,
    timeout: float = 10,
) -> GeocodeResult | None:
    cleaned = _clean(query)
    if not cleaned:
        return None
    if google_api_key:
        google_result = google_geocode(cleaned, google_api_key, timeout=timeout)
        if google_result:
            return google_result
    return nominatim_geocode(cleaned, timeout=timeout)
