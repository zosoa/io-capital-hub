-- ─────────────────────────────────────────────────────────────────────────────
-- Investor audit — functional fixes (I-C1, I-C2, I-C6)
--
-- I-C1 — investor_profiles.priority_sectors stored French display labels
--        ("Énergie", "Agriculture") while projects.sector holds DB keys
--        ("energy", "agriculture"). Sector matching in the deal-flow scorer
--        always scored 0 because the strings never overlapped. Backfill the
--        French → key translation; unknown custom values (typed via "Autre")
--        stay as-is.
--
-- I-C2 — ticket_min/ticket_max were saved as raw numerics without the currency
--        the investor actually picked. Matching then assumed USD for everyone,
--        turning a 100 000 MGA entry (~$22) into a match target of $100k.
--        Add ticket_currency column (default USD for legacy rows).
--
-- I-C6 — no UNIQUE (user_id), so a race during first save could land two rows
--        for the same investor. Add a partial unique index.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── I-C2 — ticket currency column ───────────────────────────────────────────
ALTER TABLE public.investor_profiles
  ADD COLUMN IF NOT EXISTS ticket_currency text NOT NULL DEFAULT 'USD'
    CHECK (ticket_currency IN ('USD','EUR','MGA','MUR','XOF','KES','ZAR'));

-- ── I-C6 — UNIQUE index on user_id ──────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS investor_profiles_user_id_unique
  ON public.investor_profiles(user_id)
  WHERE user_id IS NOT NULL;

-- ── I-C1 — translate French sector labels to DB keys ────────────────────────
-- Maps the labels used by the legacy form (French display strings) onto the
-- keys used by projects.sector. Custom "Autre" values (anything not in the
-- known label set) are left untouched so we don't destroy free-text entries.
WITH mapping(label, key) AS (
  VALUES
    ('Énergie',             'energy'),
    ('Agriculture',         'agriculture'),
    ('Technologie',         'tech'),
    ('Immobilier',          'real_estate'),
    ('Infrastructure',      'infrastructure'),
    ('Industrie',           'manufacturing'),
    ('Tourisme',            'tourism'),
    ('Santé',               'health'),
    ('Éducation',           'education'),
    ('Services financiers', 'financial_services'),
    ('Autre',               'other')
)
UPDATE public.investor_profiles ip
SET priority_sectors = ARRAY(
  SELECT COALESCE(m.key, s)
  FROM unnest(ip.priority_sectors) AS s
  LEFT JOIN mapping m ON m.label = s
)
WHERE priority_sectors IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM unnest(ip.priority_sectors) AS s
    WHERE s IN ('Énergie','Agriculture','Technologie','Immobilier',
                'Infrastructure','Industrie','Tourisme','Santé',
                'Éducation','Services financiers','Autre')
  );

COMMENT ON COLUMN public.investor_profiles.ticket_currency IS
  'Currency of ticket_min/ticket_max. Deal-flow matching normalizes through fx_rates to compare against projects.normalized_usd_amount.';
