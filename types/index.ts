export type UserRole = "client" | "investor" | "admin";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  organization: string | null;
  job_title: string | null;
  country: string | null;
  role: UserRole;
  avatar_url: string | null;
  company_logo_url: string | null;
  linkedin_url: string | null;
  is_authorized_rep: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "closed" | "funded" | "withdrawn";
export type FundingType   = "debt" | "equity" | "mezzanine" | "grant" | "hybrid";
export type ProjectStage  = "idea" | "pre_revenue" | "early_revenue" | "growth" | "expansion" | "bridge";
export type Sector        = "energy" | "agriculture" | "tech" | "real_estate" | "infrastructure" | "manufacturing" | "tourism" | "health" | "education" | "financial_services" | "other";

export interface Project {
  id: string;
  user_id: string;
  title: string;
  slug: string | null;
  tagline: string | null;
  description: string | null;
  sector: Sector | null;
  sub_sector: string | null;
  stage: ProjectStage | null;
  funding_type: FundingType | null;
  amount_requested: number | null;
  currency: string;
  funding_term_months: number | null;
  funding_duration_range: string | null;  // 'short'|'medium'|'long'|'very_long'
  use_of_funds: string | null;
  country: string;
  city: string | null;
  legal_structure: string | null;
  years_in_operation: number;
  team_size: number | null;
  has_existing_revenue: boolean;
  annual_revenue: number | null;
  has_collateral: boolean;
  collateral_type: string | null;
  collateral_description: string | null;
  collateral_value: number | null;
  job_creation_expected: number | null;
  impact_description: string | null;

  // Matching investisseur (wizard step 2)
  investor_type_sought: string[] | null;
  equity_stake_offered: number | null;
  pre_money_valuation: number | null;
  exit_horizon: string | null;

  // Logo projet
  project_logo_url: string | null;

  // Boost — équipe
  founder_linkedin: string | null;
  founder_experience_years: number | null;
  founder_fulltime: boolean | null;
  team_key_members: number | null;
  founder_bio: string | null;

  // Boost — marché
  market_size: string | null;
  competition_level: string | null;
  competitive_advantage: string | null;

  // Boost — finances avancées
  revenue_y1: number | null;
  revenue_y2: number | null;
  revenue_y3: number | null;
  ebitda_margin: number | null;
  growth_rate_12m: number | null;
  monthly_burn_rate: number | null;

  // Boost — ESG
  esg_women_leadership: boolean | null;
  esg_women_percentage: number | null;
  esg_board_exists: boolean | null;
  esg_audited: string | null;
  esg_environmental: boolean | null;
  esg_sdgs: string[] | null;

  // Boost — documents
  documents_available: string[] | null;
  boost_score: number;

  status: ProjectStatus;
  admin_notes: string | null;             // legacy — mirrors admin_notes_public
  admin_notes_public: string | null;      // feedback visible to project owner
  admin_notes_internal: string | null;    // confidential — admin eyes only
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

// ─── Multi-step wizard form ────────────────────────────────────
export interface ProjectFormData {
  title: string;
  tagline: string;
  description: string;
  sector: string;
  sub_sector: string;
  stage: string;
  country: string;
  city: string;
  funding_type: string;
  amount_requested: string;
  currency: string;
  funding_term_months: string;
  funding_duration_range: string;
  use_of_funds: string;
  investor_type_sought: string[];
  equity_stake_offered: string;
  pre_money_valuation: string;
  exit_horizon: string;
  legal_structure: string;
  years_in_operation: string;
  team_size: string;
  has_existing_revenue: boolean;
  annual_revenue: string;
  has_collateral: boolean;
  collateral_type: string;
  collateral_description: string;
  collateral_value: string;
  job_creation_expected: string;
  impact_description: string;
}

// ─── Notifications ─────────────────────────────────────────────
export type NotificationType =
  | "project.submitted"
  | "project.under_review"
  | "project.approved"
  | "project.rejected"
  | "project.funded"
  | "project.withdrawn"
  | "project.admin_note"
  | "project.interest_received"
  | "interest.submitted"
  | "admin.project_submitted"
  | "admin.interest_expressed";

export interface NotificationRow {
  id: string;
  recipient: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  read_at: string | null;
  email_sent_at: string | null;
  created_at: string;
}

// ─── Investor profile ──────────────────────────────────────────
export interface InvestorProfile {
  id: string;
  user_id: string | null;

  full_name: string;
  title: string | null;
  organization: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  country: string | null;
  city: string | null;
  avatar_url: string | null;

  role_type: string;       // 'bank'|'pe_vc_fund'|'dfi'|'wealth_family'|'advisor'|'legal'|'other'
  role_other: string | null;

  priority_sectors: string[] | null;
  ticket_min: number | null;
  ticket_max: number | null;
  duration_prefs: string[] | null;
  geographic_zones: string[] | null;
  mandate_conditions: string | null;

  client_types: string[] | null;
  target_return: string | null;
  alternative_assets: string[] | null;
  deal_flow_appetite: string | null;

  objectives: string[] | null;
  open_to_deal_flow: boolean;
  deal_flow_conditions: string | null;

  bio: string | null;
  photo_consent: string;

  is_active: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
}
