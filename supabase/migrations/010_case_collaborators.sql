CREATE TABLE IF NOT EXISTS case_collaborators (
  case_id    UUID REFERENCES cases(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (case_id, user_id)
);

ALTER TABLE case_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read case_collaborators"
  ON case_collaborators FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated insert case_collaborators"
  ON case_collaborators FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete case_collaborators"
  ON case_collaborators FOR DELETE USING (auth.role() = 'authenticated');
