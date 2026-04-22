-- ─────────────────────────────────────────────────────────────────────────────
-- P0-1 — Fix investor role assignment at signup
--
-- Problem: the signup flow attempts `update profiles set role='investor'`
-- client-side, which the `enforce_role_protection` trigger (C3) correctly
-- blocks to prevent self-escalation. Result: investor signups silently fall
-- back to role='client'.
--
-- Fix: `handle_new_user` runs as SECURITY DEFINER at auth.users INSERT time,
-- before C3 can fire. It already creates the profile row — extend it to read
-- `raw_user_meta_data->>'intent'` and set the role in the same atomic INSERT.
--
-- The client now passes `options: { data: { intent: "investor" | "client" } }`
-- to supabase.auth.signUp().
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_intent text := NEW.raw_user_meta_data->>'intent';
  v_role   text := CASE WHEN v_intent = 'investor' THEN 'investor' ELSE 'client' END;
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    v_role
  )
  ON CONFLICT (id) DO UPDATE
    -- If a row already exists (shouldn't happen, but defensively): only upgrade
    -- role when moving from 'client' → 'investor'. Never downgrade, never
    -- touch admin.
    SET role = CASE
      WHEN public.profiles.role = 'client' AND EXCLUDED.role = 'investor'
        THEN 'investor'
      ELSE public.profiles.role
    END;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Creates the profile row on auth.users INSERT. Sets role based on raw_user_meta_data.intent (investor/client).';
