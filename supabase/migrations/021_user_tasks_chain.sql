-- Track reassignment chain for accountability
ALTER TABLE user_tasks
  ADD COLUMN IF NOT EXISTS original_assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reassigned_from_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Backfill: tasks already assigned to someone other than creator
UPDATE user_tasks
  SET original_assignee_id = user_id
  WHERE created_by IS DISTINCT FROM user_id
    AND original_assignee_id IS NULL;

-- RLS already covers user_id = auth.uid() for UPDATE — no policy change needed
