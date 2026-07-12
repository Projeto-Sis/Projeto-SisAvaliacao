CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE listing_status AS ENUM (
  'collected',
  'normalized',
  'pending_review',
  'approved',
  'rejected',
  'stale'
);

CREATE TYPE validation_severity AS ENUM ('error', 'warning', 'info');

CREATE TABLE valuation_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_project_id text,
  property_type text NOT NULL,
  transaction_type text NOT NULL DEFAULT 'sale',
  address_text text NOT NULL,
  municipality text NOT NULL,
  state_code char(2) NOT NULL,
  coordinates geography(Point, 4326),
  location_precision text NOT NULL DEFAULT 'unknown',
  built_area numeric(12, 2),
  bedrooms smallint,
  suites smallint,
  bathrooms smallint,
  parking_spaces smallint,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE search_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  valuation_subject_id uuid NOT NULL REFERENCES valuation_subjects(id),
  radius_meters integer NOT NULL CHECK (radius_meters BETWEEN 100 AND 5000),
  status text NOT NULL DEFAULT 'pending',
  criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  requested_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  error_message text
);

CREATE TABLE source_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text NOT NULL,
  source_reference text NOT NULL,
  source_url text,
  raw_payload jsonb NOT NULL,
  normalized_payload jsonb,
  status listing_status NOT NULL DEFAULT 'collected',
  property_type text,
  transaction_type text,
  address_text text,
  condominium_name text,
  unit_number text,
  coordinates geography(Point, 4326),
  location_precision text NOT NULL DEFAULT 'unknown',
  price numeric(15, 2),
  area numeric(12, 2),
  bedrooms smallint,
  suites smallint,
  bathrooms smallint,
  parking_spaces smallint,
  source_reliability numeric(4, 3) NOT NULL DEFAULT 0.500 CHECK (source_reliability BETWEEN 0 AND 1),
  active boolean NOT NULL DEFAULT true,
  first_seen_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL,
  collected_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_name, source_reference)
);

CREATE TABLE canonical_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_type text NOT NULL,
  address_text text,
  condominium_name text,
  unit_number text,
  coordinates geography(Point, 4326),
  identity_confidence numeric(5, 4) CHECK (identity_confidence BETWEEN 0 AND 1),
  requires_review boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE property_listing_links (
  property_id uuid NOT NULL REFERENCES canonical_properties(id),
  listing_id uuid NOT NULL REFERENCES source_listings(id),
  duplicate_score numeric(5, 4) NOT NULL CHECK (duplicate_score BETWEEN 0 AND 1),
  decision text NOT NULL CHECK (decision IN ('automatic', 'review', 'manual')),
  reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  linked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (property_id, listing_id)
);

CREATE TABLE listing_price_history (
  id bigserial PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES source_listings(id),
  price numeric(15, 2) NOT NULL CHECK (price > 0),
  observed_at timestamptz NOT NULL,
  UNIQUE (listing_id, observed_at)
);

CREATE TABLE photo_fingerprints (
  listing_id uuid NOT NULL REFERENCES source_listings(id),
  fingerprint text NOT NULL,
  source_position smallint,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (listing_id, fingerprint)
);

CREATE TABLE validation_events (
  id bigserial PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES source_listings(id),
  rule_code text NOT NULL,
  severity validation_severity NOT NULL,
  passed boolean NOT NULL,
  message text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE approved_samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  valuation_subject_id uuid NOT NULL REFERENCES valuation_subjects(id),
  property_id uuid NOT NULL REFERENCES canonical_properties(id),
  representative_listing_id uuid NOT NULL REFERENCES source_listings(id),
  adopted_price numeric(15, 2) NOT NULL CHECK (adopted_price > 0),
  adopted_area numeric(12, 2) NOT NULL CHECK (adopted_area > 0),
  legacy_location smallint NOT NULL CHECK (legacy_location BETWEEN 1 AND 3),
  legacy_standard smallint NOT NULL CHECK (legacy_standard BETWEEN 1 AND 3),
  legacy_conservation smallint NOT NULL CHECK (legacy_conservation BETWEEN 1 AND 3),
  approval_reason text NOT NULL,
  approved_by text NOT NULL,
  approved_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  UNIQUE (valuation_subject_id, property_id)
);

CREATE INDEX valuation_subjects_coordinates_gix ON valuation_subjects USING gist (coordinates);
CREATE INDEX source_listings_coordinates_gix ON source_listings USING gist (coordinates);
CREATE INDEX canonical_properties_coordinates_gix ON canonical_properties USING gist (coordinates);
CREATE INDEX source_listings_active_seen_idx ON source_listings (active, last_seen_at DESC);
CREATE INDEX validation_events_listing_idx ON validation_events (listing_id, created_at DESC);

