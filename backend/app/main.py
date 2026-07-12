from dataclasses import asdict
from pathlib import Path
from uuid import UUID

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from .domain import Listing, evaluate_duplicate, select_representative_price, validate_listing
from .config import load_settings
from .connectors.base import ListingConnector, SearchCriteria, SearchSubject
from .connectors.csv_upload import AuthorizedCsvConnector, CsvImportError, parse_listings_csv
from .connectors.fixture import FixtureConnector
from .connectors.mercadolivre import MercadoLivreAPIError, MercadoLivreConnector
from .connectors.portal_sources import configured_search_sources, portal_source_by_id
from .geocoding import GeocodingProviderError, address_query, geocode_address
from .oauth import MercadoLivreOAuth, OAuthError
from .repositories import PostgresSearchRepository
from .schemas import (
    ApprovalRequest,
    ConsolidationRequest,
    DuplicateRequest,
    FixtureSearchRequest,
    GeocodeRequest,
    GeocodeResponse,
    ListingInput,
    RejectionRequest,
    UrlCaptureRequest,
    ValidationResponse,
)
from .search_service import execute_search
from .url_capture import UrlCaptureError, capture_listing_url
from .demand_routes import router as demand_control_router


settings = load_settings()
mercadolivre_oauth = MercadoLivreOAuth(
    client_id=settings.meli_client_id,
    client_secret=settings.meli_client_secret,
    redirect_uri=settings.meli_redirect_uri,
)
app = FastAPI(
    title="SISAVALIA — Motor de Busca",
    version="0.1.0",
    description="API de busca, validação, deduplicação e revisão de anúncios imobiliários.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.allowed_origins),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-SISAVALIA-User"],
)
app.include_router(demand_control_router)


def to_domain(payload: ListingInput) -> Listing:
    data = payload.model_dump()
    data["source_url"] = str(payload.source_url) if payload.source_url else None
    data["photo_hashes"] = frozenset(payload.photo_hashes)
    return Listing(**data)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "sisavalia-search-engine", "phase": "foundation"}


@app.post("/api/v1/listings/validate", response_model=ValidationResponse)
def validate(payload: ListingInput) -> ValidationResponse:
    issues = validate_listing(to_domain(payload))
    return ValidationResponse(
        valid=not any(issue.severity == "error" for issue in issues),
        issues=[asdict(issue) for issue in issues],
    )


@app.post("/api/v1/deduplication/evaluate")
def deduplicate(payload: DuplicateRequest) -> dict:
    return asdict(evaluate_duplicate(to_domain(payload.first), to_domain(payload.second)))


@app.post("/api/v1/listing-groups/consolidate")
def consolidate(payload: ConsolidationRequest) -> dict:
    selection = select_representative_price(to_domain(item) for item in payload.listings)
    return asdict(selection)


@app.post("/api/v1/geocode/address", response_model=GeocodeResponse)
def geocode(payload: GeocodeRequest) -> GeocodeResponse:
    query = address_query(
        payload.street,
        payload.number,
        payload.neighborhood,
        payload.city,
        payload.state,
        payload.postal_code,
    )
    try:
        result = geocode_address(query, google_api_key=settings.google_maps_api_key)
    except GeocodingProviderError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Falha ao consultar coordenadas do endereço.") from exc
    if result is None:
        raise HTTPException(status_code=404, detail="Coordenadas não encontradas para o endereço informado.")
    return GeocodeResponse(query=query, **asdict(result))


@app.post("/api/v1/listings/capture-url")
def capture_url(payload: UrlCaptureRequest) -> dict:
    try:
        return capture_listing_url(str(payload.url))
    except UrlCaptureError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


def _subject_and_criteria(payload: FixtureSearchRequest) -> tuple[SearchSubject, SearchCriteria]:
    subject = SearchSubject(
        **{
            **payload.subject.model_dump(),
            "state_code": payload.subject.state_code.upper(),
        }
    )
    criteria = SearchCriteria(radius_meters=payload.radius_meters)
    return subject, criteria


