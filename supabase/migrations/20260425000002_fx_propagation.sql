-- ─────────────────────────────────────────────────────────────────────────────
-- D-2 — FX-rate propagation
--
-- When a row in fx_rates is updated (weekly cron or manual admin refresh),
-- every project priced in that currency should have its normalized_usd_amount
-- recomputed. Without this trigger, yesterday's rate sticks around on all
-- existing projects forever and deal-flow sorting gradually drifts wrong.
--
-- Policy notes:
--  * Fires only when rate_to_usd actually changes (IS DISTINCT FROM).
--  * Matches projects where `currency = NEW.currency` AND, if the updated
--    row is USD, also those with NULL currency (consistent with the existing
--    projects_compute_normalized_usd trigger's COALESCE(currency,'USD')).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fx_rates_propagate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_affected integer;
BEGIN
  IF NEW.rate_to_usd IS NOT DISTINCT FROM OLD.rate_to_usd THEN
    RETURN NEW;
  END IF;

  UPDATE public.projects
  SET normalized_usd_amount = amount_requested * NEW.rate_to_usd
  WHERE amount_requested IS NOT NULL
    AND (
      currency = NEW.currency
      OR (NEW.currency = 'USD' AND currency IS NULL)
    );

  GET DIAGNOSTICS v_affected = ROW_COUNT;

  -- Leave a breadcrumb so admins can see propagation took effect.
  INSERT INTO public.activity_log (actor_id, target_type, target_id, action, metadata)
  VALUES (
    NULL, 'fx_rates', NULL,
    'fx_rate_propagated_' || NEW.currency,
    jsonb_build_object(
      'currency',       NEW.currency,
      'old_rate',       OLD.rate_to_usd,
      'new_rate',       NEW.rate_to_usd,
      'rows_affected',  v_affected
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fx_rates_propagate_trigger ON public.fx_rates;
CREATE TRIGGER fx_rates_propagate_trigger
  AFTER UPDATE OF rate_to_usd ON public.fx_rates
  FOR EACH ROW
  EXECUTE FUNCTION public.fx_rates_propagate();

COMMENT ON FUNCTION public.fx_rates_propagate() IS
  'D-2: when fx_rates.rate_to_usd changes, recomputes normalized_usd_amount for every project in that currency.';
