-- Zusätzliche Spalten für Kalender-Ereignisse
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'other';
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES profiles(id);
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS working_days_count integer;
