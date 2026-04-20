-- ─────────────────────────────────────────────────────────────────────────────
-- B5 — Deal flow save/bookmark feature
--
-- Lets investors save projects to revisit later.
-- RLS:
--   - Investor: full CRUD on own saves
--   - Project owner: SELECT to see how many investors saved their project
--   - Admin: full access via is_admin()
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.deal_saves (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, project_id)
);

CREATE INDEX IF NOT EXISTS deal_saves_user_id_idx    ON public.deal_saves(user_id);
CREATE INDEX IF NOT EXISTS deal_saves_project_id_idx ON public.deal_saves(project_id);

ALTER TABLE public.deal_saves ENABLE ROW LEVEL SECURITY;

-- Owner of the save (the investor) — full access
DROP POLICY IF EXISTS deal_saves_owner ON public.deal_saves;
CREATE POLICY deal_saves_owner ON public.deal_saves
  FOR ALL
  USING      (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());

-- Project owner — read-only, counts of saves on their project
DROP POLICY IF EXISTS deal_saves_project_owner_read ON public.deal_saves;
CREATE POLICY deal_saves_project_owner_read ON public.deal_saves
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = deal_saves.project_id
        AND projects.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.deal_saves IS
  'Investor bookmarks — one row per (investor, project) pair.';
