-- ─────────────────────────────────────────────────────────────────────────────
-- Initial schema — profiles, projects, project_documents, activity_log
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Helper: is_admin() ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ── profiles ──────────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id                   uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name            text,
  email                text,
  phone                text,
  organization         text,
  job_title            text,
  country              text DEFAULT 'Madagascar',
  role                 text DEFAULT 'client',
  avatar_url           text,
  onboarding_completed boolean DEFAULT false,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_profile_insert ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY own_profile_select ON public.profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY own_profile_update ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR is_admin());

-- ── handle_new_user trigger ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── update_updated_at ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ── projects ──────────────────────────────────────────────────────────────────
CREATE TABLE public.projects (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title                   text NOT NULL,
  slug                    text,
  tagline                 text,
  description             text,
  sector                  text,
  sub_sector              text,
  stage                   text,
  funding_type            text,
  amount_requested        numeric,
  currency                text DEFAULT 'USD',
  funding_term_months     integer,
  use_of_funds            text,
  country                 text DEFAULT 'Madagascar',
  city                    text,
  region                  text,
  legal_structure         text,
  years_in_operation      integer DEFAULT 0,
  team_size               integer,
  has_existing_revenue    boolean DEFAULT false,
  annual_revenue          numeric,
  ebitda                  numeric,
  total_assets            numeric,
  existing_debt           numeric,
  has_collateral          boolean DEFAULT false,
  collateral_type         text,
  collateral_description  text,
  collateral_value        numeric,
  job_creation_expected   integer,
  sdg_alignment           text[],
  impact_description      text,
  status                  text DEFAULT 'draft',
  admin_notes             text,
  rejection_reason        text,
  submitted_at            timestamptz,
  reviewed_at             timestamptz,
  reviewed_by             uuid,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_projects_insert ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY own_projects_select ON public.projects
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY own_projects_update ON public.projects
  FOR UPDATE USING (auth.uid() = user_id OR is_admin());

CREATE POLICY admin_projects_delete ON public.projects
  FOR DELETE USING (is_admin());

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ── project_documents ─────────────────────────────────────────────────────────
CREATE TABLE public.project_documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES public.projects ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  document_type text,
  file_name     text,
  file_url      text,
  file_size     integer,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_docs_insert ON public.project_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY own_docs_select ON public.project_documents
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY own_docs_delete ON public.project_documents
  FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- ── activity_log ──────────────────────────────────────────────────────────────
CREATE TABLE public.activity_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid REFERENCES auth.users ON DELETE SET NULL,
  target_type text,
  target_id   uuid,
  action      text,
  metadata    jsonb,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY log_insert ON public.activity_log
  FOR INSERT WITH CHECK (auth.uid() = actor_id OR is_admin());

CREATE POLICY admin_log_select ON public.activity_log
  FOR SELECT USING (is_admin());
