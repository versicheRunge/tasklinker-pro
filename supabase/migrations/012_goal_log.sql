CREATE TABLE IF NOT EXISTS goal_contribution_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id    UUID REFERENCES goals(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  delta      INT NOT NULL DEFAULT 1,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE goal_contribution_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read logs"
  ON goal_contribution_log FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated insert logs"
  ON goal_contribution_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');
