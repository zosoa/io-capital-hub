-- ─────────────────────────────────────────────────────────────────────────────
-- D-5 — Soft-delete + GDPR-aligned anonymization
--
-- Before this migration, `deleteAccount()` either (a) admin-deleted the
-- auth.users row (if service key set — cascades to projects, interests,
-- etc.) or (b) tried to set role='deletion_requested' as a fallback — which
-- violates the existing profiles_role_check constraint and silently errors.
--
-- GDPR's right-to-erasure requires PII removal, but investment records
-- (project amounts, admin decisions, investor interest expressions) often
-- need to be retained for due-diligence integrity. Policy:
--   * User clicks "Supprimer mon compte" → profile PII scrubbed immediately.
--   * Name replaced with "Utilisateur supprimé" sentinel.
--   * `deleted_at` timestamp set → dashboard layout redirects to a soft
--     "compte supprimé" page. User can't interact further.
--   * Admin still sees the row (for audit trail) but PII is gone.
--   * If SUPABASE_SERVICE_ROLE_KEY is configured, the server action ALSO
--     deletes auth.users — fully cascading.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Soft-delete column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS profiles_deleted_at_idx
  ON public.profiles(deleted_at)
  WHERE deleted_at IS NOT NULL;

-- 2. Anonymization RPC — runs as SECURITY DEFINER so auth.uid() still gates
--    access (the guard inside the function uses it). The function scrubs
--    PII, preserves role for audit, and stamps deleted_at.
CREATE OR REPLACE FUNCTION public.anonymize_own_profile()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: no authenticated user';
  END IF;

  UPDATE public.profiles
  SET
    full_name        = 'Utilisateur supprimé',
    email            = NULL,
    phone            = NULL,
    organization     = NULL,
    job_title        = NULL,
    avatar_url       = NULL,
    company_logo_url = NULL,
    linkedin_url     = NULL,
    deleted_at       = now()
  WHERE id = v_uid
    AND deleted_at IS NULL; -- idempotent: no-op if already anonymized

  -- If user has an investor_profile, anonymize that too
  UPDATE public.investor_profiles
  SET
    full_name    = 'Investisseur supprimé',
    title        = NULL,
    organization = NULL,
    email        = NULL,
    phone        = NULL,
    linkedin_url = NULL,
    avatar_url   = NULL,
    bio          = NULL,
    is_active    = false
  WHERE user_id = v_uid;

  -- Audit trail — who did it, when
  INSERT INTO public.activity_log (actor_id, target_type, target_id, action, metadata)
  VALUES (
    v_uid, 'profile', v_uid, 'account_anonymized',
    jsonb_build_object('timestamp', now())
  );
END;
$$;

COMMENT ON FUNCTION public.anonymize_own_profile() IS
  'D-5: scrubs PII on caller own profile + investor_profile, sets deleted_at. Business records preserved.';

-- 3. RLS tweak — deleted profiles stay readable by admins (for audit) but
--    the owner sees their own row with `deleted_at` set so the dashboard
--    can detect it and redirect them to a terminal screen.
--    No policy change needed: existing `own_profile_select` allows owner
--    and is_admin(). Keep as-is.
