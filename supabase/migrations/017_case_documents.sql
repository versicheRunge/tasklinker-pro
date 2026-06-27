-- Case documents: store local/network file paths attached to cases
CREATE TABLE IF NOT EXISTS case_documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  file_path   TEXT NOT NULL,
  description TEXT,
  added_by    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_case_documents" ON case_documents;
CREATE POLICY "auth_case_documents" ON case_documents
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON case_documents TO authenticated;
