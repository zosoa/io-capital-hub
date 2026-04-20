"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

// ── Delete account ────────────────────────────────────────────────────────────
// Requires SUPABASE_SERVICE_ROLE_KEY in env to use admin API.
export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    // Fallback: mark account as deletion requested (admin will process manually)
    await supabase
      .from("profiles")
      .update({ role: "deletion_requested" } as Record<string, unknown>)
      .eq("id", user.id);
    await supabase.auth.signOut();
    redirect("/auth/login?deleted=1");
  }

  try {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    );
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) return { error: error.message };
  } catch (e) {
    return { error: (e as Error).message };
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
