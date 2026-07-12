from __future__ import annotations

from datetime import date, timedelta
import re
import unicodedata


TERMINAL_DEMAND_STATUSES = {"Entregue", "Cancelada", "Não entregue"}


def normalize_text(value: str | None) -> str:
    """Normalização usada para comparar nomes sem alterar a grafia exibida."""
    compact = re.sub(r"\s+", " ", (value or "").strip()).upper()
    return "".join(
        character for character in unicodedata.normalize("NFKD", compact)
        if not unicodedata.combining(character)
    )


def calculate_deadline(arrival_date: date, deadline_days: int = 7) -> date:
    if deadline_days <= 0:
        raise ValueError("O prazo deve ser maior que zero.")
    return arrival_date + timedelta(days=deadline_days)


def execution_days(arrival_date: date, finished_date: date | None = None, *, today: date | None = None) -> int:
    end = finished_date or today or date.today()
    if end < arrival_date:
        raise ValueError("A data final não pode ser anterior à chegada.")
    return (end - arrival_date).days


def deadline_status(
    arrival_date: date,
    deadline_days: int,
    finished_date: date | None = None,
    *,
    today: date | None = None,
) -> str:
    return "Fora do prazo" if execution_days(arrival_date, finished_date, today=today) >= deadline_days else "Dentro do prazo"


STATUS_ALIASES = {
    "ENTREGUE": "Entregue",
    "NAO ENTREGUE": "Não entregue",
    "CONCLUIDA": "Concluída",
    "CONCLUIDO": "Concluída",
    "PAGAMENTO REALIZADO": "Pagamento realizado",
    "PAGAMENTO NAO REALIZADO": "Não realizado",
    "NAO REALIZADO": "Não realizado",
    "ART PAGA": "ART paga",
}


def normalize_legacy_status(value: str | None) -> str | None:
    normalized = normalize_text(value)
    if not normalized:
        return None
    return STATUS_ALIASES.get(normalized, re.sub(r"\s+", " ", (value or "").strip()))
