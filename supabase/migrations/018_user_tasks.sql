-- Personal user tasks (To-Do list, not linked to a case)
CREATE TABLE IF NOT EXISTS user_tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  due_date    DATE,
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own tasks
DROP POLICY IF EXISTS "own_tasks" ON user_tasks;
CREATE POLICY "own_tasks" ON user_tasks
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON user_tasks TO authenticated;
