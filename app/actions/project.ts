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
export async function expressInterest(
  projectId: string,
  message: string | null,
): Promise<{ ok: true } | { ok: false; error: string; code?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié." };

  const { error } = await supabase.from("deal_interests").insert({
    investor_user_id: user.id,
    project_id:       projectId,
    message:          message?.trim() ? message.trim() : null,
  });

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Vous avez déjà exprimé votre intérêt pour ce projet.", code: "DUPLICATE" };
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/deal-flow/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);

  // Trigger-created notifications (project owner, investor, admins) now fire
  // their emails.
  await dispatchPendingEmails().catch(() => { /* swallow */ });

  return { ok: true };
}
