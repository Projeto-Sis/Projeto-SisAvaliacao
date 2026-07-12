from __future__ import annotations

import csv
from datetime import datetime, timezone
from io import StringIO
import re
from typing import Any

from .base import SearchCriteria, SearchSubject
from ..domain import Listing, normalized_text


class CsvImportError(ValueError):
    pass


def _key(value: str) -> str:
    return normalized_text(value).replace(" ", "_")


ALIASES = {
    "listing_id": {"id", "codigo", "codigo_anuncio", "listing_id", "id_anuncio"},
    "source": {"fonte", "source", "portal", "origem"},
    "source_reference": {"referencia", "source_reference", "codigo_fonte", "id_fonte"},
    "source_url": {"url", "link", "source_url", "anuncio_url"},
    "price": {"valor", "preco", "price", "valor_anuncio"},
    "area": {"area", "area_privativa", "area_total", "m2", "metragem"},
    "latitude": {"latitude", "lat"},
    "longitude": {"longitude", "lon", "lng"},
    "address": {"endereco", "address", "logradouro"},
    "unit_number": {"unidade", "apartamento", "numero_unidade", "unit_number"},
    "condominium_name": {"condominio", "condominio_nome", "condominium_name"},
    "property_type": {"tipo", "tipo_imovel", "property_type"},
    "transaction_type": {"operacao", "transaction_type", "finalidade"},
    "bedrooms": {"quartos", "dormitorios", "bedrooms"},
    "suites": {"suites", "suítes"},
    "bathrooms": {"banheiros", "bathrooms"},
    "parking_spaces": {"vagas", "garagens", "parking_spaces"},
    "active": {"ativo", "active", "status"},
}


PROPERTY_TYPE_MAP = {
    "apartamento": "apartment",
    "apartment": "apartment",
    "apto": "apartment",
    "casa": "house",
    "house": "house",
    "terreno": "land",
    "land": "land",
    "sala": "office",
    "sala_comercial": "office",
    "office": "office",
    "loja": "store",
    "store": "store",
    "galpao": "warehouse",
    "galpão": "warehouse",
    "warehouse": "warehouse",
}


TRANSACTION_TYPE_MAP = {
    "venda": "sale",
    "sale": "sale",
    "comprar": "sale",
    "aluguel": "rent",
    "locacao": "rent",
    "locação": "rent",
    "rent": "rent",
}


def _value(row: dict[str, str], field: str) -> str | None:
    aliases = {_key(alias) for alias in ALIASES[field]}
    for key, value in row.items():
        if _key(key) in aliases and value is not None and str(value).strip():
            return str(value).strip()
    return None


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
    elif "." in text and re.fullmatch(r"-?\d{1,3}(\.\d{3})+", text):
        text = text.replace(".", "")
    else:
        text = text.replace(",", ".")
    try:
        return float(text)
    except ValueError:
        return None


def _integer(value: Any) -> int | None:
    number = _number(value)
    return int(number) if number is not None else None


def _active(value: str | None) -> bool:
    if value is None:
        return True
    return _key(value) not in {"0", "false", "falso", "nao", "não", "inativo", "inactive", "vendido"}


def _mapped(value: str | None, mapping: dict[str, str], fallback: str) -> str:
    return mapping.get(_key(value or ""), fallback)


def _rows_from_csv(content: bytes) -> list[dict[str, str]]:
    text = content.decode("utf-8-sig")
    sample = text[:2048]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",;|\t")
    except csv.Error:
        dialect = csv.excel
        dialect.delimiter = ";"
    reader = csv.DictReader(StringIO(text), dialect=dialect)
    if not reader.fieldnames:
        raise CsvImportError("CSV sem cabeçalho.")
    return [row for row in reader if any(str(value or "").strip() for value in row.values())]


def parse_listings_csv(content: bytes, subject: SearchSubject) -> list[Listing]:
    rows = _rows_from_csv(content)
    now = datetime.now(timezone.utc)
    listings: list[Listing] = []
    for index, row in enumerate(rows, start=1):
        price = _number(_value(row, "price"))
        area = _number(_value(row, "area"))
        latitude = _number(_value(row, "latitude"))
        longitude = _number(_value(row, "longitude"))
        if price is None or area is None or latitude is None or longitude is None:
            continue
        source = _value(row, "source") or "CSV autorizado"
        source_reference = _value(row, "source_reference") or _value(row, "listing_id") or f"linha-{index}"
        listing_id = _value(row, "listing_id") or f"csv:{source_reference}"
        listings.append(
            Listing(
                listing_id=f"csv:{listing_id}",
                source=source,
                source_reference=source_reference,
                source_url=_value(row, "source_url"),
                price=price,
                area=area,
                collected_at=now,
                last_seen_at=now,
                active=_active(_value(row, "active")),
                source_reliability=0.75,
                property_type=_mapped(_value(row, "property_type"), PROPERTY_TYPE_MAP, subject.property_type),
                transaction_type=_mapped(_value(row, "transaction_type"), TRANSACTION_TYPE_MAP, subject.transaction_type),
                address=_value(row, "address"),
                unit_number=_value(row, "unit_number"),
                condominium_name=_value(row, "condominium_name"),
                latitude=latitude,
                longitude=longitude,
                location_precision="street",
                bedrooms=_integer(_value(row, "bedrooms")),
                suites=_integer(_value(row, "suites")),
                bathrooms=_integer(_value(row, "bathrooms")),
                parking_spaces=_integer(_value(row, "parking_spaces")),
            )
        )
    return listings


class AuthorizedCsvConnector:
    """Base real autorizada enviada pelo avaliador ou fornecedor."""

    name = "csv-autorizado"

    def __init__(self, listings: list[Listing]) -> None:
        self.listings = listings

    def search(self, subject: SearchSubject, criteria: SearchCriteria) -> list[Listing]:
        del subject, criteria
        return self.listings
