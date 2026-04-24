-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: profiles_role_check CHECK constraint was never updated to include
-- 'investor'. The P0-1 migration (`fix_investor_role_on_signup`) wired the
-- handle_new_user trigger to insert role='investor' when the signup intent
-- says so, but this CHECK constraint rejected those rows at the last step,
-- masquerading as a generic "Database error saving new user" in the client.
--
-- Evidence from Supabase auth logs:
--   ERROR: new row for relation "profiles" violates check constraint
--   "profiles_role_check" (SQLSTATE 23514)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role = ANY (ARRAY['client'::text, 'investor'::text, 'admin'::text]));
