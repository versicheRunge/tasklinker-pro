-- Fix: vacation_requests needs explicit GRANT for authenticated role.
-- The INSERT policy exists (migration 009) but without GRANT the role gets denied.
GRANT SELECT, INSERT ON vacation_requests TO authenticated;

-- Admin also needs UPDATE (for approve/reject)
GRANT UPDATE ON vacation_requests TO authenticated;

-- Fix: chat_messages delete policy (own messages + admin)
-- First check if it already exists; if not, create it.
DROP POLICY IF EXISTS "Users delete own messages" ON chat_messages;
CREATE POLICY "Users delete own messages" ON chat_messages
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

GRANT DELETE ON chat_messages TO authenticated;

-- Also ensure agency_settings grants are set (migration 014)
GRANT SELECT, INSERT, UPDATE ON agency_settings TO authenticated;
