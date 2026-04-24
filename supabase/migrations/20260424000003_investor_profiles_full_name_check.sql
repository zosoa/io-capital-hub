-- ─────────────────────────────────────────────────────────────────────────────
-- I-H7 — Defence-in-depth CHECK on investor_profiles.full_name
--
-- Column is NOT NULL, but an empty or whitespace-only string still slips
-- through at the DB layer. The client has validate() but a tampered request
-- would produce a row with full_name='   ' and every display ("Par NOM",
-- admin table, etc.) would render a ghost.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.investor_profiles
  DROP CONSTRAINT IF EXISTS investor_profiles_full_name_nonempty;

ALTER TABLE public.investor_profiles
  ADD CONSTRAINT investor_profiles_full_name_nonempty
    CHECK (length(btrim(full_name)) > 0);
