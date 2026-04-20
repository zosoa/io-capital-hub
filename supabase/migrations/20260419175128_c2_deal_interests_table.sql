-- ─────────────────────────────────────────────────────────────────────────────
-- C2 — deal_interests table
--
-- Tracks investor interest expressions against approved projects.
-- Unique constraint on (investor_user_id, project_id) prevents duplicate
-- submissions; the application handles the 23505 error gracefully.
--
-- RLS:
--   - Investors: full CRUD on their own rows
--   - Project owners: SELECT to see who expressed interest in their project
--   - Admins: covered by the investor_or_admin policy via is_admin()
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.deal_interests (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  project_id       uuid NOT NULL REFERENCES public.projects ON DELETE CASCADE,
  message          text,
  status           text NOT NULL DEFAULT 'pending',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),
  UNIQUE (investor_user_id, project_id)
);

ALTER TABLE public.deal_interests ENABLE ROW LEVEL SECURITY;

-- Investor (or admin): full access to own rows
CREATE POLICY deal_interests_investor_or_admin ON public.deal_interests
  FOR ALL
  USING      (auth.uid() = investor_user_id OR is_admin())
  WITH CHECK (auth.uid() = investor_user_id OR is_admin());

-- Project owner: read-only — see who expressed interest in their project
CREATE POLICY deal_interests_project_owner_read ON public.deal_interests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = deal_interests.project_id
        AND projects.user_id = auth.uid()
    )
  );
