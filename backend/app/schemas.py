from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, HttpUrl


class ListingInput(BaseModel):
    listing_id: str = Field(min_length=1, max_length=200)
    source: str = Field(min_length=1, max_length=200)
    source_reference: str = Field(default="", max_length=300)
    source_url: HttpUrl | None = None
    price: float
    area: float
    collected_at: datetime
    last_seen_at: datetime
    active: bool = True
    source_reliability: float = Field(default=0.5, ge=0, le=1)
    property_type: str = "apartment"
    transaction_type: str = "sale"
    address: str | None = None
    unit_number: str | None = None
    condominium_name: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    location_precision: Literal["exact", "street", "condominium", "neighborhood", "city", "unknown"] = "unknown"
    bedrooms: int | None = Field(default=None, ge=0)
    suites: int | None = Field(default=None, ge=0)
    bathrooms: int | None = Field(default=None, ge=0)
    parking_spaces: int | None = Field(default=None, ge=0)
    photo_hashes: list[str] = Field(default_factory=list)


class DuplicateRequest(BaseModel):
    first: ListingInput
    second: ListingInput


class ConsolidationRequest(BaseModel):
    listings: list[ListingInput] = Field(min_length=1)


class ValidationResponse(BaseModel):
    valid: bool
    issues: list[dict[str, str]]


class GeocodeRequest(BaseModel):
    street: str | None = Field(default=None, max_length=200)
    number: str | None = Field(default=None, max_length=40)
    neighborhood: str | None = Field(default=None, max_length=160)
    city: str = Field(min_length=2, max_length=160)
    state: str = Field(min_length=2, max_length=2)
    postal_code: str | None = Field(default=None, max_length=12)


class GeocodeResponse(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    formatted_address: str
    precision: str
    provider: str
    query: str
    postal_code: str | None = None


class SearchSubjectInput(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    municipality: str = Field(min_length=2, max_length=160)
    state_code: str = Field(min_length=2, max_length=2)
    property_type: str = Field(min_length=2, max_length=80)
    transaction_type: Literal["sale", "rent"] = "sale"
    bedrooms: int | None = Field(default=None, ge=0, le=100)
    area: float | None = Field(default=None, gt=0, le=100_000)
    suites: int | None = Field(default=None, ge=0, le=100)
    bathrooms: int | None = Field(default=None, ge=0, le=100)
    parking_spaces: int | None = Field(default=None, ge=0, le=100)


class FixtureSearchRequest(BaseModel):
    subject: SearchSubjectInput
    radius_meters: int = Field(default=5_000, ge=100, le=5_000)


class ApprovalRequest(BaseModel):
    location: int = Field(ge=1, le=3)
    standard: int = Field(ge=1, le=3)
    conservation: int = Field(ge=1, le=3)
    reason: str = Field(min_length=3, max_length=1000)
    reviewer: str = Field(min_length=2, max_length=200)


class RejectionRequest(BaseModel):
    reason: str = Field(min_length=3, max_length=1000)
    reviewer: str = Field(min_length=2, max_length=200)


class UrlCaptureRequest(BaseModel):
    url: HttpUrl
