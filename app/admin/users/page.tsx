import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/types";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase.from("profiles").select("*").order("created_at",{ascending:false}) as {data:Profile[]|null};

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-black text-white mb-6">Utilisateurs</h1>
      <div className="glass-card rounded-xl border border-white/8 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {["Utilisateur","Organisation","Pays","Rôle","Inscrit le"].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(profiles||[]).map(p=>(
              <tr key={p.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-gold/15 rounded-full flex items-center justify-center text-brand-gold text-sm font-bold">
                      {p.full_name?.[0]?.toUpperCase()||"?"}
                    </div>
                    <div>
                      <div className="text-white text-sm">{p.full_name||"—"}</div>
                      <div className="text-gray-500 text-xs">{p.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm">{p.organization||"—"}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">{p.country||"—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.role==="admin" ? "text-brand-gold bg-brand-gold/10" : "text-blue-400 bg-blue-400/10"}`}>
                    {p.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!profiles||profiles.length===0) && (
          <div className="text-center py-12 text-gray-500">Aucun utilisateur</div>
        )}
      </div>
    </div>
  );
}
