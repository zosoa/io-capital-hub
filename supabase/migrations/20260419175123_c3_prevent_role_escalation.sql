-- ─────────────────────────────────────────────────────────────────────────────
-- C3 — Prevent self-role-escalation
--
-- Problem: the own_profile_update RLS policy allows users to UPDATE any column
-- of their own profile row, including `role`. A user could set themselves to
-- 'admin' directly via the client-side Supabase SDK.
--
-- Fix: BEFORE UPDATE trigger raises an exception if `role` changes and the
-- caller is not already an admin. SECURITY DEFINER ensures is_admin() checks
-- the stored role in a clean context.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: only admins can change the role field';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_role_protection
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();
