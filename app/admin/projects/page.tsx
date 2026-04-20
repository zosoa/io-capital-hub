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

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusTabs.map(t=>(
          <Link key={t.v} href={`/admin/projects${t.v !== "all" ? `?status=${t.v}` : ""}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              (resolvedParams.status||"all")===t.v ? "bg-brand-red text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}>
            {t.l}
            {t.count > 0 && <span className="bg-white/20 rounded-full px-1.5 text-xs">{t.count}</span>}
          </Link>
        ))}
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
                      <Link href={`/admin/projects/${p.id}`} className="text-brand-red hover:text-red-400 text-sm transition-colors">
                        Voir →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">Aucun projet trouvé</div>
          )}
        </div>
      </div>
    </div>
  );
}
