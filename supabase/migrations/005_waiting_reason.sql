-- Grund für "Wartet auf" Status
ALTER TABLE cases ADD COLUMN IF NOT EXISTS waiting_reason TEXT;
