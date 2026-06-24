-- Urlaubsansprüche pro Mitarbeiter und Jahr
CREATE TABLE IF NOT EXISTS vacation_allowances (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year        INTEGER NOT NULL,
  total_days  INTEGER NOT NULL DEFAULT 30,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, year)
);

ALTER TABLE vacation_allowances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_all" ON vacation_allowances FOR ALL USING (auth.role() = 'authenticated');
GRANT ALL ON vacation_allowances TO postgres, anon, authenticated, service_role;
