"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Guard: throws if caller is not admin ─────────────────────
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Accès non autorisé.");

  return { supabase, adminId: user.id };
}

// ─── Update project status ────────────────────────────────────
export async function updateProjectStatus(
  projectId:        string,
  newStatus:        string,
  adminNotesPublic: string,   // visible to project owner
  rejectionReason:  string | null,
  adminNotesInternal?: string, // confidential, admin-only
) {
  const { supabase, adminId } = await requireAdmin();

  const { error } = await supabase
    .from("projects")
    .update({
      status:               newStatus,
      // Legacy column kept for backward compat — mirrors public notes
      admin_notes:          adminNotesPublic || null,
      admin_notes_public:   adminNotesPublic || null,
      admin_notes_internal: adminNotesInternal || null,
      rejection_reason:     newStatus === "rejected" ? (rejectionReason || null) : null,
      reviewed_at:          new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) throw new Error(error.message);

  // Write audit trail
  await supabase.from("activity_log").insert({
    actor_id:    adminId,
    target_type: "project",
    target_id:   projectId,
    action:      `status_changed_to_${newStatus}`,
    metadata:    {
      admin_notes_public: adminNotesPublic,
      rejection_reason:   rejectionReason,
    },
  });

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard`);
}

// ─── Save admin notes (public + internal) ────────────────────
export async function saveAdminNotes(
  projectId:        string,
  notesPublic:      string,
  notesInternal?:   string,
) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("projects")
    .update({
      admin_notes:          notesPublic || null,   // legacy compat
      admin_notes_public:   notesPublic || null,
      admin_notes_internal: notesInternal || null,
    })
    .eq("id", projectId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/projects/${projectId}`);
}
