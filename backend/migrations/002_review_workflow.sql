ALTER TABLE property_listing_links
  ADD CONSTRAINT property_listing_links_listing_unique UNIQUE (listing_id);

CREATE TABLE search_job_properties (
  job_id uuid NOT NULL REFERENCES search_jobs(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES canonical_properties(id),
  representative_listing_id uuid NOT NULL REFERENCES source_listings(id),
  representative_price numeric(15, 2) NOT NULL CHECK (representative_price > 0),
  distance_meters numeric(12, 2) NOT NULL CHECK (distance_meters >= 0),
  review_status text NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  PRIMARY KEY (job_id, property_id)
);

CREATE TABLE sample_review_events (
  id bigserial PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES search_jobs(id) ON DELETE CASCADE,
  valuation_subject_id uuid NOT NULL REFERENCES valuation_subjects(id),
  property_id uuid NOT NULL REFERENCES canonical_properties(id),
  action text NOT NULL CHECK (action IN ('approved', 'rejected', 'revoked')),
  reason text NOT NULL,
  reviewer text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX search_job_properties_status_idx
  ON search_job_properties (job_id, review_status);

CREATE INDEX sample_review_events_property_idx
  ON sample_review_events (property_id, created_at DESC);
