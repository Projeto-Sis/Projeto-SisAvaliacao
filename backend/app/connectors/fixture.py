from __future__ import annotations

from datetime import datetime
import json
from pathlib import Path

from .base import SearchCriteria, SearchSubject
from ..domain import Listing


DEFAULT_FIXTURE = Path(__file__).resolve().parent.parent.parent / "fixtures" / "salvador_listings.json"


class FixtureConnector:
    """Fonte local e determinística; nunca acessa a internet."""

    name = "fixture-local"

    def __init__(self, path: Path = DEFAULT_FIXTURE) -> None:
        self.path = path

    def search(self, subject: SearchSubject, criteria: SearchCriteria) -> list[Listing]:
        del subject, criteria
        rows = json.loads(self.path.read_text(encoding="utf-8"))
        return [
            Listing(
                **{
                    **row,
                    "collected_at": datetime.fromisoformat(row["collected_at"]),
                    "last_seen_at": datetime.fromisoformat(row["last_seen_at"]),
                    "photo_hashes": frozenset(row.get("photo_hashes", [])),
                }
            )
            for row in rows
        ]

