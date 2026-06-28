-- Split user_tasks RLS: SELECT/INSERT/UPDATE for assignee or creator,
-- but DELETE only for the creator or admin — prevents assignees from
-- silently deleting tasks assigned to them.

DROP POLICY IF EXISTS "own_tasks" ON user_tasks;

-- Read + write (insert/update) for assignee, creator, or admin
CREATE POLICY "own_tasks_rw" ON user_tasks
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "own_tasks_insert" ON user_tasks
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "own_tasks_update" ON user_tasks
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    user_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- DELETE: only creator or admin — assignee cannot silently remove a received task
CREATE POLICY "own_tasks_delete" ON user_tasks
  FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
