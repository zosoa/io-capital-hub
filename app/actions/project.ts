"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
}
