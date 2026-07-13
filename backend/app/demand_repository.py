from __future__ import annotations

from dataclasses import asdict
from datetime import date
import json
from typing import Any
from uuid import UUID

from psycopg.rows import dict_row

from .db import connect
from .demand_domain import calculate_deadline, deadline_status, execution_days, normalize_text
from .demand_schemas import DemandInput, EngineerInput, PartnerInput, PaymentInput, PaymentUpdate


class DuplicateDemandError(ValueError):
    pass


class DemandRepository:
    def __init__(self, database_url: str) -> None:
        self.database_url = database_url

    @staticmethod
    def _digits(value: str | None) -> str:
        return "".join(character for character in str(value or "") if character.isdigit())

    def ensure_demand_proponent_columns(self) -> None:
        """Garante compatibilidade quando o Render sobe código novo antes da migration.

        O deploy correto executa as migrations, mas em ambientes manuais pode acontecer
        de o frontend/backend novo subir com um banco ainda sem as colunas adicionadas
        para pesquisa por proponente. Esse ajuste é idempotente e evita que a lista
        inteira de demandas pare por falta dessas colunas.
        """
        with connect(self.database_url) as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                ALTER TABLE demands
                  ADD COLUMN IF NOT EXISTS proponent_name text,
                  ADD COLUMN IF NOT EXISTS proponent_cpf text
                """
            )

    def list_client_banks(self) -> list[dict[str, Any]]:
        with connect(self.database_url) as connection, connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute("SELECT * FROM client_banks WHERE active ORDER BY name")
            return cursor.fetchall()

    def list_partners(self) -> list[dict[str, Any]]:
        with connect(self.database_url) as connection, connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute("SELECT * FROM partners ORDER BY active DESC, name")
            return cursor.fetchall()

    def create_partner(self, payload: PartnerInput) -> dict[str, Any]:
        data = payload.model_dump()
        data["state_code"] = data["state_code"].upper() if data["state_code"] else None
        with connect(self.database_url) as connection, connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                INSERT INTO partners
                  (name, normalized_name, state_code, base_city, served_locations, pix, phone, email,
                   bank, agency, account, operation, account_holder, person_type, cpf_cnpj, active, notes)
                VALUES
                  (%(name)s, %(normalized_name)s, %(state_code)s, %(base_city)s, %(served_locations)s::jsonb,
                   %(pix)s, %(phone)s, %(email)s, %(bank)s, %(agency)s, %(account)s, %(operation)s,
                   %(account_holder)s, %(person_type)s, %(cpf_cnpj)s, %(active)s, %(notes)s)
                RETURNING *
                """,
                {**data, "normalized_name": normalize_text(data["name"]), "served_locations": json.dumps(data["served_locations"])},
            )
            return cursor.fetchone()

    def list_engineers(self) -> list[dict[str, Any]]:
        with connect(self.database_url) as connection, connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute("SELECT * FROM engineers ORDER BY active DESC, name")
            return cursor.fetchall()

    def create_engineer(self, payload: EngineerInput) -> dict[str, Any]:
        data = payload.model_dump()
        data["base_state"] = data["base_state"].upper() if data["base_state"] else None
        with connect(self.database_url) as connection, connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                INSERT INTO engineers
                  (name, normalized_name, email, phone, professional_registration, base_state, active, notes)
                VALUES
                  (%(name)s, %(normalized_name)s, %(email)s, %(phone)s, %(professional_registration)s,
                   %(base_state)s, %(active)s, %(notes)s)
                RETURNING *
                """,
                {**data, "normalized_name": normalize_text(data["name"])},
            )
            return cursor.fetchone()

    def list_demands(self, *, limit: int = 200, search: str | None = None) -> list[dict[str, Any]]:
        self.ensure_demand_proponent_columns()
        with connect(self.database_url) as connection, connection.cursor(row_factory=dict_row) as cursor:
            raw_search = search.strip() if search and search.strip() else None
            search_term = f"%{raw_search}%" if raw_search else None
            search_digits = self._digits(raw_search)
            digit_term = f"%{search_digits}%" if search_digits else None
            final_four = search_digits[-4:] if len(search_digits) >= 4 else None
            final_four_term = f"%{final_four}" if final_four else None
            cursor.execute(
                """
                SELECT d.*, cb.name AS bank_name, p.name AS partner_name, e.name AS engineer_name,
                       (CURRENT_DATE - d.arrival_date) AS current_execution_days
                FROM demands d
                JOIN client_banks cb ON cb.id = d.client_bank_id
                LEFT JOIN partners p ON p.id = d.partner_id
                LEFT JOIN engineers e ON e.id = d.engineer_id
                WHERE (%s::text IS NULL OR d.os_number ILIKE %s OR COALESCE(d.final_os_number, '') ILIKE %s
                       OR COALESCE(d.proponent_name, '') ILIKE %s
                       OR COALESCE(d.proponent_cpf, '') ILIKE %s
                       OR regexp_replace(COALESCE(d.proponent_cpf, ''), '[^0-9]', '', 'g') LIKE %s
                       OR regexp_replace(COALESCE(d.os_number, ''), '[^0-9]', '', 'g') LIKE %s
                       OR regexp_replace(COALESCE(d.final_os_number, ''), '[^0-9]', '', 'g') LIKE %s
                       OR (%s::text IS NOT NULL AND regexp_replace(COALESCE(d.os_number, ''), '[^0-9]', '', 'g') LIKE %s)
                       OR (%s::text IS NOT NULL AND regexp_replace(COALESCE(d.final_os_number, ''), '[^0-9]', '', 'g') LIKE %s)
                       OR cb.name ILIKE %s OR cb.acronym ILIKE %s OR d.city ILIKE %s OR d.state_code ILIKE %s)
                ORDER BY d.client_deadline, d.created_at DESC
                LIMIT %s
                """,
                (
                    search_term,
                    search_term,
                    search_term,
                    search_term,
                    search_term,
                    digit_term,
                    digit_term,
                    digit_term,
                    final_four,
                    final_four_term,
                    final_four,
                    final_four_term,
                    search_term,
                    search_term,
                    search_term,
                    search_term,
                    limit,
                ),
            )
            rows = cursor.fetchall()
            for row in rows:
                row["days_execution"] = execution_days(row["arrival_date"], row["system_finished_at"])
                row["deadline_status"] = deadline_status(
                    row["arrival_date"], row["deadline_days"], row["system_finished_at"]
                )
                row["estimated_net_value"] = (row["service_value"] or 0) - (row["partner_fee"] or 0)
                row["partner_fee_percentage"] = (
                    (row["partner_fee"] / row["service_value"] * 100)
                    if row["partner_fee"] and row["service_value"] else 0
                )
            return rows

    def reset_demands(self, *, user_id: str | None = None) -> dict[str, Any]:
        """Remove demandas e pagamentos vinculados para permitir recadastro limpo.

        A limpeza preserva cadastros estruturais do módulo, como bancos/clientes,
        parceiros e engenheiros. Ela remove apenas as OS/demandas e os pagamentos
        criados a partir dessas OS, que são exatamente os dados exibidos nos
        indicadores do painel.
        """
        with connect(self.database_url) as connection, connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute("SELECT COUNT(*) AS total FROM demands")
            demand_total = cursor.fetchone()["total"]
            cursor.execute("SELECT COUNT(*) AS total FROM payments WHERE demand_id IS NOT NULL")
            payment_total = cursor.fetchone()["total"]
            cursor.execute("DELETE FROM payments WHERE demand_id IS NOT NULL")
            cursor.execute("DELETE FROM demands")
            cursor.execute(
                """
                INSERT INTO demand_audit_events (entity, entity_id, action, new_data, user_id)
                VALUES ('demand_control', gen_random_uuid(), 'reset_demands', %s::jsonb, %s)
                """,
                (
                    json.dumps(
                        {
                            "deleted_demands": demand_total,
                            "deleted_payments": payment_total,
                            "scope": "demands_and_linked_payments",
                        },
                        default=str,
                    ),
                    user_id,
                ),
            )
            return {"deleted_demands": demand_total, "deleted_payments": payment_total}

    def create_demand(self, payload: DemandInput, *, user_id: str | None = None) -> dict[str, Any]:
        self.ensure_demand_proponent_columns()
        data = payload.model_dump()
        data["os_number"] = data["os_number"].strip()
        data["proponent_name"] = data["proponent_name"].strip() if data.get("proponent_name") else None
        data["proponent_cpf"] = data["proponent_cpf"].strip() if data.get("proponent_cpf") else None
        data["city"] = data["city"].strip()
        data["state_code"] = data["state_code"].upper()
        with connect(self.database_url) as connection, connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute("SELECT default_deadline_days FROM client_banks WHERE id = %s", (data["client_bank_id"],))
            bank = cursor.fetchone()
            if not bank:
                raise ValueError("Banco/cliente não encontrado.")
            data["deadline_days"] = data["deadline_days"] or bank["default_deadline_days"]
            data["client_deadline"] = data["client_deadline"] or calculate_deadline(
                data["arrival_date"], data["deadline_days"]
            )
            try:
                cursor.execute(
                    """
                    INSERT INTO demands
                      (client_bank_id, os_number, final_os_number, proponent_name, proponent_cpf,
                       arrival_date, client_deadline, deadline_days,
                       service_value, engineer_id, art_status, partner_id, partner_fee, city, state_code,
                       delivered_to_engineer_at, system_finished_at, demand_status, partner_status,
                       system_status, payment_status, notes, evaluation_id, import_origin)
                    VALUES
                      (%(client_bank_id)s, %(os_number)s, %(final_os_number)s,
                       %(proponent_name)s, %(proponent_cpf)s, %(arrival_date)s,
                       %(client_deadline)s, %(deadline_days)s, %(service_value)s, %(engineer_id)s,
                       %(art_status)s, %(partner_id)s, %(partner_fee)s, %(city)s, %(state_code)s,
                       %(delivered_to_engineer_at)s, %(system_finished_at)s, %(demand_status)s,
                       %(partner_status)s, %(system_status)s, %(payment_status)s, %(notes)s,
                       %(evaluation_id)s, %(import_origin)s)
                    RETURNING *
                    """,
                    data,
                )
            except Exception as exc:
                if getattr(exc, "sqlstate", None) == "23505":
                    raise DuplicateDemandError("Já existe uma demanda com esta OS para o banco selecionado.") from exc
                raise
            demand = cursor.fetchone()
            if demand["partner_id"] and demand["partner_fee"] and demand["partner_fee"] > 0:
                cursor.execute(
                    """
                    INSERT INTO payments
                      (demand_id, partner_id, payment_type, client_bank_id, os_number, service_value,
                       partner_fee, quantity_os, amount_due, payment_status)
                    VALUES (%s, %s, 'OS', %s, %s, %s, %s, 1, %s, 'Não realizado')
                    """,
                    (demand["id"], demand["partner_id"], demand["client_bank_id"], demand["os_number"],
                     demand["service_value"], demand["partner_fee"], demand["partner_fee"]),
                )
            cursor.execute(
                """
                INSERT INTO demand_audit_events (entity, entity_id, action, new_data, user_id)
                VALUES ('demand', %s, 'created', %s::jsonb, %s)
                """,
                (demand["id"], json.dumps(demand, default=str), user_id),
            )
            return demand

    def update_demand(self, demand_id: UUID, payload: DemandInput, *, user_id: str | None = None) -> dict[str, Any]:
        self.ensure_demand_proponent_columns()
        data = payload.model_dump()
        data.update({"id": demand_id, "os_number": data["os_number"].strip(), "city": data["city"].strip(), "state_code": data["state_code"].upper()})
        data["proponent_name"] = data["proponent_name"].strip() if data.get("proponent_name") else None
        data["proponent_cpf"] = data["proponent_cpf"].strip() if data.get("proponent_cpf") else None
        with connect(self.database_url) as connection, connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute("SELECT * FROM demands WHERE id = %s FOR UPDATE", (demand_id,))
            previous = cursor.fetchone()
            if not previous:
                raise LookupError("Demanda não encontrada.")
            cursor.execute("SELECT default_deadline_days FROM client_banks WHERE id = %s", (data["client_bank_id"],))
            bank = cursor.fetchone()
            if not bank:
                raise ValueError("Banco/cliente não encontrado.")
            data["deadline_days"] = data["deadline_days"] or bank["default_deadline_days"]
            data["client_deadline"] = data["client_deadline"] or calculate_deadline(data["arrival_date"], data["deadline_days"])
            try:
                cursor.execute(
                    """
                    UPDATE demands SET
                      client_bank_id=%(client_bank_id)s, os_number=%(os_number)s, final_os_number=%(final_os_number)s,
                      proponent_name=%(proponent_name)s, proponent_cpf=%(proponent_cpf)s,
                      arrival_date=%(arrival_date)s, client_deadline=%(client_deadline)s, deadline_days=%(deadline_days)s,
                      service_value=%(service_value)s, engineer_id=%(engineer_id)s, art_status=%(art_status)s,
                      partner_id=%(partner_id)s, partner_fee=%(partner_fee)s, city=%(city)s, state_code=%(state_code)s,
                      delivered_to_engineer_at=%(delivered_to_engineer_at)s, system_finished_at=%(system_finished_at)s,
                      demand_status=%(demand_status)s, partner_status=%(partner_status)s, system_status=%(system_status)s,
                      payment_status=%(payment_status)s, notes=%(notes)s, evaluation_id=%(evaluation_id)s,
                      import_origin=%(import_origin)s, updated_at=now()
                    WHERE id=%(id)s RETURNING *
                    """,
                    data,
                )
            except Exception as exc:
                if getattr(exc, "sqlstate", None) == "23505":
                    raise DuplicateDemandError("Já existe uma demanda com esta OS para o banco selecionado.") from exc
                raise
            updated = cursor.fetchone()
            cursor.execute("SELECT id, payment_status FROM payments WHERE demand_id=%s AND payment_type='OS' ORDER BY created_at LIMIT 1", (demand_id,))
            payment = cursor.fetchone()
            if updated["partner_id"] and updated["partner_fee"] and updated["partner_fee"] > 0:
                if payment:
                    cursor.execute(
                        """UPDATE payments SET partner_id=%s, client_bank_id=%s, os_number=%s, service_value=%s,
                           partner_fee=%s, amount_due=%s, updated_at=now()
                           WHERE id=%s AND payment_status IN ('Não realizado','Parcial')""",
                        (updated["partner_id"], updated["client_bank_id"], updated["os_number"], updated["service_value"],
                         updated["partner_fee"], updated["partner_fee"], payment["id"]),
                    )
                else:
                    cursor.execute(
                        """INSERT INTO payments (demand_id, partner_id, payment_type, client_bank_id, os_number,
                           service_value, partner_fee, amount_due) VALUES (%s,%s,'OS',%s,%s,%s,%s,%s)""",
                        (demand_id, updated["partner_id"], updated["client_bank_id"], updated["os_number"],
                         updated["service_value"], updated["partner_fee"], updated["partner_fee"]),
                    )
            elif payment and payment["payment_status"] in {"Não realizado", "Parcial"}:
                cursor.execute(
                    "UPDATE payments SET payment_status='Cancelado', cancellation_reason='Honorário removido da demanda', updated_at=now() WHERE id=%s",
                    (payment["id"],),
                )
            cursor.execute(
                """INSERT INTO demand_audit_events (entity, entity_id, action, previous_data, new_data, user_id)
                   VALUES ('demand', %s, 'updated', %s::jsonb, %s::jsonb, %s)""",
                (demand_id, json.dumps(previous, default=str), json.dumps(updated, default=str), user_id),
            )
            return updated

    def create_payment(self, payload: PaymentInput) -> dict[str, Any]:
        data = payload.model_dump()
        with connect(self.database_url) as connection, connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                INSERT INTO payments
                  (demand_id, partner_id, payment_type, client_bank_id, os_number, service_value,
                   partner_fee, quantity_os, amount_due, expected_date, paid_date, payment_status, notes)
                VALUES
                  (%(demand_id)s, %(partner_id)s, %(payment_type)s, %(client_bank_id)s, %(os_number)s,
                   %(service_value)s, %(partner_fee)s, %(quantity_os)s, %(amount_due)s, %(expected_date)s,
                   %(paid_date)s, %(payment_status)s, %(notes)s)
                RETURNING *
                """,
                data,
            )
            return cursor.fetchone()

    def list_payments(self, *, limit: int = 500) -> list[dict[str, Any]]:
        with connect(self.database_url) as connection, connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                SELECT p.*, cb.name AS bank_name, partner.name AS partner_name
                FROM payments p
                LEFT JOIN client_banks cb ON cb.id = p.client_bank_id
                LEFT JOIN partners partner ON partner.id = p.partner_id
                ORDER BY (p.payment_status IN ('Não realizado','Parcial')) DESC,
                         p.expected_date NULLS LAST, p.created_at DESC
                LIMIT %s
                """,
                (limit,),
            )
            return cursor.fetchall()

    def update_payment(self, payment_id: UUID, payload: PaymentUpdate, *, user_id: str | None = None) -> dict[str, Any]:
        data = payload.model_dump()
        with connect(self.database_url) as connection, connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute("SELECT * FROM payments WHERE id = %s FOR UPDATE", (payment_id,))
            previous = cursor.fetchone()
            if not previous:
                raise LookupError("Pagamento não encontrado.")
            cursor.execute(
                """
                UPDATE payments SET expected_date=%s, paid_date=%s, payment_status=%s, notes=%s,
                  cancellation_reason=CASE WHEN %s = 'Cancelado' THEN COALESCE(%s, 'Cancelado pelo usuário') ELSE cancellation_reason END,
                  updated_at=now()
                WHERE id=%s RETURNING *
                """,
                (data["expected_date"], data["paid_date"], data["payment_status"], data["notes"],
                 data["payment_status"], data["notes"], payment_id),
            )
            updated = cursor.fetchone()
            if updated["demand_id"]:
                cursor.execute(
                    "UPDATE demands SET payment_status=%s, updated_at=now() WHERE id=%s",
                    (updated["payment_status"], updated["demand_id"]),
                )
            cursor.execute(
                """INSERT INTO demand_audit_events (entity, entity_id, action, previous_data, new_data, user_id)
                   VALUES ('payment', %s, 'updated', %s::jsonb, %s::jsonb, %s)""",
                (payment_id, json.dumps(previous, default=str), json.dumps(updated, default=str), user_id),
            )
            return updated

    def dashboard(self) -> dict[str, Any]:
        with connect(self.database_url) as connection, connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                SELECT
                  COUNT(*) AS total_demands,
                  COUNT(*) FILTER (WHERE engineer_id IS NULL) AS without_engineer,
                  COUNT(*) FILTER (WHERE partner_id IS NULL) AS without_partner,
                  COUNT(*) FILTER (WHERE art_status = 'Pendente') AS pending_art,
                  COUNT(*) FILTER (WHERE payment_status IN ('Não realizado', 'Parcial')) AS pending_payment,
                  COUNT(*) FILTER (WHERE CURRENT_DATE >= client_deadline AND demand_status NOT IN ('Entregue','Cancelada')) AS overdue,
                  COALESCE(SUM(service_value), 0) AS total_service_value,
                  COALESCE(SUM(partner_fee), 0) AS total_partner_fees
                FROM demands
                """
            )
            summary = cursor.fetchone()
            cursor.execute(
                """
                SELECT COALESCE(SUM(amount_due) FILTER (WHERE payment_status = 'Pagamento realizado'), 0) AS total_paid,
                       COALESCE(SUM(amount_due) FILTER (WHERE payment_status IN ('Não realizado','Parcial')), 0) AS total_pending
                FROM payments
                """
            )
            summary.update(cursor.fetchone())
            return summary

    def monthly_financial_evolution(self, *, months: int = 12) -> list[dict[str, Any]]:
        with connect(self.database_url) as connection, connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                WITH payment_totals AS (
                  SELECT demand_id,
                         COALESCE(SUM(amount_due) FILTER (WHERE payment_status = 'Pagamento realizado'), 0) AS paid,
                         COALESCE(SUM(amount_due) FILTER (WHERE payment_status IN ('Não realizado','Parcial')), 0) AS pending
                  FROM payments
                  WHERE demand_id IS NOT NULL
                  GROUP BY demand_id
                )
                SELECT date_trunc('month', d.arrival_date)::date AS month,
                       COUNT(*) AS os_count,
                       COALESCE(SUM(d.service_value), 0) AS gross_revenue,
                       COALESCE(SUM(d.partner_fee), 0) AS partner_fees,
                       COALESCE(SUM(COALESCE(d.service_value, 0) - COALESCE(d.partner_fee, 0)), 0) AS estimated_net,
                       COALESCE(SUM(p.paid), 0) AS paid,
                       COALESCE(SUM(p.pending), 0) AS pending
                FROM demands d
                LEFT JOIN payment_totals p ON p.demand_id = d.id
                WHERE d.arrival_date >= date_trunc('month', CURRENT_DATE) - (%s - 1) * INTERVAL '1 month'
                GROUP BY 1
                ORDER BY 1
                """,
                (months,),
            )
            return cursor.fetchall()

    def import_legacy_demands(self, filename: str, analysis: dict, *, user_id: str | None = None) -> dict[str, Any]:
        report = {**analysis["report"]}
        report.update({"imported_demands": 0, "partners_created": 0, "engineers_created": 0, "database_duplicates": []})
        with connect(self.database_url) as connection, connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute("SELECT id, acronym, default_deadline_days FROM client_banks")
            banks = {item["acronym"]: item for item in cursor.fetchall()}
            partner_cache: dict[str, UUID] = {}
            engineer_cache: dict[str, UUID] = {}
            for item in analysis["demands"]:
                bank = banks.get(item["bank_acronym"])
                if not bank:
                    report["errors"].append({"sheet": item["sheet"], "row": item["row"], "error": "Banco não cadastrado."})
                    continue
                partner_id = None
                if item.get("partner_name"):
                    normalized = normalize_text(item["partner_name"])
                    partner_id = partner_cache.get(normalized)
                    if not partner_id:
                        profile = item.get("partner_profile") or {}
                        cursor.execute(
                            """
                            INSERT INTO partners
                              (name, normalized_name, state_code, base_city, pix, phone, email, bank, agency,
                               account, operation, account_holder)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (normalized_name) DO UPDATE SET updated_at = now()
                            RETURNING id, (xmax = 0) AS inserted
                            """,
                            (item["partner_name"].strip(), normalized,
                             (profile.get("state_code") or item.get("state_code") or "")[:2].upper() or None,
                             profile.get("base_city"), profile.get("pix"), profile.get("phone"), profile.get("email"),
                             profile.get("bank"), profile.get("agency"), profile.get("account"),
                             profile.get("operation"), profile.get("account_holder")),
                        )
                        partner = cursor.fetchone()
                        partner_id = partner["id"]
                        partner_cache[normalized] = partner_id
                        report["partners_created"] += int(partner["inserted"])
                engineer_id = None
                if item.get("engineer_name"):
                    normalized = normalize_text(item["engineer_name"])
                    engineer_id = engineer_cache.get(normalized)
                    if not engineer_id:
                        cursor.execute(
                            """
                            INSERT INTO engineers (name, normalized_name, base_state)
                            VALUES (%s, %s, %s)
                            ON CONFLICT (normalized_name) DO UPDATE SET updated_at = now()
                            RETURNING id, (xmax = 0) AS inserted
                            """,
                            (item["engineer_name"].strip(), normalized, item["state_code"][:2].upper()),
                        )
                        engineer = cursor.fetchone()
                        engineer_id = engineer["id"]
                        engineer_cache[normalized] = engineer_id
                        report["engineers_created"] += int(engineer["inserted"])
                deadline_days = bank["default_deadline_days"]
                client_deadline = item.get("client_deadline") or calculate_deadline(item["arrival_date"], deadline_days)
                cursor.execute(
                    """
                    INSERT INTO demands
                      (client_bank_id, os_number, final_os_number, arrival_date, client_deadline, deadline_days,
                       service_value, engineer_id, art_status, partner_id, partner_fee, city, state_code,
                       delivered_to_engineer_at, system_finished_at, demand_status, partner_status,
                       system_status, payment_status, notes, import_origin)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (client_bank_id, os_number) DO NOTHING
                    RETURNING id
                    """,
                    (bank["id"], item["os_number"], item.get("final_os_number"), item["arrival_date"], client_deadline,
                     deadline_days, item.get("service_value"), engineer_id, item["art_status"], partner_id,
                     item.get("partner_fee"), item["city"].strip(), item["state_code"][:2].upper(),
                     item.get("delivered_to_engineer_at"), item.get("system_finished_at"), item["demand_status"],
                     item["partner_status"], item["system_status"], item["payment_status"], item.get("notes"),
                     f"{filename}:{item['sheet']}:{item['row']}"),
                )
                created = cursor.fetchone()
                if not created:
                    report["database_duplicates"].append({"bank": item["bank_acronym"], "os_number": item["os_number"]})
                    continue
                demand_id = created["id"]
                report["imported_demands"] += 1
                if partner_id and item.get("partner_fee") and item["partner_fee"] > 0:
                    cursor.execute(
                        """
                        INSERT INTO payments
                          (demand_id, partner_id, payment_type, client_bank_id, os_number, service_value,
                           partner_fee, amount_due, payment_status, notes)
                        VALUES (%s, %s, 'OS', %s, %s, %s, %s, %s, 'Não realizado', 'Gerado pela importação legada')
                        """,
                        (demand_id, partner_id, bank["id"], item["os_number"], item.get("service_value"),
                         item["partner_fee"], item["partner_fee"]),
                    )
                cursor.execute(
                    """
                    INSERT INTO demand_audit_events (entity, entity_id, action, new_data, user_id)
                    VALUES ('demand', %s, 'imported', %s::jsonb, %s)
                    """,
                    (demand_id, json.dumps(item, default=str), user_id),
                )
            report["total_ignored"] = report["ignored_rows"] + len(report["database_duplicates"])
            cursor.execute(
                """
                INSERT INTO demand_imports
                  (filename, total_rows, total_imported, total_ignored, total_errors, report)
                VALUES (%s, %s, %s, %s, %s, %s::jsonb)
                RETURNING id, imported_at
                """,
                (filename, report["total_rows_read"], report["imported_demands"], report["total_ignored"],
                 len(report["errors"]), json.dumps(report, default=str)),
            )
            import_record = cursor.fetchone()
            return {"import_id": import_record["id"], "imported_at": import_record["imported_at"], "report": report}
