"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { dispatchPendingEmails } from "@/lib/notifications/server";

/** Allow a project owner to withdraw (pull) their own project from consideration. */
export async function withdrawProject(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  // Verify ownership
  const { data: project } = await supabase
    .from("projects")
    .select("user_id, status")
    .eq("id", projectId)
    .single();

  if (!project || project.user_id !== user.id) throw new Error("Accès non autorisé.");

  const withdrawableStatuses = ["draft", "submitted", "under_review", "rejected"];
  if (!withdrawableStatuses.includes(project.status)) {
    throw new Error("Ce dossier ne peut pas être retiré dans son état actuel.");
  }

  const { error } = await supabase
    .from("projects")
    .update({ status: "withdrawn" })
    .eq("id", projectId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/projects");

  await dispatchPendingEmails().catch(() => { /* swallow */ });
}

/**
 * Called from client-side flows (wizard, edit form) right after a status
 * change so the DB-triggered notifications get their emails sent.
 */
export async function flushNotifications(): Promise<void> {
  await dispatchPendingEmails().catch(() => { /* swallow */ });
}

// ─── Express interest as a server action (fires notifications + email) ───
// Validation layering (audit items I-C3 + I-C5):
//   1. RLS does the hard enforcement (role in investor/admin, project status=approved, not self-interest)
//   2. This layer adds friendly error messages + pre-checks to avoid ugly RLS
//      error leakage.
export async function expressInterest(
  projectId: string,
  message: string | null,
): Promise<{ ok: true } | { ok: false; error: string; code?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié.", code: "NO_AUTH" };

  // 1. Verify project exists and is currently approved (public deal flow).
  const { data: project } = await supabase
    .from("projects")
    .select("id, user_id, status")
    .eq("id", projectId)
    .eq("status", "approved")
    .maybeSingle();

  if (!project) {
    return { ok: false, error: "Ce projet n'est plus disponible dans le deal flow.", code: "NOT_AVAILABLE" };
  }

  // 2. No self-interest — would misleadingly notify the owner about themselves.
  if (project.user_id === user.id) {
    return { ok: false, error: "Vous ne pouvez pas exprimer un intérêt pour votre propre projet.", code: "SELF" };
  }

  // 3. Role gate — only investors (and admins) can express interest.
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();

  if (!profile || !["investor", "admin"].includes(profile.role)) {
    return { ok: false, error: "Seuls les investisseurs peuvent exprimer un intérêt. Rejoignez le réseau depuis votre profil.", code: "WRONG_ROLE" };
  }

  // 4. Insert — RLS re-validates all of the above as defence-in-depth.
  const { error } = await supabase.from("deal_interests").insert({
    investor_user_id: user.id,
    project_id:       projectId,
    message:          message?.trim() ? message.trim() : null,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Vous avez déjà exprimé votre intérêt pour ce projet.", code: "DUPLICATE" };
    }
    // Don't leak raw PG error strings to the UI. Log would go here in prod.
    return { ok: false, error: "Une erreur technique est survenue. Merci de réessayer.", code: "UNKNOWN" };
  }

  revalidatePath(`/dashboard/deal-flow/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);

  // Trigger-created notifications (project owner, investor, admins) now fire
  // their emails.
  await dispatchPendingEmails().catch(() => { /* swallow */ });

  return { ok: true };
}
