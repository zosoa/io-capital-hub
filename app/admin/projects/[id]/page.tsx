import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate, STATUS_CONFIG, SECTOR_LABELS, FUNDING_TYPE_LABELS } from "@/lib/utils";
import type { Project, InvestorProfile } from "@/types";
import { buildFxMap, scoreMatch } from "@/lib/match";
import AdminProjectActions from "./AdminProjectActions";

const ROLE_TYPE_SHORT: Record<string, string> = {
  bank: "Banque", pe_vc_fund: "PE / VC", dfi: "DFI",
  wealth_family: "Family office", advisor: "Conseil", legal: "Juridique", other: "Autre",
};

export default async function AdminProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects").select("*, profiles(full_name,email,organization,phone,job_title,country)").eq("id", id).single() as { data: (Project & {profiles:any}) | null };

  if (!project) notFound();

  // ── Engagement + matching data (admin visibility, audit gap) ──
  const [viewsRes, savesRes, interestsRes, investorsRes, fxRes] = await Promise.all([
    supabase.from("project_views").select("id", { count: "exact", head: true }).eq("project_id", id),
    supabase.from("deal_saves").select("id", { count: "exact", head: true }).eq("project_id", id),
    supabase.from("deal_interests").select("id, status, investor_user_id").eq("project_id", id),
    supabase.from("investor_profiles").select("*").eq("is_active", true),
    supabase.from("fx_rates").select("currency, rate_to_usd"),
  ]);

  const viewsCount     = viewsRes.count ?? 0;
  const savesCount     = savesRes.count ?? 0;
  const interests      = (interestsRes.data ?? []) as { id: string; status: string; investor_user_id: string }[];
  const interestedIds  = new Set(interests.map(i => i.investor_user_id));
  const investors      = (investorsRes.data ?? []) as InvestorProfile[];
  const fxMap          = buildFxMap(fxRes.data);

  // Score every active investor against this project; surface the top matches.
  const ranked = investors
    .map(inv => ({ inv, m: scoreMatch(project, inv, fxMap), alreadyInterested: interestedIds.has(inv.user_id || "") }))
    .filter(r => r.m.score > 0)
    .sort((a, b) => b.m.score - a.m.score)
    .slice(0, 6);

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

      {/* Engagement strip — admin visibility into investor activity */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Vues investisseurs", value: viewsCount },
          { label: "Sauvegardes",        value: savesCount },
          { label: "Intérêts exprimés",  value: interests.length, gold: interests.length > 0 },
        ].map(s => (
          <div key={s.label} className={`glass-card rounded-xl p-4 border ${s.gold ? "border-brand-gold/30 bg-brand-gold/5" : "border-white/8"}`}>
            <div className={`text-2xl font-black ${s.gold ? "text-brand-gold" : "text-white"}`}>{s.value}</div>
            <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Interests inline banner → deep link to the Intros queue */}
      {interests.length > 0 && (
        <Link href="/admin/intros?status=pending"
          className="flex items-center gap-3 mb-6 glass-card rounded-xl p-4 border border-brand-gold/25 bg-brand-gold/5 hover:border-brand-gold/45 transition-all group">
          <svg className="w-5 h-5 text-brand-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
          </svg>
          <div className="flex-1">
            <div className="text-white text-sm font-medium">
              {interests.length} investisseur{interests.length > 1 ? "s ont" : " a"} exprimé son intérêt
            </div>
            <div className="text-gray-400 text-xs">Gérer les introductions →</div>
          </div>
          <svg className="w-4 h-4 text-gray-500 group-hover:text-brand-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
          </svg>
        </Link>
      )}

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

          {/* Match suggestions — top investors for this project */}
          <div className="glass-card rounded-xl p-5 border border-brand-gold/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-brand-gold uppercase tracking-widest">Investisseurs suggérés</h2>
              <span className="text-gray-500 text-[10px]">{investors.length} actif{investors.length > 1 ? "s" : ""}</span>
            </div>

            {ranked.length === 0 ? (
              <p className="text-gray-500 text-sm">
                {investors.length === 0
                  ? "Aucun profil investisseur actif dans le réseau pour le moment."
                  : "Aucun investisseur ne correspond aux critères de ce dossier (secteur, ticket, zone, durée)."}
              </p>
            ) : (
              <div className="space-y-2.5">
                {ranked.map(({ inv, m, alreadyInterested }) => (
                  <div key={inv.id} className="bg-white/4 border border-white/8 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white text-sm font-medium truncate">{inv.full_name}</span>
                          <span className="text-[10px] bg-white/8 text-gray-400 px-1.5 py-0.5 rounded">{ROLE_TYPE_SHORT[inv.role_type] || inv.role_type}</span>
                          {alreadyInterested && (
                            <span className="text-[10px] bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded">Déjà intéressé</span>
                          )}
                        </div>
                        {inv.organization && <div className="text-gray-500 text-xs truncate">{inv.organization}</div>}
                        {/* Match reasons */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {m.sector   && <span className="text-[9px] bg-brand-gold/10 text-brand-gold px-1.5 py-0.5 rounded">Secteur</span>}
                          {m.ticket   && <span className="text-[9px] bg-brand-gold/10 text-brand-gold px-1.5 py-0.5 rounded">Ticket</span>}
                          {m.geo      && <span className="text-[9px] bg-brand-gold/10 text-brand-gold px-1.5 py-0.5 rounded">Zone</span>}
                          {m.duration && <span className="text-[9px] bg-brand-gold/10 text-brand-gold px-1.5 py-0.5 rounded">Durée</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <svg key={i} className={`w-3 h-3 ${i < m.score ? "text-brand-gold" : "text-white/10"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                    {inv.email && (
                      <a href={`mailto:${inv.email}?subject=${encodeURIComponent(`Opportunité : ${project.title}`)}`}
                        className="mt-2.5 inline-flex items-center gap-1.5 text-brand-gold text-xs hover:underline">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                        </svg>
                        Contacter pour ce dossier
                      </a>
                    )}
                  </div>
                ))}
                <p className="text-gray-600 text-[10px] leading-relaxed pt-1">
                  Suggestions basées sur secteur, ticket (normalisé USD), zone géographique et durée. Le matching ne remplace pas votre jugement.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Porteur info */}
          <div className="glass-card rounded-xl p-5 border border-white/8">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Porteur du projet</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold font-bold">
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
