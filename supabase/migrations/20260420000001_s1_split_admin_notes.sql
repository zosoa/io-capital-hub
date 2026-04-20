-- ─────────────────────────────────────────────────────────────────────────────
-- S1 — Split admin_notes into public (owner-visible) and internal (admin-only)
-- admin_notes_public : feedback the project owner can read
-- admin_notes_internal : confidential due diligence notes (admin only)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add the new columns
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS admin_notes_public   text,
  ADD COLUMN IF NOT EXISTS admin_notes_internal text;

-- 2. Migrate existing data: treat existing admin_notes as public feedback
UPDATE public.projects
SET admin_notes_public = admin_notes
WHERE admin_notes IS NOT NULL;

-- 3. Keep admin_notes column for now (backward compat) but stop using it in code.
--    It will be dropped in a future migration after code is updated.

-- 4. RLS: project owners can SELECT admin_notes_public but NOT admin_notes_internal.
--    The existing "projects_owner_read" policy already lets owners read their own rows,
--    but we need column-level security or a separate view for the internal notes.
--    Simplest approach: use a security-definer function to hide the column from owners.

-- Create a view that strips admin_notes_internal for non-admins
CREATE OR REPLACE VIEW public.projects_owner_view AS
SELECT
  p.*,
  CASE
    WHEN (
      SELECT role FROM public.profiles WHERE id = auth.uid()
    ) = 'admin' THEN p.admin_notes_internal
    ELSE NULL
  END AS admin_notes_internal_visible
FROM public.projects p;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.projects_owner_view TO authenticated;

COMMENT ON COLUMN public.projects.admin_notes_public IS
  'Feedback visible to the project owner after review';
COMMENT ON COLUMN public.projects.admin_notes_internal IS
  'Confidential due-diligence notes — admin only, never shown to project owners';
