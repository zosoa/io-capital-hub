-- ─────────────────────────────────────────────────────────────────────────────
-- project-logos storage bucket + owner-scoped policies
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-logos', 'project-logos', true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "project_logos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-logos');

CREATE POLICY "project_logos_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "project_logos_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'project-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "project_logos_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
