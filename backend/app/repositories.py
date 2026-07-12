from __future__ import annotations

from dataclasses import asdict
from typing import Any
from uuid import UUID, uuid4

from .connectors.base import SearchCriteria, SearchSubject
from .db import connect
from .domain import Listing, ValidationIssue, evaluate_duplicate, select_representative_price


class PostgresSearchRepository:
    def __init__(self, database_url: str) -> None:
        self.database_url = database_url

    def create_job(self, subject: SearchSubject, criteria: SearchCriteria) -> tuple[UUID, UUID]:
        subject_id = uuid4()
        job_id = uuid4()
        with connect(self.database_url) as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO valuation_subjects
                  (id, property_type, transaction_type, address_text, municipality, state_code, coordinates, bedrooms)
                VALUES
                  (%s, %s, %s, %s, %s, %s,
                   ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography, %s)
                """,
                (
                    subject_id,
                    subject.property_type,
                    subject.transaction_type,
                    "Pesquisa automatizada",
                    subject.municipality,
                    subject.state_code,
                    subject.longitude,
                    subject.latitude,
                    subject.bedrooms,
                ),
            )
            cursor.execute(
                "INSERT INTO search_jobs (id, valuation_subject_id, radius_meters, status) VALUES (%s, %s, %s, 'running')",
                (job_id, subject_id, criteria.radius_meters),
            )
        return subject_id, job_id

    def save_listing(self, listing: Listing, issues: tuple[ValidationIssue, ...]) -> UUID:
        listing_uuid = uuid4()
        raw_payload: dict[str, Any] = asdict(listing)
        raw_payload["collected_at"] = listing.collected_at.isoformat()
        raw_payload["last_seen_at"] = listing.last_seen_at.isoformat()
        raw_payload["photo_hashes"] = sorted(listing.photo_hashes)
        with connect(self.database_url) as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO source_listings
                  (id, source_name, source_reference, source_url, raw_payload, normalized_payload,
                   status, property_type, transaction_type, address_text, condominium_name, unit_number,
                   coordinates, location_precision, price, area, bedrooms, suites, bathrooms, parking_spaces,
                   source_reliability, active, first_seen_at, last_seen_at, collected_at)
                VALUES
                  (%s, %s, %s, %s, %s::jsonb, %s::jsonb, 'normalized', %s, %s, %s, %s, %s,
                   CASE WHEN %s IS NULL OR %s IS NULL THEN NULL
                        ELSE ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography END,
                   %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (source_name, source_reference) DO UPDATE SET
                  source_url = EXCLUDED.source_url,
                  raw_payload = EXCLUDED.raw_payload,
                  normalized_payload = EXCLUDED.normalized_payload,
                  price = EXCLUDED.price,
                  active = EXCLUDED.active,
                  last_seen_at = EXCLUDED.last_seen_at,
                  collected_at = EXCLUDED.collected_at
                RETURNING id
                """,
                (
                    listing_uuid,
                    listing.source,
                    listing.source_reference,
                    listing.source_url,
                    __import__("json").dumps(raw_payload),
                    __import__("json").dumps(raw_payload),
                    listing.property_type,
                    listing.transaction_type,
                    listing.address,
                    listing.condominium_name,
                    listing.unit_number,
                    listing.longitude,
                    listing.latitude,
                    listing.longitude,
                    listing.latitude,
                    listing.location_precision,
                    listing.price,
                    listing.area,
                    listing.bedrooms,
                    listing.suites,
                    listing.bathrooms,
                    listing.parking_spaces,
                    listing.source_reliability,
                    listing.active,
                    listing.collected_at,
                    listing.last_seen_at,
                    listing.collected_at,
                ),
            )
            stored_id = cursor.fetchone()[0]
            for issue in issues:
                cursor.execute(
                    """
                    INSERT INTO validation_events (listing_id, rule_code, severity, passed, message)
                    VALUES (%s, %s, %s, false, %s)
                    """,
                    (stored_id, issue.code, issue.severity, issue.message),
                )
        return stored_id

    def complete_job(self, job_id: UUID, candidate_count: int) -> None:
        with connect(self.database_url) as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE search_jobs
                SET status = 'completed', completed_at = now(), criteria = criteria || %s::jsonb
                WHERE id = %s
                """,
                (__import__("json").dumps({"candidate_count": candidate_count}), job_id),
            )

    def persist_property_group(
        self,
        job_id: UUID,
        listings: list[Listing],
        stored_listing_ids: dict[str, UUID],
        distances: dict[str, float],
    ) -> dict[str, Any]:
        if not listings:
            raise ValueError("Grupo de imóveis vazio.")
        selection = select_representative_price(listings)
        representative = next(item for item in listings if item.listing_id == selection.listing_id)
        representative_id = stored_listing_ids[representative.listing_id]

        with connect(self.database_url) as connection, connection.cursor() as cursor:
            property_id = None
            for listing in listings:
                cursor.execute(
                    "SELECT property_id FROM property_listing_links WHERE listing_id = %s LIMIT 1",
                    (stored_listing_ids[listing.listing_id],),
                )
                row = cursor.fetchone()
                if row:
                    property_id = row[0]
                    break
            if property_id is None:
                property_id = uuid4()
                cursor.execute(
                    """
                    INSERT INTO canonical_properties
                      (id, property_type, address_text, condominium_name, unit_number, coordinates,
                       identity_confidence, requires_review)
                    VALUES
                      (%s, %s, %s, %s, %s,
                       CASE WHEN %s IS NULL OR %s IS NULL THEN NULL
                            ELSE ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography END,
                       %s, true)
                    """,
                    (
                        property_id,
                        representative.property_type,
                        representative.address,
                        representative.condominium_name,
                        representative.unit_number,
                        representative.longitude,
                        representative.latitude,
                        representative.longitude,
                        representative.latitude,
                        1.0 if len(listings) == 1 else min(
                            evaluate_duplicate(representative, item).score
                            for item in listings
                            if item.listing_id != representative.listing_id
                        ),
                    ),
                )

            for listing in listings:
                duplicate = evaluate_duplicate(representative, listing)
                reasons = list(duplicate.reasons) or ["anúncio representativo do grupo"]
                cursor.execute(
                    """
                    INSERT INTO property_listing_links
                      (property_id, listing_id, duplicate_score, decision, reasons)
                    VALUES (%s, %s, %s, %s, %s::jsonb)
                    ON CONFLICT (listing_id) DO NOTHING
                    """,
                    (
                        property_id,
                        stored_listing_ids[listing.listing_id],
                        duplicate.score,
                        "automatic" if duplicate.decision == "distinct" else duplicate.decision,
                        __import__("json").dumps(reasons),
                    ),
                )

            minimum_distance = min(distances[listing.listing_id] for listing in listings)
            cursor.execute(
                """
                INSERT INTO search_job_properties
                  (job_id, property_id, representative_listing_id, representative_price, distance_meters)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (job_id, property_id) DO UPDATE SET
                  representative_listing_id = EXCLUDED.representative_listing_id,
                  representative_price = EXCLUDED.representative_price,
                  distance_meters = EXCLUDED.distance_meters
                """,
                (job_id, property_id, representative_id, selection.price, minimum_distance),
            )
        return {
            "property_id": str(property_id),
            "representative_listing_id": str(representative_id),
            "representative_external_id": representative.listing_id,
            "representative_price": selection.price,
            "distance_meters": round(minimum_distance, 1),
            "review_status": "pending",
        }

    def list_review_groups(self, job_id: UUID) -> list[dict[str, Any]]:
        with connect(self.database_url) as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                  sjp.property_id, sjp.representative_listing_id, sjp.representative_price,
                  sjp.distance_meters, sjp.review_status,
                  sl.source_name, sl.source_url, sl.address_text, sl.area,
                  sl.bedrooms, sl.suites, sl.bathrooms, sl.parking_spaces,
                  (SELECT count(*) FROM property_listing_links pll WHERE pll.property_id = sjp.property_id) AS listing_count
                FROM search_job_properties sjp
                JOIN source_listings sl ON sl.id = sjp.representative_listing_id
                WHERE sjp.job_id = %s
                ORDER BY sjp.distance_meters, sjp.representative_price
                """,
                (job_id,),
            )
            columns = [description.name for description in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]

    def approve_sample(
        self,
        job_id: UUID,
        property_id: UUID,
        location: int,
        standard: int,
        conservation: int,
        reason: str,
        reviewer: str,
    ) -> dict[str, Any]:
        with connect(self.database_url) as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT sj.valuation_subject_id, sjp.representative_listing_id,
                       sjp.representative_price, sl.area, sl.source_name, sl.address_text
                FROM search_job_properties sjp
                JOIN search_jobs sj ON sj.id = sjp.job_id
                JOIN source_listings sl ON sl.id = sjp.representative_listing_id
                WHERE sjp.job_id = %s AND sjp.property_id = %s
                """,
                (job_id, property_id),
            )
            row = cursor.fetchone()
            if not row:
                raise LookupError("Grupo de imóvel não encontrado neste trabalho.")
            subject_id, listing_id, price, area, source, address = row
            cursor.execute(
                """
                INSERT INTO approved_samples
                  (valuation_subject_id, property_id, representative_listing_id,
                   adopted_price, adopted_area, legacy_location, legacy_standard,
                   legacy_conservation, approval_reason, approved_by, revoked_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NULL)
                ON CONFLICT (valuation_subject_id, property_id) DO UPDATE SET
                  representative_listing_id = EXCLUDED.representative_listing_id,
                  adopted_price = EXCLUDED.adopted_price,
                  adopted_area = EXCLUDED.adopted_area,
                  legacy_location = EXCLUDED.legacy_location,
                  legacy_standard = EXCLUDED.legacy_standard,
                  legacy_conservation = EXCLUDED.legacy_conservation,
                  approval_reason = EXCLUDED.approval_reason,
                  approved_by = EXCLUDED.approved_by,
                  approved_at = now(),
                  revoked_at = NULL
                RETURNING id
                """,
                (
                    subject_id,
                    property_id,
                    listing_id,
                    price,
                    area,
                    location,
                    standard,
                    conservation,
                    reason,
                    reviewer,
                ),
            )
            approved_id = cursor.fetchone()[0]
            cursor.execute(
                "UPDATE search_job_properties SET review_status = 'approved', reviewed_at = now() WHERE job_id = %s AND property_id = %s",
                (job_id, property_id),
            )
            cursor.execute(
                """
                INSERT INTO sample_review_events
                  (job_id, valuation_subject_id, property_id, action, reason, reviewer)
                VALUES (%s, %s, %s, 'approved', %s, %s)
                """,
                (job_id, subject_id, property_id, reason, reviewer),
            )
        return {
            "approved_sample_id": str(approved_id),
            "property_id": str(property_id),
            "status": "approved",
            "source": " — ".join(part for part in (source, address) if part),
            "price": float(price),
            "area": float(area),
            "location": location,
            "standard": standard,
            "conservation": conservation,
        }

    def reject_sample(self, job_id: UUID, property_id: UUID, reason: str, reviewer: str) -> dict[str, str]:
        with connect(self.database_url) as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT sj.valuation_subject_id
                FROM search_job_properties sjp
                JOIN search_jobs sj ON sj.id = sjp.job_id
                WHERE sjp.job_id = %s AND sjp.property_id = %s
                """,
                (job_id, property_id),
            )
            row = cursor.fetchone()
            if not row:
                raise LookupError("Grupo de imóvel não encontrado neste trabalho.")
            subject_id = row[0]
            cursor.execute(
                "UPDATE search_job_properties SET review_status = 'rejected', reviewed_at = now() WHERE job_id = %s AND property_id = %s",
                (job_id, property_id),
            )
            cursor.execute(
                "UPDATE approved_samples SET revoked_at = now() WHERE valuation_subject_id = %s AND property_id = %s AND revoked_at IS NULL",
                (subject_id, property_id),
            )
            cursor.execute(
                """
                INSERT INTO sample_review_events
                  (job_id, valuation_subject_id, property_id, action, reason, reviewer)
                VALUES (%s, %s, %s, 'rejected', %s, %s)
                """,
                (job_id, subject_id, property_id, reason, reviewer),
            )
        return {"property_id": str(property_id), "status": "rejected"}

    def approved_legacy_samples(self, job_id: UUID) -> list[dict[str, Any]]:
        with connect(self.database_url) as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT aps.id, sl.source_name, sl.address_text, aps.adopted_price,
                       aps.adopted_area, aps.legacy_location, aps.legacy_standard,
                       aps.legacy_conservation
                FROM search_jobs sj
                JOIN approved_samples aps ON aps.valuation_subject_id = sj.valuation_subject_id
                JOIN source_listings sl ON sl.id = aps.representative_listing_id
                WHERE sj.id = %s AND aps.revoked_at IS NULL
                ORDER BY aps.approved_at
                """,
                (job_id,),
            )
            return [
                {
                    "approved_sample_id": str(row[0]),
                    "source": " — ".join(part for part in (row[1], row[2]) if part),
                    "price": float(row[3]),
                    "area": float(row[4]),
                    "location": row[5],
                    "standard": row[6],
                    "conservation": row[7],
                }
                for row in cursor.fetchall()
            ]
