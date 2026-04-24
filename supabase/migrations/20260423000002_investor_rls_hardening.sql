-- ─────────────────────────────────────────────────────────────────────────────
-- Investor audit P0 fixes — RLS hardening
--
-- I-C4 — approved_projects_read was anon-readable ("SELECT USING status=approved"
--         with no auth clause). The landing page promises "dossiers confidentiels"
--         but the moment the first approval landed, every holder of the public
--         anon key could enumerate titles / amounts / sectors. Restrict to
--         authenticated users.
--
-- I-C5 — deal_interests INSERT was available to any authenticated user, so a
--         project owner (role=client) could "express interest" in their own or
--         anyone's project, firing misleading admin notifications and spamming
--         the pipeline. Split the ALL policy into manage-own + a strict INSERT
--         policy that requires investor-or-admin role, target project in
--         'approved' status, and a non-self project.
--
-- I-C7 — investor_profiles_own had USING but no WITH CHECK. That let a tampered
--         client INSERT rows with spoofed user_id (invisible to them, pollution
--         in the DB) or UPDATE to rewrite user_id. Add WITH CHECK.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── I-C4 ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS approved_projects_read ON public.projects;
CREATE POLICY approved_projects_read ON public.projects
  FOR SELECT
  USING (
    status = 'approved'
    AND auth.role() = 'authenticated'
  );

-- ── I-C5 ────────────────────────────────────────────────────────────────────
-- Replace the permissive ALL policy with narrower per-action policies.
DROP POLICY IF EXISTS deal_interests_investor_or_admin ON public.deal_interests;

-- Owner of the interest can SELECT their own rows
CREATE POLICY deal_interests_own_select ON public.deal_interests
  FOR SELECT
  USING ((auth.uid() = investor_user_id) OR is_admin());

-- Owner can UPDATE their own rows (we don't actually expose UPDATE in UI yet,
-- but admin may change status via a future action)
CREATE POLICY deal_interests_own_update ON public.deal_interests
  FOR UPDATE
  USING ((auth.uid() = investor_user_id) OR is_admin())
  WITH CHECK ((auth.uid() = investor_user_id) OR is_admin());

-- Owner can DELETE (if we ever wire an "annuler mon intérêt" button)
CREATE POLICY deal_interests_own_delete ON public.deal_interests
  FOR DELETE
  USING ((auth.uid() = investor_user_id) OR is_admin());

-- Strict INSERT: only investor/admin, only on approved projects, never self
CREATE POLICY deal_interests_strict_insert ON public.deal_interests
  FOR INSERT
  WITH CHECK (
    auth.uid() = investor_user_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('investor','admin')
    )
    AND investor_user_id <> (
      SELECT user_id FROM public.projects WHERE id = project_id
    )
    AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND status = 'approved'
    )
  );

-- (Existing deal_interests_project_owner_read policy stays — project owners can
-- still read who expressed interest in their projects.)

-- ── I-C7 ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS investor_profiles_own ON public.investor_profiles;
CREATE POLICY investor_profiles_own ON public.investor_profiles
  FOR ALL
  USING (
    (auth.uid() = user_id)
    OR (EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    ))
  )
  WITH CHECK (
    (auth.uid() = user_id)
    OR (EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    ))
  );
