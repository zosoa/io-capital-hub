import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { InvestorProfile } from "@/types";

const ROLE_LABELS: Record<string, string> = {
  bank:          "Banque / Institution financière",
  pe_vc_fund:    "Fonds PE / VC",
  dfi:           "Institution de développement",
  wealth_family: "Family office / Privé",
  advisor:       "Conseiller / Structurateur",
  legal:         "Juriste / Avocat",
  other:         "Autre",
};

export default async function AdminInvestorProfilesPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("investor_profiles")
    .select("*")
    .order("created_at", { ascending: false }) as { data: InvestorProfile[] | null };

  const all = profiles || [];
  const active   = all.filter(p => p.is_active).length;
  const verified = all.filter(p => p.verified).length;
  const openFlow = all.filter(p => p.open_to_deal_flow).length;

  const roleGroups = all.reduce((acc, p) => {
    const role = p.role_type || "other";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Registre des investisseurs</h1>
        <p className="text-gray-400 text-sm mt-1">{all.length} profil{all.length !== 1 ? "s" : ""} enregistré{all.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total profils",       value: all.length,  color: "text-white" },
          { label: "Actifs",              value: active,      color: "text-green-400" },
          { label: "Vérifiés",            value: verified,    color: "text-brand-gold" },
          { label: "Ouverts au deal flow",value: openFlow,    color: "text-blue-400" },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-xl p-4 border border-white/8">
            <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Role breakdown */}
      {all.length > 0 && (
        <div className="glass-card rounded-xl p-5 border border-white/8 mb-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Répartition par profil</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(roleGroups).sort(([,a],[,b]) => b - a).map(([role, count]) => (
              <span key={role} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full text-xs text-gray-300">
                <span className="text-brand-gold font-bold">{count}</span>
                {ROLE_LABELS[role] || role}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {all.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center border border-white/8 text-gray-500">
          Aucun profil investisseur enregistré pour le moment.
        </div>
      ) : (
        <div className="glass-card rounded-xl border border-white/8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Nom / Organisation","Rôle","Secteurs","Ticket","Zones","Deal flow","Vérif.","Inscrit"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {all.map(p => (
                  <tr key={p.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {p.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.avatar_url} className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt=""/>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-brand-gold/15 border border-brand-gold/25 flex items-center justify-center flex-shrink-0 text-brand-gold font-bold text-[10px]">
                            {p.full_name?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                        <div>
                          <div className="text-white text-sm font-medium whitespace-nowrap">{p.full_name}</div>
                          <div className="text-gray-500 text-xs truncate max-w-[160px]">{p.organization || p.title || p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-white/8 text-gray-300 px-2 py-1 rounded-full whitespace-nowrap">
                        {ROLE_LABELS[p.role_type] || p.role_type}
                        {p.role_other ? ` — ${p.role_other}` : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {(p.priority_sectors || []).slice(0, 3).map((s, i) => (
                          <span key={i} className="text-[10px] bg-brand-gold/10 text-brand-gold px-1.5 py-0.5 rounded">{s}</span>
                        ))}
                        {(p.priority_sectors?.length || 0) > 3 && (
                          <span className="text-[10px] text-gray-500">+{(p.priority_sectors?.length || 0) - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {p.ticket_min || p.ticket_max ? (
                        <span>
                          {p.ticket_min ? `${(p.ticket_min / 1000).toFixed(0)}k` : "?"}
                          {" – "}
                          {p.ticket_max ? `${(p.ticket_max / 1000).toFixed(0)}k` : "?"}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[140px]">
                        {(p.geographic_zones || []).slice(0, 2).map((z, i) => (
                          <span key={i} className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded">{z}</span>
                        ))}
                        {(p.geographic_zones?.length || 0) > 2 && (
                          <span className="text-[10px] text-gray-500">+{(p.geographic_zones?.length || 0) - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.open_to_deal_flow ? (
                        <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">Ouvert</span>
                      ) : (
                        <span className="text-xs bg-white/5 text-gray-500 px-2 py-0.5 rounded-full">Non</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.verified ? (
                        <span className="text-xs text-brand-gold">✓ Vérifié</span>
                      ) : (
                        <span className="text-xs text-gray-600">Non vérifié</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
