-- ─────────────────────────────────────────────────────────────────────────────
-- D-4 — activity_log retention
--
-- activity_log grows unbounded because every admin status change, every
-- deal-interest insert, and every notification-trigger breadcrumb adds a row.
-- Over time this hurts query performance and costs storage. Policy: keep
-- 18 months of history — more than enough for due-diligence replay, and
-- aligns with common GDPR records-retention norms.
--
-- Implementation: pg_cron runs a cleanup function on the 1st of each month
-- at 03:00 UTC (low-traffic window across IO timezones).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.cleanup_old_activity_log()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer;
BEGIN
  DELETE FROM public.activity_log
  WHERE created_at < NOW() - INTERVAL '18 months';

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  -- Drop a self-referential breadcrumb so ops can see retention is running.
  INSERT INTO public.activity_log (actor_id, target_type, target_id, action, metadata)
  VALUES (NULL, 'system', NULL, 'activity_log_retention_ran',
    jsonb_build_object('rows_deleted', v_deleted, 'cutoff_days', 548));

  RETURN v_deleted;
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_activity_log() IS
  'D-4: deletes activity_log rows older than 18 months. Called monthly by pg_cron.';

-- Schedule: 03:00 UTC on the 1st of every month.
-- First call unschedule in case this migration re-runs.
DO $$
DECLARE
  v_job_id integer;
BEGIN
  SELECT jobid INTO v_job_id FROM cron.job WHERE jobname = 'activity_log_retention';
  IF v_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(v_job_id);
  END IF;
END $$;

SELECT cron.schedule(
  'activity_log_retention',
  '0 3 1 * *',
  $$ SELECT public.cleanup_old_activity_log(); $$
);
