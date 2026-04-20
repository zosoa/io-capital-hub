-- ─────────────────────────────────────────────────────────────────────────────
-- C4 — Protect boost_score from client-side manipulation
--
-- Problem: the own_projects_update RLS policy allows project owners to UPDATE
-- any column of their own project, including boost_score. An owner could inflate
-- their score to gain unfair visibility in the deal-flow ranking.
--
-- Fix: BEFORE UPDATE trigger raises an exception if boost_score changes and the
-- caller is not an admin.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.prevent_boost_score_manipulation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.boost_score IS DISTINCT FROM OLD.boost_score AND NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: only admins can change boost_score';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_boost_score_protection
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.prevent_boost_score_manipulation();
