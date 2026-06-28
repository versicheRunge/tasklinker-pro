-- Add assignment support to user_tasks
ALTER TABLE user_tasks ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Backfill: existing tasks were self-created
UPDATE user_tasks SET created_by = user_id WHERE created_by IS NULL;

-- Update RLS: assignee AND creator can see the task
DROP POLICY IF EXISTS "own_tasks" ON user_tasks;
CREATE POLICY "own_tasks" ON user_tasks
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR created_by = auth.uid())
  WITH CHECK (user_id = auth.uid() OR created_by = auth.uid());
