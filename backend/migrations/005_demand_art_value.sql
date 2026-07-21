ALTER TABLE demands
  ADD COLUMN IF NOT EXISTS art_value numeric(15, 2) CHECK (art_value IS NULL OR art_value >= 0);

CREATE INDEX IF NOT EXISTS demands_art_value_idx ON demands (art_value);
