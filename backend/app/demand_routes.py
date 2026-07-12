from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Header, HTTPException, Query

from .config import load_settings
from .demand_repository import DemandRepository, DuplicateDemandError
from .demand_schemas import DemandInput, EngineerInput, PartnerInput, PaymentInput, PaymentUpdate


router = APIRouter(prefix="/api/v1/demand-control", tags=["Controle de Demanda"])


def repository() -> DemandRepository:
    database_url = load_settings().database_url
    if not database_url:
        raise HTTPException(status_code=503, detail="Configure o PostgreSQL para usar o Controle de Demanda.")
    return DemandRepository(database_url)


@router.get("/client-banks")
def client_banks() -> dict:
    return {"items": repository().list_client_banks()}


@router.get("/partners")
def partners() -> dict:
    return {"items": repository().list_partners()}


@router.post("/partners", status_code=201)
def create_partner(payload: PartnerInput) -> dict:
    try:
        return repository().create_partner(payload)
    except Exception as exc:
        if getattr(exc, "sqlstate", None) == "23505":
            raise HTTPException(status_code=409, detail="Parceiro já cadastrado com nome equivalente.") from exc
        raise


@router.get("/engineers")
def engineers() -> dict:
    return {"items": repository().list_engineers()}


@router.post("/engineers", status_code=201)
def create_engineer(payload: EngineerInput) -> dict:
    try:
        return repository().create_engineer(payload)
    except Exception as exc:
        if getattr(exc, "sqlstate", None) == "23505":
            raise HTTPException(status_code=409, detail="Engenheiro já cadastrado com nome equivalente.") from exc
        raise


@router.get("/demands")
def demands(
    limit: int = Query(default=200, ge=1, le=1000),
    search: str | None = Query(default=None, max_length=200),
) -> dict:
    return {"items": repository().list_demands(limit=limit, search=search)}


@router.post("/demands", status_code=201)
def create_demand(payload: DemandInput, x_sisavalia_user: str | None = Header(default=None)) -> dict:
    try:
        return repository().create_demand(payload, user_id=x_sisavalia_user)
    except DuplicateDemandError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/demands/{demand_id}")
def update_demand(demand_id: str, payload: DemandInput, x_sisavalia_user: str | None = Header(default=None)) -> dict:
    try:
        return repository().update_demand(UUID(demand_id), payload, user_id=x_sisavalia_user)
    except DuplicateDemandError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/payments", status_code=201)
def create_payment(payload: PaymentInput) -> dict:
    return repository().create_payment(payload)


@router.get("/payments")
def payments(limit: int = Query(default=500, ge=1, le=2000)) -> dict:
    return {"items": repository().list_payments(limit=limit)}


@router.post("/payments/{payment_id}")
def update_payment(payment_id: UUID, payload: PaymentUpdate, x_sisavalia_user: str | None = Header(default=None)) -> dict:
    try:
        return repository().update_payment(payment_id, payload, user_id=x_sisavalia_user)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/dashboard")
def dashboard() -> dict:
    return repository().dashboard()


@router.get("/financial/monthly")
def monthly_financial(months: int = Query(default=12, ge=1, le=60)) -> dict:
    return {"items": repository().monthly_financial_evolution(months=months)}
