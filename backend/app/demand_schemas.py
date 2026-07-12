from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


class PartnerInput(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    state_code: str | None = Field(default=None, min_length=2, max_length=2)
    base_city: str | None = Field(default=None, max_length=200)
    served_locations: list[dict[str, str]] = Field(default_factory=list)
    pix: str | None = None
    phone: str | None = None
    email: str | None = None
    bank: str | None = None
    agency: str | None = None
    account: str | None = None
    operation: str | None = None
    account_holder: str | None = None
    person_type: str | None = None
    cpf_cnpj: str | None = None
    active: bool = True
    notes: str | None = None


class EngineerInput(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    email: str | None = None
    phone: str | None = None
    professional_registration: str | None = None
    base_state: str | None = Field(default=None, min_length=2, max_length=2)
    active: bool = True
    notes: str | None = None


class DemandInput(BaseModel):
    client_bank_id: UUID
    os_number: str = Field(min_length=1, max_length=200)
    final_os_number: str | None = Field(default=None, max_length=200)
    arrival_date: date
    client_deadline: date | None = None
    deadline_days: int | None = Field(default=None, ge=1, le=365)
    service_value: Decimal | None = Field(default=None, ge=0)
    engineer_id: UUID | None = None
    art_status: str = "Pendente"
    partner_id: UUID | None = None
    partner_fee: Decimal | None = Field(default=None, ge=0)
    city: str = Field(min_length=1, max_length=200)
    state_code: str = Field(min_length=2, max_length=2)
    delivered_to_engineer_at: date | None = None
    system_finished_at: date | None = None
    demand_status: str = "Recebida"
    partner_status: str = "Não definido"
    system_status: str = "Não iniciado"
    payment_status: str = "Não realizado"
    notes: str | None = None
    evaluation_id: UUID | None = None
    import_origin: str | None = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.system_finished_at and self.system_finished_at < self.arrival_date:
            raise ValueError("A data de finalização não pode ser anterior à chegada.")
        return self


class PaymentInput(BaseModel):
    demand_id: UUID | None = None
    partner_id: UUID | None = None
    payment_type: str = "OS"
    client_bank_id: UUID | None = None
    os_number: str | None = None
    service_value: Decimal | None = Field(default=None, ge=0)
    partner_fee: Decimal | None = Field(default=None, ge=0)
    quantity_os: int = Field(default=1, ge=1)
    amount_due: Decimal = Field(ge=0)
    expected_date: date | None = None
    paid_date: date | None = None
    payment_status: str = "Não realizado"
    notes: str | None = None

    @model_validator(mode="after")
    def validate_payment(self):
        if self.payment_status == "Pagamento realizado" and self.paid_date is None:
            raise ValueError("Informe a data do pagamento realizado.")
        if self.payment_type == "OS" and self.demand_id is None:
            raise ValueError("Pagamentos de OS precisam estar vinculados a uma demanda.")
        return self


class PaymentUpdate(BaseModel):
    expected_date: date | None = None
    paid_date: date | None = None
    payment_status: str
    notes: str | None = None

    @model_validator(mode="after")
    def validate_payment_update(self):
        if self.payment_status == "Pagamento realizado" and self.paid_date is None:
            raise ValueError("Informe a data do pagamento realizado.")
        return self
