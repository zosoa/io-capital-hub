import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  if (!user.email_confirmed_at) redirect("/auth/verify-email");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-brand-navy flex">
      <aside className="hidden md:flex flex-col w-56 bg-brand-navyMid border-r border-white/5 flex-shrink-0">
        <div className="p-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center font-black text-brand-navy text-xs">⚙</div>
            <div>
              <div className="font-bold text-white text-sm">Admin Panel</div>
              <div className="text-gray-600 text-xs">CEO Summit IO — Investment Hub</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { href:"/admin",                      icon:"📊", label:"Vue d'ensemble" },
            { href:"/admin/projects",             icon:"📁", label:"Tous les projets" },
            { href:"/admin/investor-profiles",    icon:"🤝", label:"Investisseurs" },
            { href:"/admin/users",                icon:"👥", label:"Utilisateurs" },
            { href:"/dashboard",                  icon:"↩", label:"Mon espace" },
          ].map(item=>(
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200">
              <span className="w-5 text-center">{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  );
}
