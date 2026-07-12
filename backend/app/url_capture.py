from __future__ import annotations

from html.parser import HTMLParser
import ipaddress
import json
import re
import socket
from typing import Any
from urllib.parse import urlparse
from urllib.request import Request, urlopen

import certifi
import ssl


SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
MAX_PAGE_BYTES = 2_000_000
ALLOWED_SOURCES = {
    "olx.com.br": "OLX",
    "zapimoveis.com.br": "ZAP Imóveis",
    "vivareal.com.br": "Viva Real",
    "quintoandar.com.br": "QuintoAndar",
}


class UrlCaptureError(ValueError):
    pass


def _source_for_host(host: str) -> str | None:
    normalized = host.lower().rstrip(".")
    return next(
        (label for domain, label in ALLOWED_SOURCES.items() if normalized == domain or normalized.endswith(f".{domain}")),
        None,
    )


def validate_listing_url(url: str) -> tuple[str, str]:
    parsed = urlparse(url.strip())
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        raise UrlCaptureError("Informe uma URL HTTPS válida de um portal permitido.")
    source = _source_for_host(parsed.hostname)
    if not source:
        raise UrlCaptureError("URL permitida apenas para OLX, ZAP, Viva Real ou QuintoAndar.")
    try:
        addresses = socket.getaddrinfo(parsed.hostname, 443, type=socket.SOCK_STREAM)
    except OSError as exc:
        raise UrlCaptureError("Não foi possível localizar o portal informado.") from exc
    for address in addresses:
        ip = ipaddress.ip_address(address[4][0])
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
            raise UrlCaptureError("O endereço informado não é um portal público válido.")
    return parsed.geturl(), source


class _MetadataParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.meta: dict[str, str] = {}
        self.json_ld: list[str] = []
        self._json_script = False
        self._buffer: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = {key.lower(): value or "" for key, value in attrs}
        if tag.lower() == "meta":
            key = (attributes.get("property") or attributes.get("name") or "").lower()
            if key and attributes.get("content"):
                self.meta[key] = attributes["content"].strip()
        if tag.lower() == "script" and "ld+json" in attributes.get("type", "").lower():
            self._json_script = True
            self._buffer = []

    def handle_data(self, data: str) -> None:
        if self._json_script:
            self._buffer.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "script" and self._json_script:
            self.json_ld.append("".join(self._buffer))
            self._json_script = False
            self._buffer = []


def _objects(value: Any):
    if isinstance(value, dict):
        yield value
        for nested in value.values():
            yield from _objects(nested)
    elif isinstance(value, list):
        for nested in value:
            yield from _objects(nested)


def _number(value: Any) -> float | None:
    if isinstance(value, dict):
        value = value.get("value") or value.get("amount")
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return float(value)
    text = re.sub(r"[^0-9,.-]", "", str(value or "").strip())
    if "," in text and "." in text:
        text = text.replace(".", "").replace(",", ".")
    elif "," in text:
        text = text.replace(",", ".")
    elif re.fullmatch(r"-?\d{1,3}(\.\d{3})+", text):
        text = text.replace(".", "")
    try:
        return float(text)
    except (TypeError, ValueError):
        return None


def _integer(value: Any) -> int | None:
    number = _number(value)
    return int(number) if number is not None else None


def _address(value: Any) -> str | None:
    if isinstance(value, str):
        return value.strip() or None
    if not isinstance(value, dict):
        return None
    parts = [
        value.get("streetAddress"),
        value.get("addressLocality"),
        value.get("addressRegion"),
        value.get("postalCode"),
    ]
    text = ", ".join(str(part).strip() for part in parts if part)
    return text or None


def parse_listing_metadata(html: str, url: str, source: str) -> dict[str, Any]:
    parser = _MetadataParser()
    parser.feed(html)
    structured: list[dict[str, Any]] = []
    for raw in parser.json_ld:
        try:
            structured.extend(_objects(json.loads(raw)))
        except (json.JSONDecodeError, TypeError):
            continue

    def first(*keys: str) -> Any:
        for item in structured:
            for key in keys:
                if item.get(key) not in (None, ""):
                    return item[key]
        return None

    offers = first("offers")
    price = None
    if isinstance(offers, dict):
        price = _number(offers.get("price") or offers.get("lowPrice"))
    price = price or _number(first("price", "lowPrice")) or _number(parser.meta.get("product:price:amount"))
    geo = first("geo")
    latitude = _number(geo.get("latitude")) if isinstance(geo, dict) else None
    longitude = _number(geo.get("longitude")) if isinstance(geo, dict) else None
    title = first("name", "headline") or parser.meta.get("og:title")
    return {
        "source": source,
        "source_url": url,
        "title": str(title).strip() if title else None,
        "price": price,
        "area": _number(first("floorSize", "area", "areaServed")),
        "address": _address(first("address")),
        "property_type": str(first("@type") or "").strip() or None,
        "bedrooms": _integer(first("numberOfBedrooms", "numberOfRooms")),
        "suites": _integer(first("numberOfSuites")),
        "bathrooms": _integer(first("numberOfBathroomsTotal", "numberOfBathrooms")),
        "parking_spaces": _integer(first("numberOfParkingSpaces")),
        "latitude": latitude,
        "longitude": longitude,
        "extraction": "structured_metadata",
    }


def capture_listing_url(url: str, timeout: float = 12) -> dict[str, Any]:
    safe_url, source = validate_listing_url(url)
    request = Request(
        safe_url,
        headers={"User-Agent": "Mozilla/5.0 (compatible; SISAVALIA/1.0; coleta assistida)"},
        method="GET",
    )
    try:
        with urlopen(request, timeout=timeout, context=SSL_CONTEXT) as response:  # noqa: S310
            final_url, final_source = validate_listing_url(response.geturl())
            content_type = response.headers.get_content_type()
            if content_type not in {"text/html", "application/xhtml+xml"}:
                raise UrlCaptureError("O endereço não retornou uma página de anúncio.")
            html = response.read(MAX_PAGE_BYTES + 1)
            if len(html) > MAX_PAGE_BYTES:
                raise UrlCaptureError("A página do anúncio excedeu o limite seguro de leitura.")
    except UrlCaptureError:
        raise
    except Exception as exc:
        raise UrlCaptureError("O portal bloqueou ou não disponibilizou os metadados do anúncio.") from exc
    return parse_listing_metadata(html.decode("utf-8", errors="replace"), final_url, final_source)
