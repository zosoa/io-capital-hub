import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatCurrency, formatDate, STATUS_CONFIG, SECTOR_LABELS, FUNDING_TYPE_LABELS } from "@/lib/utils";
import type { Project } from "@/types";

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("projects").select("*, profiles(full_name,email,organization)").order("created_at",{ascending:false});
  if (resolvedParams.status && resolvedParams.status !== "all") query = query.eq("status", resolvedParams.status);

  const { data: projects } = await query as { data: (Project & {profiles:any})[] | null };
  const all = projects || [];
  const filtered = resolvedParams.q
    ? all.filter(p => p.title.toLowerCase().includes(resolvedParams.q!.toLowerCase()) || (p.profiles?.full_name||"").toLowerCase().includes(resolvedParams.q!.toLowerCase()))
    : all;

  const statusTabs = [
    { v:"all",          l:"Tous",         count: all.length },
    { v:"submitted",    l:"Soumis",       count: all.filter(p=>p.status==="submitted").length },
    { v:"under_review", l:"En revue",     count: all.filter(p=>p.status==="under_review").length },
    { v:"approved",     l:"Approuvés",    count: all.filter(p=>p.status==="approved").length },
    { v:"rejected",     l:"Refusés",      count: all.filter(p=>p.status==="rejected").length },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-black text-white mb-6">Tous les projets</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {statusTabs.map(t=>(
            <Link key={t.v} href={`/admin/projects${t.v !== "all" ? `?status=${t.v}` : ""}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                (resolvedParams.status||"all")===t.v ? "bg-brand-gold text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}>
              {t.l}
              {t.count > 0 && <span className="bg-white/20 rounded-full px-1.5 text-xs">{t.count}</span>}
            </Link>
          ))}
        </div>
        {/* Search (no-JS GET form; preserves status filter) */}
        <form method="GET" className="sm:ml-auto flex items-center gap-2">
          {resolvedParams.status && <input type="hidden" name="status" value={resolvedParams.status}/>}
          <input
            type="text" name="q" defaultValue={resolvedParams.q || ""}
            placeholder="Rechercher projet ou porteur…"
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-brand-gold/40 w-full sm:w-64"/>
          <button type="submit" className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
            </svg>
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left">
                {["Projet","Porteur","Secteur","Montant","Boost","Statut","Date","Action"].map(h=>(
                  <th key={h} className="px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(p=>{
                const cfg = STATUS_CONFIG[p.status] || {label:p.status, color:"text-gray-400", bg:"bg-gray-400/10"};
                return (
                  <tr key={p.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-white text-sm font-medium max-w-[180px] truncate">{p.title}</div>
                      {p.tagline && <div className="text-gray-500 text-xs truncate max-w-[180px]">{p.tagline}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-300 text-sm truncate max-w-[120px]">{p.profiles?.full_name||"—"}</div>
                      <div className="text-gray-500 text-xs truncate max-w-[120px]">{p.profiles?.organization}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{SECTOR_LABELS[p.sector||""]||p.sector||"—"}</td>
                    <td className="px-4 py-3 text-brand-gold text-sm font-medium whitespace-nowrap">
                      {formatCurrency(p.amount_requested, p.currency)}
                    </td>
                    <td className="px-4 py-3">
                      {p.boost_score > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-gold rounded-full" style={{ width: `${p.boost_score}%` }}/>
                          </div>
                          <span className="text-xs text-brand-gold font-semibold">{p.boost_score}</span>
                        </div>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.color} ${cfg.bg}`}>{cfg.label}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/projects/${p.id}`} className="text-brand-gold hover:text-[#C8992A] text-sm transition-colors">
                        Voir →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (() => {
            // U-2: differentiate the three "empty" shapes so the copy matches
            // the actual situation instead of the generic catch-all.
            if (all.length === 0) {
              return (
                <div className="text-center py-12">
                  <div className="text-gray-400 font-medium mb-1">Aucun dossier soumis pour le moment</div>
                  <div className="text-gray-600 text-sm">Les nouveaux projets apparaîtront ici dès qu&apos;un porteur aura terminé le formulaire.</div>
                </div>
              );
            }
            if (resolvedParams.q && resolvedParams.q.trim()) {
              return (
                <div className="text-center py-12">
                  <div className="text-gray-400 font-medium mb-1">Aucun projet ne correspond à la recherche</div>
                  <div className="text-gray-600 text-sm">
                    Aucun dossier ne contient « {resolvedParams.q} ».{" "}
                    <Link href="/admin/projects" className="text-brand-gold hover:underline">Effacer la recherche</Link>
                  </div>
                </div>
              );
            }
            // Status filter is active + has no matches
            const activeTab = statusTabs.find(t => t.v === (resolvedParams.status || "all"));
            return (
              <div className="text-center py-12">
                <div className="text-gray-400 font-medium mb-1">Aucun projet dans « {activeTab?.l || "cette catégorie"} »</div>
                <div className="text-gray-600 text-sm">
                  Essayez un autre onglet, ou{" "}
                  <Link href="/admin/projects" className="text-brand-gold hover:underline">voir tous les dossiers</Link>.
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
