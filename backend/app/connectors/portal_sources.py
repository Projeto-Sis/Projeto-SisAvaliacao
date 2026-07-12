from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Literal


SourceStatus = Literal["ready", "needs_authorization", "blocked"]


@dataclass(frozen=True, slots=True)
class SearchSourceDefinition:
    id: str
    label: str
    kind: str
    status: SourceStatus
    endpoint: str | None
    note: str
    requires_file: bool = False

    def to_dict(self) -> dict[str, str | bool | None]:
        return asdict(self)


def configured_search_sources() -> tuple[SearchSourceDefinition, ...]:
    """Fontes conhecidas pelo motor.

    As fontes de portais gratuitos ficam cadastradas desde já para a interface
    e para o desenho modular do backend. Elas não executam scraping direto:
    devem ser ativadas somente por API, feed, exportação ou autorização
    contratual compatível com uso profissional em laudo.
    """

    return (
        SearchSourceDefinition(
            id="fixture",
            label="Base local de teste",
            kind="fixture",
            status="ready",
            endpoint="/api/v1/search-jobs/fixture",
            note="Base fictícia usada apenas para testar validação, deduplicação e revisão.",
        ),
        SearchSourceDefinition(
            id="mercadolivre",
            label="Mercado Livre (API oficial)",
            kind="official_api",
            status="ready",
            endpoint="/api/v1/search-jobs/mercadolivre",
            note="Usa OAuth e API oficial. Pode depender de permissão liberada pelo Mercado Livre.",
        ),
        SearchSourceDefinition(
            id="csv_upload",
            label="CSV autorizado",
            kind="file_import",
            status="ready",
            endpoint="/api/v1/search-jobs/csv",
            note="Importa uma planilha real autorizada e aplica raio, validação, deduplicação e revisão.",
            requires_file=True,
        ),
        SearchSourceDefinition(
            id="olx",
            label="OLX Imóveis",
            kind="portal",
            status="needs_authorization",
            endpoint="/api/v1/search-jobs/portal/olx",
            note="Fonte prevista. Ativar somente com API, feed ou autorização do Grupo OLX.",
        ),
        SearchSourceDefinition(
            id="zap",
            label="ZAP Imóveis",
            kind="portal",
            status="needs_authorization",
            endpoint="/api/v1/search-jobs/portal/zap",
            note="Fonte prevista. Ativar somente com API, feed ou autorização do Grupo OLX.",
        ),
        SearchSourceDefinition(
            id="vivareal",
            label="Viva Real",
            kind="portal",
            status="needs_authorization",
            endpoint="/api/v1/search-jobs/portal/vivareal",
            note="Fonte prevista. Ativar somente com API, feed ou autorização do Grupo OLX.",
        ),
        SearchSourceDefinition(
            id="quintoandar",
            label="QuintoAndar",
            kind="portal",
            status="needs_authorization",
            endpoint="/api/v1/search-jobs/portal/quintoandar",
            note="Fonte prevista. Ativar somente com API, feed ou autorização escrita do portal.",
        ),
        SearchSourceDefinition(
            id="chavesnamao",
            label="Chaves na Mão",
            kind="portal",
            status="needs_authorization",
            endpoint="/api/v1/search-jobs/portal/chavesnamao",
            note="Fonte prevista. Ativar somente com API, feed ou autorização compatível.",
        ),
    )


def portal_source_by_id(source_id: str) -> SearchSourceDefinition | None:
    normalized = source_id.strip().lower()
    return next(
        (
            source
            for source in configured_search_sources()
            if source.id == normalized and source.kind == "portal"
        ),
        None,
    )
