-- ─────────────────────────────────────────────────────────────────────────────
-- C1 — Investors can read approved projects
--
-- Problem: the existing own_projects_select policy uses (auth.uid() = user_id
-- OR is_admin()), so authenticated investors who don't own the project get an
-- empty deal-flow list. A supplementary PERMISSIVE policy on SELECT allows any
-- authenticated user to read rows whose status is 'approved'.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY approved_projects_read ON public.projects
  FOR SELECT TO authenticated
  USING (status = 'approved');
