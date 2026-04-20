-- ─────────────────────────────────────────────────────────────────────────────
-- B6 — Project activity tab for owners
--
-- Adds the missing pieces so a project owner can see engagement on their deal:
--   1. project_views — 1 row per investor, per project, on first view
--   2. RLS on activity_log — owners can read status-change events for their
--      own project (without exposing cross-project admin activity)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── project_views ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_views (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.projects ON DELETE CASCADE,
  viewer_id   uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  first_seen  timestamptz DEFAULT now(),
  last_seen   timestamptz DEFAULT now(),
  view_count  integer NOT NULL DEFAULT 1,
  UNIQUE (project_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS project_views_project_id_idx ON public.project_views(project_id);

ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;

-- Viewer: can insert/update their own view row
DROP POLICY IF EXISTS project_views_viewer_write ON public.project_views;
CREATE POLICY project_views_viewer_write ON public.project_views
  FOR ALL
  USING      (auth.uid() = viewer_id OR is_admin())
  WITH CHECK (auth.uid() = viewer_id OR is_admin());

-- Project owner: read-only — count how many investors have viewed
DROP POLICY IF EXISTS project_views_owner_read ON public.project_views;
CREATE POLICY project_views_owner_read ON public.project_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_views.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- ── RPC: increment view (upsert) ────────────────────────────────────────────
-- Investors don't need to know whether a row exists — a single call handles it.
CREATE OR REPLACE FUNCTION public.record_project_view(p_project_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_owner uuid;
BEGIN
  IF v_user IS NULL THEN
    RETURN;
  END IF;

  -- Don't count the owner viewing their own project
  SELECT user_id INTO v_owner FROM public.projects WHERE id = p_project_id;
  IF v_owner = v_user THEN
    RETURN;
  END IF;

  INSERT INTO public.project_views (project_id, viewer_id)
    VALUES (p_project_id, v_user)
  ON CONFLICT (project_id, viewer_id)
    DO UPDATE SET last_seen = now(),
                  view_count = project_views.view_count + 1;
END;
$$;

-- ── Activity log — project owner can read events about their own project ─────
-- The existing admin_log_select policy stays; this ADDS a narrower owner read.
DROP POLICY IF EXISTS activity_log_project_owner_read ON public.activity_log;
CREATE POLICY activity_log_project_owner_read ON public.activity_log
  FOR SELECT
  USING (
    target_type = 'project'
    AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = activity_log.target_id
        AND projects.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.project_views IS
  'Per-investor view tracking. Owners see aggregate counts only.';
COMMENT ON FUNCTION public.record_project_view(uuid) IS
  'Upsert a view row for the current investor. Called from the deal-flow detail page.';
