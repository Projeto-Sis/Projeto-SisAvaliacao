CREATE TABLE client_banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  acronym text NOT NULL,
  default_deadline_days smallint NOT NULL DEFAULT 7 CHECK (default_deadline_days > 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name),
  UNIQUE (acronym)
);

INSERT INTO client_banks (name, acronym, default_deadline_days) VALUES
  ('Banco do Brasil', 'BB', 7),
  ('Caixa Econômica Federal', 'CAIXA', 7),
  ('BDMG', 'BDMG', 7),
  ('Banco da Amazônia', 'BASA', 7),
  ('Banco do Nordeste', 'BNB', 7),
  ('BNDES', 'BNDES', 7),
  ('BRB', 'BRB', 7),
  ('Outro', 'OUTRO', 7)
ON CONFLICT DO NOTHING;

CREATE TABLE partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  normalized_name text NOT NULL,
  state_code char(2),
  base_city text,
  served_locations jsonb NOT NULL DEFAULT '[]'::jsonb,
  pix text,
  phone text,
  email text,
  bank text,
  agency text,
  account text,
  operation text,
  account_holder text,
  person_type text CHECK (person_type IS NULL OR person_type IN ('PF', 'PJ')),
  cpf_cnpj text,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (normalized_name)
);

CREATE TABLE engineers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  normalized_name text NOT NULL,
  email text,
  phone text,
  professional_registration text,
  base_state char(2),
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (normalized_name)
);

CREATE TABLE evaluation_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  os_number text,
  project_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'Rascunho',
  report_status text NOT NULL DEFAULT 'Não iniciado',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE demands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_bank_id uuid NOT NULL REFERENCES client_banks(id),
  os_number text NOT NULL,
  final_os_number text,
  arrival_date date NOT NULL,
  client_deadline date NOT NULL,
  deadline_days smallint NOT NULL DEFAULT 7 CHECK (deadline_days > 0),
  service_value numeric(15, 2) CHECK (service_value IS NULL OR service_value >= 0),
  engineer_id uuid REFERENCES engineers(id),
  art_status text NOT NULL DEFAULT 'Pendente'
    CHECK (art_status IN ('Pendente', 'ART paga', 'Isento', 'Cancelada')),
  partner_id uuid REFERENCES partners(id),
  partner_fee numeric(15, 2) CHECK (partner_fee IS NULL OR partner_fee >= 0),
  city text NOT NULL,
  state_code char(2) NOT NULL,
  delivered_to_engineer_at date,
  system_finished_at date,
  demand_status text NOT NULL DEFAULT 'Recebida'
    CHECK (demand_status IN ('Recebida', 'Em análise', 'Agendada', 'Vistoria realizada', 'Em elaboração', 'Enviada ao engenheiro', 'Finalizada', 'Entregue', 'Cancelada', 'Não entregue')),
  partner_status text NOT NULL DEFAULT 'Não definido'
    CHECK (partner_status IN ('Não definido', 'Acionado', 'Entregue', 'Não entregue', 'Cancelado')),
  system_status text NOT NULL DEFAULT 'Não iniciado'
    CHECK (system_status IN ('Não iniciado', 'Emitida', 'Concluída', 'Pendente', 'Cancelada')),
  payment_status text NOT NULL DEFAULT 'Não realizado'
    CHECK (payment_status IN ('Não realizado', 'Pagamento realizado', 'Parcial', 'Cancelado', 'Não se aplica')),
  notes text,
  evaluation_id uuid REFERENCES evaluation_projects(id),
  import_origin text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_bank_id, os_number),
  CHECK (system_finished_at IS NULL OR system_finished_at >= arrival_date)
);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_id uuid REFERENCES demands(id),
  partner_id uuid REFERENCES partners(id),
  payment_type text NOT NULL DEFAULT 'OS'
    CHECK (payment_type IN ('OS', 'Avulso', 'Indireto')),
  client_bank_id uuid REFERENCES client_banks(id),
  os_number text,
  service_value numeric(15, 2) CHECK (service_value IS NULL OR service_value >= 0),
  partner_fee numeric(15, 2) CHECK (partner_fee IS NULL OR partner_fee >= 0),
  quantity_os integer NOT NULL DEFAULT 1 CHECK (quantity_os > 0),
  amount_due numeric(15, 2) NOT NULL CHECK (amount_due >= 0),
  expected_date date,
  paid_date date,
  payment_status text NOT NULL DEFAULT 'Não realizado'
    CHECK (payment_status IN ('Não realizado', 'Pagamento realizado', 'Parcial', 'Cancelado', 'Não se aplica')),
  notes text,
  cancellation_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (payment_status <> 'Pagamento realizado' OR paid_date IS NOT NULL),
  CHECK (payment_type = 'OS' OR demand_id IS NULL)
);

CREATE TABLE demand_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  imported_at timestamptz NOT NULL DEFAULT now(),
  total_rows integer NOT NULL DEFAULT 0,
  total_imported integer NOT NULL DEFAULT 0,
  total_ignored integer NOT NULL DEFAULT 0,
  total_errors integer NOT NULL DEFAULT 0,
  report jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE demand_audit_events (
  id bigserial PRIMARY KEY,
  entity text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  previous_data jsonb,
  new_data jsonb,
  user_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX demands_arrival_idx ON demands (arrival_date DESC);
CREATE INDEX demands_deadline_idx ON demands (client_deadline, demand_status);
CREATE INDEX demands_partner_idx ON demands (partner_id);
CREATE INDEX demands_engineer_idx ON demands (engineer_id);
CREATE INDEX payments_status_idx ON payments (payment_status, expected_date);
CREATE INDEX demand_audit_entity_idx ON demand_audit_events (entity, entity_id, created_at DESC);
