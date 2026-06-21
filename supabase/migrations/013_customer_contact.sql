-- Add customer contact fields to cases
ALTER TABLE cases ADD COLUMN IF NOT EXISTS customer_email TEXT DEFAULT '';
ALTER TABLE cases ADD COLUMN IF NOT EXISTS customer_phone TEXT DEFAULT '';

-- Add avatar storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload/read avatars
-- (DROP IF EXISTS is valid PG syntax; CREATE POLICY IF NOT EXISTS is not)
DROP POLICY IF EXISTS "avatars_upload" ON storage.objects;
CREATE POLICY "avatars_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_select" ON storage.objects;
CREATE POLICY "avatars_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_delete" ON storage.objects;
CREATE POLICY "avatars_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars');
