"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dispatchPendingEmails } from "@/lib/notifications/server";

// ─── Input schemas (audit S-2) ────────────────────────────────
// Server actions get invoked from the client and are therefore adversarial
// surface. Every typed param below is still validated at runtime to block
// tampered inputs before they hit the DB.
const UuidSchema = z.string().uuid("Identifiant invalide.");

const ProjectStatusSchema = z.enum([
  "draft", "submitted", "under_review",
  "approved", "rejected", "closed", "funded", "withdrawn",
]);

const UpdateProjectStatusInput = z.object({
  projectId:           UuidSchema,
  newStatus:           ProjectStatusSchema,
  adminNotesPublic:    z.string().max(4000).default(""),
  rejectionReason:     z.string().max(2000).nullable().default(null),
  adminNotesInternal:  z.string().max(8000).optional(),
});

const SaveAdminNotesInput = z.object({
  projectId:     UuidSchema,
  notesPublic:   z.string().max(4000),
  notesInternal: z.string().max(8000).optional(),
});

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
  adminNotesPublic: string,
  rejectionReason:  string | null,
  adminNotesInternal?: string,
) {
  const v = UpdateProjectStatusInput.parse({
    projectId, newStatus, adminNotesPublic, rejectionReason, adminNotesInternal,
  });
  const { supabase, adminId } = await requireAdmin();

  const { error } = await supabase
    .from("projects")
    .update({
      status:               v.newStatus,
      // Legacy column kept for backward compat — mirrors public notes.
      admin_notes:          v.adminNotesPublic || null,
      admin_notes_public:   v.adminNotesPublic || null,
      admin_notes_internal: v.adminNotesInternal || null,
      rejection_reason:     v.newStatus === "rejected" ? (v.rejectionReason || null) : null,
      reviewed_at:          new Date().toISOString(),
    })
    .eq("id", v.projectId);

  if (error) throw new Error(error.message);

  await supabase.from("activity_log").insert({
    actor_id:    adminId,
    target_type: "project",
    target_id:   v.projectId,
    action:      `status_changed_to_${v.newStatus}`,
    metadata:    {
      admin_notes_public: v.adminNotesPublic,
      rejection_reason:   v.rejectionReason,
    },
  });

  revalidatePath(`/admin/projects/${v.projectId}`);
  revalidatePath(`/dashboard/projects/${v.projectId}`);
  revalidatePath(`/dashboard`);

  await dispatchPendingEmails().catch(() => { /* logged elsewhere */ });
}

// ─── Save admin notes (public + internal) ────────────────────
export async function saveAdminNotes(
  projectId:     string,
  notesPublic:   string,
  notesInternal?: string,
) {
  const v = SaveAdminNotesInput.parse({ projectId, notesPublic, notesInternal });
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("projects")
    .update({
      admin_notes:          v.notesPublic || null,   // legacy compat
      admin_notes_public:   v.notesPublic || null,
      admin_notes_internal: v.notesInternal || null,
    })
    .eq("id", v.projectId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/projects/${v.projectId}`);
  revalidatePath(`/dashboard/projects/${v.projectId}`);

  await dispatchPendingEmails().catch(() => { /* swallow */ });
}
