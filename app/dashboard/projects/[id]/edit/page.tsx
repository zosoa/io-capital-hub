import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { Project } from "@/types";
import EditProjectForm from "./EditProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/dashboard/projects");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single() as { data: Project | null };

  if (!project) notFound();

  // Approved / funded projects are locked — redirect back to detail
  if (project.status === "approved" || project.status === "funded") {
    redirect(`/dashboard/projects/${id}`);
  }

  return <EditProjectForm project={project} />;
}
