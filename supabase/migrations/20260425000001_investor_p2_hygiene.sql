-- ─────────────────────────────────────────────────────────────────────────────
-- Investor audit P2 — schema hygiene
--
-- I-M8 — fx_rates had an anon-readable policy (USING true). Harmless content
--        but unnecessary surface; restrict to authenticated users.
--
-- I-M5 — deal_interests.investor_user_id FKs to profiles(id) while every
--        other investor-side FK points at auth.users(id). Semantically
--        consistent, shortens the cascade chain by one hop.
--
-- I-M4 — photo_consent column default is 'yes' but the investor-profile form
--        defaults the UI control to 'initials' (privacy-preserving). Users
--        who skip the field end up with a DB row claiming they opted into
--        full visibility they never saw. Align DB default with the privacy-
--        preserving form default.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── I-M8 ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS fx_rates_read ON public.fx_rates;
CREATE POLICY fx_rates_read ON public.fx_rates
  FOR SELECT
  USING (auth.role() = 'authenticated' OR is_admin());

-- ── I-M5 ────────────────────────────────────────────────────────────────────
-- Move deal_interests.investor_user_id FK from profiles(id) → auth.users(id).
-- Because every profiles.id already references auth.users.id with CASCADE,
-- the set of valid ids is identical; no data migration needed.
ALTER TABLE public.deal_interests
  DROP CONSTRAINT IF EXISTS deal_interests_investor_user_id_fkey;
ALTER TABLE public.deal_interests
  ADD CONSTRAINT deal_interests_investor_user_id_fkey
    FOREIGN KEY (investor_user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- ── I-M4 ────────────────────────────────────────────────────────────────────
ALTER TABLE public.investor_profiles
  ALTER COLUMN photo_consent SET DEFAULT 'initials';
