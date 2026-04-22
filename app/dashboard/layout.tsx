import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Email confirmation gate — previously handled by the edge middleware, moved
  // here after the middleware was removed. Server component, runs on every
  // dashboard route, zero runtime cost.
  if (!user.email_confirmed_at) redirect("/auth/verify-email");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const isInvestor = profile?.role === "investor";

  return (
    <div className="min-h-screen flex" style={{ background: isInvestor ? "#07090F" : "#EEEAE3" }}>
      <DashboardSidebar profile={profile} isInvestor={isInvestor} />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
