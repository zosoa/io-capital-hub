import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate, SECTOR_LABELS } from "@/lib/utils";
import type { Project } from "@/types";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase.from("projects").select("*, profiles(full_name,email,organization)").order("created_at",{ascending:false}) as { data: (Project & {profiles:any})[] | null };
  const { data: profiles } = await supabase.from("profiles").select("id,role");
  const { data: investorProfiles } = await supabase.from("investor_profiles").select("id,is_active,open_to_deal_flow");

  const all = projects || [];
  const stats = {
    total:        all.length,
    submitted:    all.filter(p=>p.status==="submitted").length,
    under_review: all.filter(p=>p.status==="under_review").length,
    approved:     all.filter(p=>p.status==="approved").length,
    rejected:     all.filter(p=>p.status==="rejected").length,
    funded:       all.filter(p=>p.status==="funded").length,
    users:        profiles?.length || 0,
  };

  const pendingProjects = all.filter(p=>["submitted","under_review"].includes(p.status));

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Administration</h1>
        <p className="text-gray-400 text-sm mt-1">CEO Summit IO — Investment Hub — Tableau de bord opérationnel</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {([
          { label:"Total projets",    value:stats.total,               color:"text-white",        icon:<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/> },
          { label:"En attente",       value:stats.submitted,           color:"text-blue-400",     icon:<path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/> },
          { label:"En revue",         value:stats.under_review,        color:"text-yellow-400",   icon:<path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/> },
          { label:"Approuvés",        value:stats.approved,            color:"text-green-400",    icon:<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/> },
          { label:"Refusés",          value:stats.rejected,            color:"text-red-400",      icon:<path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/> },
          { label:"Financés",         value:stats.funded,              color:"text-[#B8913A]",    icon:<path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/> },
          { label:"Utilisateurs",     value:stats.users,               color:"text-purple-400",   icon:<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/> },
          { label:"Investisseurs",    value:investorProfiles?.length||0,color:"text-[#B8913A]",   icon:<path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/> },
          { label:"Taux approbation", value:stats.total>0?`${Math.round((stats.approved/stats.total)*100)}%`:"—", color:"text-teal-400", icon:<path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/> },
        ] as const).map(s=>(
          <div key={s.label} className="glass-card rounded-xl p-4 border border-white/8">
            <div className="flex items-center justify-between mb-2">
              <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                {s.icon}
              </svg>
              <span className={`text-xl font-black ${s.color}`}>{s.value}</span>
            </div>
            <div className="text-gray-400 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Action required */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            🔔 Action requise
            {pendingProjects.length > 0 && <span className="bg-brand-red text-white text-xs rounded-full px-2 py-0.5">{pendingProjects.length}</span>}
          </h2>
          <Link href="/admin/projects" className="text-brand-red hover:text-red-400 text-sm">Voir tout →</Link>
        </div>

        {pendingProjects.length === 0 ? (
          <div className="glass-card rounded-xl p-6 text-center text-gray-400 text-sm border border-white/8">
            ✅ Aucun projet en attente de traitement
          </div>
        ) : (
          <div className="space-y-3">
            {pendingProjects.slice(0,5).map(p=>(
              <Link key={p.id} href={`/admin/projects/${p.id}`}
                className="glass-card rounded-xl p-4 border border-yellow-500/15 hover:border-yellow-500/30 transition-all flex items-center gap-4 group">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center text-yellow-400 font-bold text-sm flex-shrink-0">
                  {p.status === "submitted" ? "!" : "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium group-hover:text-yellow-300 transition-colors truncate">{p.title}</div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    {p.profiles?.full_name} · {p.profiles?.organization} · {SECTOR_LABELS[p.sector || ""] || p.sector} · {formatDate(p.created_at)}
                  </div>
                </div>
                <div className="text-gray-400 text-sm flex-shrink-0">Examiner →</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
