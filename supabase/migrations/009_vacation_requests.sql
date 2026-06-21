CREATE TABLE IF NOT EXISTS vacation_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type         TEXT NOT NULL DEFAULT 'vacation', -- 'vacation' | 'sick'
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  working_days INT NOT NULL DEFAULT 1,
  note         TEXT,
  status       TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  reviewed_by  UUID REFERENCES profiles(id),
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE vacation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own requests or admin sees all"
  ON vacation_requests FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users create own requests"
  ON vacation_requests FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin updates requests"
  ON vacation_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
