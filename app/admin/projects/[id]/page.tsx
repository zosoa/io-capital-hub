import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate, STATUS_CONFIG, SECTOR_LABELS, FUNDING_TYPE_LABELS } from "@/lib/utils";
import type { Project } from "@/types";
import AdminProjectActions from "./AdminProjectActions";

export default async function AdminProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects").select("*, profiles(full_name,email,organization,phone,job_title,country)").eq("id", id).single() as { data: (Project & {profiles:any}) | null };

  if (!project) notFound();

  const cfg = STATUS_CONFIG[project.status] || { label: project.status, color: "text-gray-400", bg: "bg-gray-400/10" };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/projects" className="text-gray-400 hover:text-white text-sm transition-colors">← Tous les projets</Link>
        <span className="text-gray-600">/</span>
        <span className="text-gray-300 text-sm truncate">{project.title}</span>
      </div>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black text-white">{project.title}</h1>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${cfg.color} ${cfg.bg}`}>{cfg.label}</span>
          </div>
          {project.tagline && <p className="text-gray-400 mt-1">{project.tagline}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {/* Description */}
          {project.description && (
            <div className="glass-card rounded-xl p-5 border border-white/8">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Description du projet</h2>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{project.description}</p>
            </div>
          )}

          {/* Project info */}
          <div className="glass-card rounded-xl p-5 border border-white/8">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Informations projet</h2>
            <div className="grid grid-cols-2 gap-x-6">
              {[
                ["Secteur", SECTOR_LABELS[project.sector||""]||project.sector||"—"],
                ["Stade", project.stage||"—"],
                ["Localisation", project.city ? `${project.city}, ${project.country}` : project.country],
                ["Structure juridique", project.legal_structure||"—"],
                ["Années existence", project.years_in_operation ? `${project.years_in_operation} an(s)` : "0"],
                ["Équipe", project.team_size ? `${project.team_size} pers.` : "—"],
              ].map(([k,v])=>(
                <div key={k} className="py-2 border-b border-white/5">
                  <div className="text-gray-500 text-xs">{k}</div>
                  <div className="text-white text-sm font-medium">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Funding */}
          <div className="glass-card rounded-xl p-5 border border-white/8">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Financement</h2>
            <div className="grid grid-cols-2 gap-x-6">
              {[
                ["Type", FUNDING_TYPE_LABELS[project.funding_type||""]||project.funding_type||"—"],
                ["Montant", formatCurrency(project.amount_requested, project.currency)],
                ["Durée", project.funding_term_months ? `${project.funding_term_months} mois` : "—"],
                ["Revenus existants", project.has_existing_revenue ? "Oui" : "Non"],
              ].map(([k,v])=>(
                <div key={k} className="py-2 border-b border-white/5">
                  <div className="text-gray-500 text-xs">{k}</div>
                  <div className="text-white text-sm font-medium">{v}</div>
                </div>
              ))}
            </div>
            {project.use_of_funds && (
              <div className="mt-3">
                <div className="text-gray-500 text-xs mb-1">Utilisation des fonds</div>
                <p className="text-gray-300 text-sm">{project.use_of_funds}</p>
              </div>
            )}
          </div>

          {/* Collateral */}
          {project.has_collateral && (
            <div className="glass-card rounded-xl p-5 border border-white/8">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Garanties</h2>
              <div className="grid grid-cols-2 gap-x-6">
                {[
                  ["Type", project.collateral_type||"—"],
                  ["Valeur estimée", formatCurrency(project.collateral_value, project.currency)],
                ].map(([k,v])=>(
                  <div key={k} className="py-2 border-b border-white/5">
                    <div className="text-gray-500 text-xs">{k}</div>
                    <div className="text-white text-sm font-medium">{v}</div>
                  </div>
                ))}
              </div>
              {project.collateral_description && (
                <p className="text-gray-300 text-sm mt-3">{project.collateral_description}</p>
              )}
            </div>
          )}

          {/* Boost / Extra data */}
          {(project.boost_score > 0 || project.founder_bio || project.market_size || project.investor_type_sought?.length) && (
            <div className="glass-card rounded-xl p-5 border border-brand-gold/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Données Boost</h2>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-gold rounded-full" style={{ width: `${project.boost_score}%` }}/>
                  </div>
                  <span className="text-brand-gold text-xs font-bold">{project.boost_score}/100</span>
                </div>
              </div>
              <div className="space-y-2.5">
                {project.founder_bio && (
                  <div>
                    <div className="text-gray-500 text-xs mb-1">Bio fondateur</div>
                    <p className="text-gray-300 text-sm leading-relaxed">{project.founder_bio}</p>
                  </div>
                )}
                {project.founder_linkedin && (
                  <div className="flex justify-between py-1.5 border-t border-white/5">
                    <span className="text-gray-500 text-xs">LinkedIn</span>
                    <a href={project.founder_linkedin} target="_blank" rel="noreferrer" className="text-brand-gold text-xs hover:underline truncate max-w-[200px]">
                      {project.founder_linkedin}
                    </a>
                  </div>
                )}
                {project.investor_type_sought?.length ? (
                  <div className="border-t border-white/5 pt-2.5">
                    <div className="text-gray-500 text-xs mb-1.5">Type investisseur recherché</div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.investor_type_sought.map((t: string) => (
                        <span key={t} className="text-[10px] bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {project.market_size && (
                  <div className="flex justify-between py-1.5 border-t border-white/5">
                    <span className="text-gray-500 text-xs">Taille marché</span>
                    <span className="text-gray-300 text-xs">{project.market_size}</span>
                  </div>
                )}
                {project.competitive_advantage && (
                  <div className="border-t border-white/5 pt-2.5">
                    <div className="text-gray-500 text-xs mb-1">Avantage concurrentiel</div>
                    <p className="text-gray-300 text-sm leading-relaxed">{project.competitive_advantage}</p>
                  </div>
                )}
                {(project.revenue_y1 || project.ebitda_margin !== null) && (
                  <div className="border-t border-white/5 pt-2.5">
                    <div className="text-gray-500 text-xs mb-2">Projections financières</div>
                    <div className="grid grid-cols-3 gap-2">
                      {project.revenue_y1 ? <div className="bg-white/4 rounded-lg p-2 text-center"><div className="text-brand-gold font-bold text-xs">{formatCurrency(project.revenue_y1, project.currency)}</div><div className="text-gray-600 text-[9px] mt-0.5">An 1</div></div> : null}
                      {project.revenue_y2 ? <div className="bg-white/4 rounded-lg p-2 text-center"><div className="text-brand-gold font-bold text-xs">{formatCurrency(project.revenue_y2, project.currency)}</div><div className="text-gray-600 text-[9px] mt-0.5">An 2</div></div> : null}
                      {project.revenue_y3 ? <div className="bg-white/4 rounded-lg p-2 text-center"><div className="text-brand-gold font-bold text-xs">{formatCurrency(project.revenue_y3, project.currency)}</div><div className="text-gray-600 text-[9px] mt-0.5">An 3</div></div> : null}
                    </div>
                  </div>
                )}
                {project.esg_sdgs?.length ? (
                  <div className="border-t border-white/5 pt-2.5">
                    <div className="text-gray-500 text-xs mb-1.5">ODD ciblés</div>
                    <div className="flex flex-wrap gap-1">
                      {project.esg_sdgs.map((s: string) => (
                        <span key={s} className="text-[10px] bg-white/8 text-gray-300 px-2 py-0.5 rounded">ODD {s}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Porteur info */}
          <div className="glass-card rounded-xl p-5 border border-white/8">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Porteur du projet</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-red/20 rounded-full flex items-center justify-center text-brand-red font-bold">
                {project.profiles?.full_name?.[0]?.toUpperCase()||"?"}
              </div>
              <div>
                <div className="text-white font-medium text-sm">{project.profiles?.full_name||"—"}</div>
                <div className="text-gray-500 text-xs">{project.profiles?.job_title||""}</div>
              </div>
            </div>
            {[
              ["Organisation", project.profiles?.organization],
              ["Email", project.profiles?.email],
              ["Téléphone", project.profiles?.phone],
              ["Pays", project.profiles?.country],
            ].filter(([,v])=>v).map(([k,v])=>(
              <div key={k} className="py-1.5 border-b border-white/5 last:border-0">
                <div className="text-gray-500 text-xs">{k}</div>
                <div className="text-gray-300 text-sm">{v}</div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="glass-card rounded-xl p-5 border border-white/8">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Timeline</h2>
            {[
              { label:"Créé le", date:project.created_at },
              { label:"Soumis le", date:project.submitted_at },
              { label:"Examiné le", date:project.reviewed_at },
            ].filter(i=>i.date).map(i=>(
              <div key={i.label} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                <span className="text-gray-500 text-xs">{i.label}</span>
                <span className="text-gray-300 text-xs">{formatDate(i.date)}</span>
              </div>
            ))}
          </div>

          {/* Action panel — client component */}
          <AdminProjectActions project={project as Project} />
        </div>
      </div>
    </div>
  );
}
