-- Allow admins to read and update ALL user_tasks (needed for team oversight + reassignment)
DROP POLICY IF EXISTS "own_tasks" ON user_tasks;

CREATE POLICY "own_tasks" ON user_tasks
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
