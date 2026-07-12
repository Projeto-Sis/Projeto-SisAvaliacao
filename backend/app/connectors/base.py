from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from ..domain import Listing


@dataclass(frozen=True, slots=True)
class SearchSubject:
    latitude: float
    longitude: float
    municipality: str
    state_code: str
    property_type: str
    transaction_type: str = "sale"
    bedrooms: int | None = None
    area: float | None = None
    suites: int | None = None
    bathrooms: int | None = None
    parking_spaces: int | None = None


@dataclass(frozen=True, slots=True)
class SearchCriteria:
    radius_meters: int = 5_000


class ListingConnector(Protocol):
    name: str

    def search(self, subject: SearchSubject, criteria: SearchCriteria) -> list[Listing]: ...
