-- ─────────────────────────────────────────────────────────────────────────────
-- Project boost scoring columns, investor_profiles table, and updated_at triggers
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Boost columns on projects ─────────────────────────────────────────────────
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS project_logo_url        text,
  ADD COLUMN IF NOT EXISTS investor_type_sought    text[],
  ADD COLUMN IF NOT EXISTS funding_duration_range  text,
  ADD COLUMN IF NOT EXISTS equity_stake_offered    numeric,
  ADD COLUMN IF NOT EXISTS pre_money_valuation     numeric,
  ADD COLUMN IF NOT EXISTS exit_horizon            text,
  -- Founder / team
  ADD COLUMN IF NOT EXISTS founder_linkedin         text,
  ADD COLUMN IF NOT EXISTS founder_experience_years integer,
  ADD COLUMN IF NOT EXISTS founder_fulltime         boolean,
  ADD COLUMN IF NOT EXISTS team_key_members         integer,
  ADD COLUMN IF NOT EXISTS founder_bio              text,
  -- Market
  ADD COLUMN IF NOT EXISTS market_size              text,
  ADD COLUMN IF NOT EXISTS competition_level        text,
  ADD COLUMN IF NOT EXISTS competitive_advantage    text,
  -- Financial projections
  ADD COLUMN IF NOT EXISTS revenue_y1               numeric,
  ADD COLUMN IF NOT EXISTS revenue_y2               numeric,
  ADD COLUMN IF NOT EXISTS revenue_y3               numeric,
  ADD COLUMN IF NOT EXISTS ebitda_margin            numeric,
  ADD COLUMN IF NOT EXISTS growth_rate_12m          numeric,
  ADD COLUMN IF NOT EXISTS monthly_burn_rate        numeric,
  -- ESG
  ADD COLUMN IF NOT EXISTS esg_women_leadership     boolean,
  ADD COLUMN IF NOT EXISTS esg_women_percentage     integer,
  ADD COLUMN IF NOT EXISTS esg_board_exists         boolean,
  ADD COLUMN IF NOT EXISTS esg_audited              text,
  ADD COLUMN IF NOT EXISTS esg_environmental        boolean,
  ADD COLUMN IF NOT EXISTS esg_sdgs                 text[],
  -- Documents checklist
  ADD COLUMN IF NOT EXISTS documents_available      text[],
  -- Score (admin-only write, see C4 trigger)
  ADD COLUMN IF NOT EXISTS boost_score              integer DEFAULT 0;

-- ── investor_profiles ─────────────────────────────────────────────────────────
CREATE TABLE public.investor_profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES auth.users ON DELETE SET NULL,
  full_name           text NOT NULL,
  title               text,
  organization        text,
  email               text,
  phone               text,
  linkedin_url        text,
  country             text,
  city                text,
  avatar_url          text,
  role_type           text NOT NULL,
  role_other          text,
  priority_sectors    text[],
  ticket_min          numeric,
  ticket_max          numeric,
  duration_prefs      text[],
  geographic_zones    text[],
  mandate_conditions  text,
  client_types        text[],
  target_return       text,
  alternative_assets  text[],
  deal_flow_appetite  text,
  objectives          text[],
  open_to_deal_flow   boolean DEFAULT true,
  deal_flow_conditions text,
  bio                 text,
  photo_consent       text DEFAULT 'yes',
  is_active           boolean DEFAULT true,
  verified            boolean DEFAULT false,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY investor_profiles_own ON public.investor_profiles
  FOR ALL USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ── updated_at trigger for investor_profiles ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_investor_profiles_updated_at()
RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER investor_profiles_updated_at
  BEFORE UPDATE ON public.investor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_investor_profiles_updated_at();
