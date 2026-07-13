ALTER TABLE demands
  ADD COLUMN IF NOT EXISTS proponent_name text,
  ADD COLUMN IF NOT EXISTS proponent_cpf text;

CREATE INDEX IF NOT EXISTS demands_os_number_idx ON demands (os_number);
CREATE INDEX IF NOT EXISTS demands_final_os_number_idx ON demands (final_os_number);
CREATE INDEX IF NOT EXISTS demands_proponent_cpf_digits_idx
  ON demands (regexp_replace(COALESCE(proponent_cpf, ''), '[^0-9]', '', 'g'));
