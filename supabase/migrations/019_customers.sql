-- Customer reference list (Kundenstamm)
-- Only stores a reference (name + Netzlaufwerk folder path). Actual customer data stays local.
CREATE TABLE IF NOT EXISTS customers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  folder_path  TEXT,           -- Netzlaufwerk path, e.g. Z:\Kunden\Mustermann Max
  phone        TEXT,
  email        TEXT,
  notes        TEXT,
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_customers" ON customers;
CREATE POLICY "auth_customers" ON customers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON customers TO authenticated;
