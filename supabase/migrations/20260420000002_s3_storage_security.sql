-- ─────────────────────────────────────────────────────────────────────────────
-- S3 — Harden storage bucket upload policies
-- Ensures uploads are:
--   1. Scoped to the uploading user's own folder
--   2. Limited to allowed MIME types
--   3. Max 5 MB per file (enforced at bucket level — already set)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Avatars bucket ───────────────────────────────────────────────────────────
-- Drop the permissive insert policy and replace with a scoped one
DROP POLICY IF EXISTS "avatars_insert" ON storage.objects;

CREATE POLICY "avatars_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND (storage.extension(name) = ANY(ARRAY['jpg','jpeg','png','webp','gif']))
  );

DROP POLICY IF EXISTS "avatars_update" ON storage.objects;

CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND (storage.extension(name) = ANY(ARRAY['jpg','jpeg','png','webp','gif']))
  );

-- ── Project logos bucket ─────────────────────────────────────────────────────
-- The project-logos bucket stores files under {project_id}/logo.{ext}.
-- We restrict uploads to the owner of that project.
DROP POLICY IF EXISTS "project_logos_insert" ON storage.objects;

CREATE POLICY "project_logos_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-logos'
    AND auth.uid() IS NOT NULL
    AND (storage.extension(name) = ANY(ARRAY['jpg','jpeg','png','webp','svg']))
    AND (
      -- The first path segment is the project id; verify ownership
      EXISTS (
        SELECT 1 FROM public.projects
        WHERE id::text = (storage.foldername(name))[1]
          AND user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "project_logos_update" ON storage.objects;

CREATE POLICY "project_logos_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'project-logos'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE id::text = (storage.foldername(name))[1]
        AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'project-logos'
    AND (storage.extension(name) = ANY(ARRAY['jpg','jpeg','png','webp','svg']))
  );
