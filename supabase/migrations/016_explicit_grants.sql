-- Ensure all core tables have explicit grants for authenticated role.
-- The schema.sql has RLS policies for authenticated users, but explicit GRANTs
-- are required in addition to policies for Supabase to allow access.

GRANT SELECT, INSERT, UPDATE, DELETE ON cases               TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON case_activities     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON checklist_items     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON case_collaborators  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON calendar_events     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_channels       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_messages       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles            TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON goals               TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON goal_contributions  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON checklist_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON goal_contribution_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vacation_allowances TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vacation_requests   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON agency_settings     TO authenticated;

-- Sequences (needed for UUID generation in some setups)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
