-- ─────────────────────────────────────────────────────────────────────────────
-- Fix projects UPDATE policy to allow the boost wizard to save columns.
-- The original policy was too restrictive; replaced with a broader allow for
-- own rows — boost_score write protection is enforced by a BEFORE UPDATE trigger
-- (see migration c4_protect_boost_score).
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS own_projects_update ON public.projects;

CREATE POLICY own_projects_update ON public.projects
  FOR UPDATE USING (auth.uid() = user_id OR is_admin());
