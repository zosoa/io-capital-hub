-- ─────────────────────────────────────────────────────────────────────────────
-- B7 — Currency normalization
--
-- Projects can be denominated in USD, EUR, MGA, MUR, XOF. Sorting/filtering
-- by raw amount_requested gives nonsense results (500 000 MGA ≈ 110 USD).
--
-- This migration:
--   1. Creates fx_rates table seeded with approximate rates (Apr 2026)
--   2. Adds normalized_usd_amount column on projects
--   3. Adds a trigger that recomputes it on insert/update
--   4. Backfills the column for existing rows
-- ─────────────────────────────────────────────────────────────────────────────

-- ── fx_rates table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.fx_rates (
  currency   text PRIMARY KEY,
  rate_to_usd numeric NOT NULL,   -- how many USD one unit of `currency` buys
  updated_at timestamptz DEFAULT now()
);

-- RLS: read-only for everyone; only service role / admin can write
ALTER TABLE public.fx_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS fx_rates_read  ON public.fx_rates;
CREATE POLICY fx_rates_read ON public.fx_rates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS fx_rates_admin_write ON public.fx_rates;
CREATE POLICY fx_rates_admin_write ON public.fx_rates
  FOR ALL
  USING      (is_admin())
  WITH CHECK (is_admin());

-- Seed with approximate rates (April 2026). Admins can update later.
INSERT INTO public.fx_rates (currency, rate_to_usd) VALUES
  ('USD', 1.0),
  ('EUR', 1.08),
  ('MGA', 0.00022),   -- 1 MGA ≈ 0.00022 USD (4 500 MGA / USD)
  ('MUR', 0.022),     -- 1 MUR ≈ 0.022 USD (45 MUR / USD)
  ('XOF', 0.00165),   -- 1 XOF ≈ 0.00165 USD (605 XOF / USD)
  ('KES', 0.0076),    -- Kenyan shilling
  ('ZAR', 0.054)      -- South African rand
ON CONFLICT (currency) DO NOTHING;

-- ── normalized_usd_amount column on projects ─────────────────────────────────
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS normalized_usd_amount numeric;

CREATE INDEX IF NOT EXISTS projects_normalized_usd_amount_idx
  ON public.projects(normalized_usd_amount);

-- ── Trigger to recompute on insert/update ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.projects_compute_normalized_usd()
RETURNS trigger LANGUAGE plpgsql
AS $$
DECLARE
  r numeric;
BEGIN
  IF NEW.amount_requested IS NULL THEN
    NEW.normalized_usd_amount := NULL;
    RETURN NEW;
  END IF;

  SELECT rate_to_usd INTO r FROM public.fx_rates
   WHERE currency = COALESCE(NEW.currency, 'USD');

  IF r IS NULL THEN
    -- Unknown currency: fall back to the raw amount to avoid losing the row
    NEW.normalized_usd_amount := NEW.amount_requested;
  ELSE
    NEW.normalized_usd_amount := NEW.amount_requested * r;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS projects_normalize_usd_trigger ON public.projects;
CREATE TRIGGER projects_normalize_usd_trigger
  BEFORE INSERT OR UPDATE OF amount_requested, currency
  ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.projects_compute_normalized_usd();

-- ── Backfill existing rows ───────────────────────────────────────────────────
UPDATE public.projects p
SET normalized_usd_amount = p.amount_requested * COALESCE(
  (SELECT rate_to_usd FROM public.fx_rates WHERE currency = COALESCE(p.currency, 'USD')),
  1
)
WHERE p.amount_requested IS NOT NULL
  AND p.normalized_usd_amount IS NULL;

COMMENT ON COLUMN public.projects.normalized_usd_amount IS
  'Auto-computed USD-equivalent of amount_requested using fx_rates. Use this for sort/filter.';
COMMENT ON TABLE public.fx_rates IS
  'Currency conversion rates. Admins update manually; rate_to_usd = how many USD 1 unit buys.';
