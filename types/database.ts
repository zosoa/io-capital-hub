// ─────────────────────────────────────────────────────────────────────────────
// Database types — hand-written to match the Supabase migrations.
//
// To regenerate from the live project:
//   1. npx supabase login
//   2. npm run gen-types
// ─────────────────────────────────────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          organization: string | null;
          job_title: string | null;
          country: string | null;
          role: string;
          avatar_url: string | null;
          company_logo_url: string | null;
          linkedin_url: string | null;
          is_authorized_rep: boolean;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          organization?: string | null;
          job_title?: string | null;
          country?: string | null;
          role?: string;
          avatar_url?: string | null;
          company_logo_url?: string | null;
          linkedin_url?: string | null;
          is_authorized_rep?: boolean;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          slug: string | null;
          tagline: string | null;
          description: string | null;
          sector: string | null;
          sub_sector: string | null;
          stage: string | null;
          funding_type: string | null;
          amount_requested: number | null;
          currency: string;
          funding_term_months: number | null;
          funding_duration_range: string | null;
          use_of_funds: string | null;
          country: string;
          city: string | null;
          region: string | null;
          legal_structure: string | null;
          years_in_operation: number;
          team_size: number | null;
          has_existing_revenue: boolean;
          annual_revenue: number | null;
          ebitda: number | null;
          total_assets: number | null;
          existing_debt: number | null;
          has_collateral: boolean;
          collateral_type: string | null;
          collateral_description: string | null;
          collateral_value: number | null;
          job_creation_expected: number | null;
          sdg_alignment: string[] | null;
          impact_description: string | null;
          // Investor matching
          investor_type_sought: string[] | null;
          equity_stake_offered: number | null;
          pre_money_valuation: number | null;
          exit_horizon: string | null;
          // Project logo
          project_logo_url: string | null;
          // Boost — team
          founder_linkedin: string | null;
          founder_experience_years: number | null;
          founder_fulltime: boolean | null;
          team_key_members: number | null;
          founder_bio: string | null;
          // Boost — market
          market_size: string | null;
          competition_level: string | null;
          competitive_advantage: string | null;
          // Boost — financials
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
          // Status & admin
          status: string;
          admin_notes: string | null;            // legacy — mirrors admin_notes_public
          admin_notes_public: string | null;     // feedback visible to project owner
          admin_notes_internal: string | null;   // confidential — admin eyes only
          rejection_reason: string | null;
          submitted_at: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          slug?: string | null;
          tagline?: string | null;
          description?: string | null;
          sector?: string | null;
          sub_sector?: string | null;
          stage?: string | null;
          funding_type?: string | null;
          amount_requested?: number | null;
          currency?: string;
          funding_term_months?: number | null;
          funding_duration_range?: string | null;
          use_of_funds?: string | null;
          country?: string;
          city?: string | null;
          region?: string | null;
          legal_structure?: string | null;
          years_in_operation?: number;
          team_size?: number | null;
          has_existing_revenue?: boolean;
          annual_revenue?: number | null;
          ebitda?: number | null;
          total_assets?: number | null;
          existing_debt?: number | null;
          has_collateral?: boolean;
          collateral_type?: string | null;
          collateral_description?: string | null;
          collateral_value?: number | null;
          job_creation_expected?: number | null;
          sdg_alignment?: string[] | null;
          impact_description?: string | null;
          investor_type_sought?: string[] | null;
          equity_stake_offered?: number | null;
          pre_money_valuation?: number | null;
          exit_horizon?: string | null;
          project_logo_url?: string | null;
          founder_linkedin?: string | null;
          founder_experience_years?: number | null;
          founder_fulltime?: boolean | null;
          team_key_members?: number | null;
          founder_bio?: string | null;
          market_size?: string | null;
          competition_level?: string | null;
          competitive_advantage?: string | null;
          revenue_y1?: number | null;
          revenue_y2?: number | null;
          revenue_y3?: number | null;
          ebitda_margin?: number | null;
          growth_rate_12m?: number | null;
          monthly_burn_rate?: number | null;
          esg_women_leadership?: boolean | null;
          esg_women_percentage?: number | null;
          esg_board_exists?: boolean | null;
          esg_audited?: string | null;
          esg_environmental?: boolean | null;
          esg_sdgs?: string[] | null;
          documents_available?: string[] | null;
          boost_score?: number;
          status?: string;
          admin_notes?: string | null;
          admin_notes_public?: string | null;
          admin_notes_internal?: string | null;
          rejection_reason?: string | null;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      project_documents: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          document_type: string | null;
          file_name: string | null;
          file_url: string | null;
          file_size: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          document_type?: string | null;
          file_name?: string | null;
          file_url?: string | null;
          file_size?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_documents"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_documents_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      activity_log: {
        Row: {
          id: string;
          actor_id: string | null;
          target_type: string | null;
          target_id: string | null;
          action: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          target_type?: string | null;
          target_id?: string | null;
          action?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_log"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "activity_log_actor_id_fkey";
            columns: ["actor_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      investor_profiles: {
        Row: {
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
          role_type: string;
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
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          full_name: string;
          title?: string | null;
          organization?: string | null;
          email?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          country?: string | null;
          city?: string | null;
          avatar_url?: string | null;
          role_type: string;
          role_other?: string | null;
          priority_sectors?: string[] | null;
          ticket_min?: number | null;
          ticket_max?: number | null;
          duration_prefs?: string[] | null;
          geographic_zones?: string[] | null;
          mandate_conditions?: string | null;
          client_types?: string[] | null;
          target_return?: string | null;
          alternative_assets?: string[] | null;
          deal_flow_appetite?: string | null;
          objectives?: string[] | null;
          open_to_deal_flow?: boolean;
          deal_flow_conditions?: string | null;
          bio?: string | null;
          photo_consent?: string;
          is_active?: boolean;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["investor_profiles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "investor_profiles_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      deal_interests: {
        Row: {
          id: string;
          investor_user_id: string;
          project_id: string;
          message: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          investor_user_id: string;
          project_id: string;
          message?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["deal_interests"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "deal_interests_investor_user_id_fkey";
            columns: ["investor_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_interests_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
    };

    Views: {
      projects_owner_view: {
        Row: Database["public"]["Tables"]["projects"]["Row"] & {
          admin_notes_internal_visible: string | null;
        };
        Relationships: Database["public"]["Tables"]["projects"]["Relationships"];
      };
    };

    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };

    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// ─── Row type aliases ─────────────────────────────────────────────────────────
export type ProfileRow         = Database["public"]["Tables"]["profiles"]["Row"];
export type ProjectRow         = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectDocumentRow = Database["public"]["Tables"]["project_documents"]["Row"];
export type ActivityLogRow     = Database["public"]["Tables"]["activity_log"]["Row"];
export type InvestorProfileRow = Database["public"]["Tables"]["investor_profiles"]["Row"];
export type DealInterestRow    = Database["public"]["Tables"]["deal_interests"]["Row"];