def _run_search(connector: ListingConnector, payload: FixtureSearchRequest) -> dict:
    subject, criteria = _subject_and_criteria(payload)
    try:
        listings = connector.search(subject, criteria)
    except MercadoLivreAPIError as exc:
        if exc.status_code == 403:
            detail = "A API do Mercado Livre recusou a busca. Confira a permissão de Publicação e sincronização em modo leitura."
        elif exc.status_code == 401:
            detail = "O Mercado Livre recusou o token de acesso. Autorize a aplicação novamente."
        elif exc.status_code == 429:
            detail = "Limite temporário de consultas do Mercado Livre atingido."
        else:
            detail = f"A API do Mercado Livre respondeu HTTP {exc.status_code}."
        raise HTTPException(status_code=502, detail=detail) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Falha ao consultar a fonte {connector.name}. Tente novamente mais tarde.",
        ) from exc
    result = execute_search(connector, subject, criteria, listings=listings)

    if settings.database_url:
        try:
            repository = PostgresSearchRepository(settings.database_url)
            _, job_id = repository.create_job(subject, criteria)
            stored_listing_ids = {}
            for listing in listings:
                stored_listing_ids[listing.listing_id] = repository.save_listing(listing, validate_listing(listing))
            distance_by_listing = {
                candidate["listing"]["listing_id"]: candidate["distance_meters"]
                for candidate in result["candidates"]
            }
            listing_by_id = {listing.listing_id: listing for listing in listings}
            review_groups = []
            for group in result["consolidated"]:
                grouped_listings = [listing_by_id[listing_id] for listing_id in group["listing_ids"]]
                review_groups.append(
                    repository.persist_property_group(
                        job_id,
                        grouped_listings,
                        stored_listing_ids,
                        distance_by_listing,
                    )
                )
            repository.complete_job(job_id, result["candidate_count"])
            result["job_id"] = str(job_id)
            result["persistence"] = "postgresql"
            result["review_groups"] = review_groups
        except Exception as exc:
            raise HTTPException(status_code=503, detail=f"Falha ao persistir a busca: {exc}") from exc
    else:
        result["job_id"] = None
        result["persistence"] = "disabled"
        result["review_groups"] = []
    return result


@app.post("/api/v1/search-jobs/fixture")
def fixture_search(payload: FixtureSearchRequest) -> dict:
    if not settings.enable_fixture_connector:
        raise HTTPException(status_code=403, detail="Conector local de teste desativado.")
    return _run_search(FixtureConnector(), payload)


@app.get("/api/v1/search-sources")
def search_sources() -> dict:
    return {"sources": [source.to_dict() for source in configured_search_sources()]}


@app.post("/api/v1/search-jobs/csv")
async def csv_search(
    file: UploadFile = File(...),
    subject: str = Form(...),
    radius_meters: int = Form(5_000),
) -> dict:
    if not file.filename.lower().endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Envie uma planilha CSV autorizada.")
    try:
        payload = FixtureSearchRequest.model_validate(
            {
                "subject": __import__("json").loads(subject),
                "radius_meters": radius_meters,
            }
        )
        search_subject, _ = _subject_and_criteria(payload)
        listings = parse_listings_csv(await file.read(), search_subject)
    except CsvImportError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Não foi possível ler o CSV enviado.") from exc
    if not listings:
        raise HTTPException(
            status_code=400,
            detail="O CSV não contém anúncios válidos com preço, área, latitude e longitude.",
        )
    return _run_search(AuthorizedCsvConnector(listings), payload)


@app.post("/api/v1/search-jobs/portal/{source_id}")
def portal_search(source_id: str, payload: FixtureSearchRequest) -> dict:
    source = portal_source_by_id(source_id)
    if source is None:
        raise HTTPException(status_code=404, detail="Fonte de portal não cadastrada.")
    raise HTTPException(
        status_code=501,
        detail=(
            f"{source.label} já está cadastrada como fonte do motor, mas ainda precisa "
            "de API, feed autorizado ou contrato de acesso antes da coleta automática."
        ),
    )


