"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

// ── Delete account ────────────────────────────────────────────────────────────
// GDPR right-to-erasure. Two-phase (audit D-5):
//   Phase 1 — anonymize_own_profile() RPC scrubs all PII on profiles +
//             investor_profiles and stamps deleted_at. Always runs.
//   Phase 2 — if SUPABASE_SERVICE_ROLE_KEY is configured, admin-delete the
//             auth.users row (cascades to everything referencing the user id).
//             When the key is missing, the anonymized profile remains but
//             the dashboard layout redirects the user to a terminal screen
//             on any future login attempt.
export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  // Phase 1 — anonymize. This runs regardless of admin-key availability.
  const { error: anonErr } = await supabase.rpc("anonymize_own_profile");
  if (anonErr) return { error: anonErr.message };

  // Phase 2 — full admin delete when we have the service role.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    try {
      const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey,
        { auth: { persistSession: false } },
      );
      const { error } = await admin.auth.admin.deleteUser(user.id);
      if (error) return { error: error.message };
    } catch (e) {
      // Anonymization already happened, so fall through to sign-out.
      // Log would go here.
      void e;
    }
  }

  await supabase.auth.signOut();
  redirect("/auth/login?deleted=1");
}

// ── Export user data ──────────────────────────────────────────────────────────
export async function exportAccountData(): Promise<{
  profile?: Record<string, unknown>;
  projects?: Record<string, unknown>[];
  investorProfile?: Record<string, unknown> | null;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const [profileRes, projectsRes, investorRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("projects").select("*").eq("user_id", user.id),
    supabase.from("investor_profiles").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  return {
    profile: profileRes.data as Record<string, unknown> | undefined,
    projects: projectsRes.data as Record<string, unknown>[] | undefined,
    investorProfile: investorRes.data as Record<string, unknown> | null | undefined,
  };
}
