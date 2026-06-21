-- Agency settings: generic key/value store for agency-level configuration
CREATE TABLE IF NOT EXISTS agency_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Only admins can write; all authenticated users can read
ALTER TABLE agency_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agency_settings_read" ON agency_settings;
CREATE POLICY "agency_settings_read" ON agency_settings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "agency_settings_admin_write" ON agency_settings;
CREATE POLICY "agency_settings_admin_write" ON agency_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