@app.get("/api/v1/oauth/mercadolivre/status")
def mercadolivre_oauth_status() -> dict:
    return {
        "configured": mercadolivre_oauth.configured,
        "authorized": bool(settings.meli_access_token) or mercadolivre_oauth.authorized,
        "scopes": list(mercadolivre_oauth.scopes),
        "redirect_uri": settings.meli_redirect_uri,
    }


@app.get("/api/v1/oauth/mercadolivre/start")
def mercadolivre_oauth_start() -> RedirectResponse:
    try:
        authorization_url = mercadolivre_oauth.authorization_url()
    except OAuthError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return RedirectResponse(authorization_url, status_code=302)


@app.get("/api/v1/oauth/mercadolivre/callback", response_class=HTMLResponse)
def mercadolivre_oauth_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
) -> HTMLResponse:
    if error or not code or not state:
        return HTMLResponse(
            "<h1>Autorização não concluída</h1><p>Retorne ao SISAVALIA e inicie novamente.</p>",
            status_code=400,
        )
    try:
        mercadolivre_oauth.exchange_code(code, state)
    except OAuthError as exc:
        return HTMLResponse(
            f"<h1>Autorização não concluída</h1><p>{exc}</p>",
            status_code=400,
        )
    return HTMLResponse(
        "<h1>Mercado Livre conectado</h1><p>A credencial foi recebida pelo backend. Você pode fechar esta página.</p>"
    )


@app.post("/api/v1/search-jobs/mercadolivre")
def mercadolivre_search(payload: FixtureSearchRequest) -> dict:
    try:
        access_token = settings.meli_access_token or mercadolivre_oauth.access_token()
    except OAuthError as exc:
        raise HTTPException(
            status_code=503,
            detail="A autorização do Mercado Livre expirou e não pôde ser renovada.",
        ) from exc
    if not access_token:
        raise HTTPException(
            status_code=503,
            detail="Mercado Livre ainda não autorizado no backend.",
        )
    connector = MercadoLivreConnector(
        access_token=access_token,
        category_id=settings.meli_category_id,
    )
    return _run_search(connector, payload)


def repository_or_503() -> PostgresSearchRepository:
    if not settings.database_url:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")
    return PostgresSearchRepository(settings.database_url)


@app.get("/api/v1/search-jobs/{job_id}/review")
def review_groups(job_id: UUID) -> dict:
    try:
        groups = repository_or_503().list_review_groups(job_id)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Falha ao carregar revisão: {exc}") from exc
    return {"job_id": str(job_id), "groups": groups}


@app.post("/api/v1/search-jobs/{job_id}/properties/{property_id}/approve")
def approve(job_id: UUID, property_id: UUID, payload: ApprovalRequest) -> dict:
    try:
        return repository_or_503().approve_sample(
            job_id,
            property_id,
            payload.location,
            payload.standard,
            payload.conservation,
            payload.reason,
            payload.reviewer,
        )
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Falha ao aprovar amostra: {exc}") from exc


@app.post("/api/v1/search-jobs/{job_id}/properties/{property_id}/reject")
def reject(job_id: UUID, property_id: UUID, payload: RejectionRequest) -> dict:
    try:
        return repository_or_503().reject_sample(job_id, property_id, payload.reason, payload.reviewer)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Falha ao rejeitar amostra: {exc}") from exc


@app.get("/api/v1/search-jobs/{job_id}/approved-samples")
def approved_samples(job_id: UUID) -> dict:
    try:
        samples = repository_or_503().approved_legacy_samples(job_id)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Falha ao carregar amostras aprovadas: {exc}") from exc
    return {"job_id": str(job_id), "samples": samples}


frontend_dir = Path(__file__).resolve().parents[2]
if (frontend_dir / "index.html").exists():
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="sisavalia-frontend")
