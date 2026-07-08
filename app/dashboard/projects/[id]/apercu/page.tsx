import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency, SECTOR_LABELS, FUNDING_TYPE_LABELS, STAGE_LABELS } from "@/lib/utils";
import type { Project } from "@/types";

function getDealRef(id: string): string {
  return `CSIH-${id.replace(/-/g, "").substring(0, 6).toUpperCase()}`;
}

function MetricRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between py-2.5 border-b border-[#E8E2D9] last:border-0">
      <span className="text-[#5A6280] text-xs uppercase tracking-wider font-medium">{label}</span>
      <span className="text-[#0F1320] text-sm font-semibold text-right max-w-[55%]">{value}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[#B8913A] text-xs uppercase tracking-[0.15em] font-semibold mb-3">
      {children}
    </div>
  );
}


export default async function AperuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: project } = await supabase
    .from("projects").select("*").eq("id", id).eq("user_id", user!.id).single() as { data: Project | null };

  if (!project) notFound();

  const dealRef = getDealRef(project.id);
  const location = [project.city, project.country].filter(Boolean).join(", ") || project.country;

  return (
    <div className="min-h-screen bg-[#F6F4EF] print:bg-white">
      {/* Top navigation (hidden on print) */}
      <div className="print:hidden bg-white border-b border-[#E8E2D9] px-6 py-3 flex items-center justify-between">
        <Link href={`/dashboard/projects/${project.id}`}
          className="flex items-center gap-2 text-[#5A6280] hover:text-[#0F1320] text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Retour au dossier
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[#5A6280] text-xs">Aperçu investisseur</span>
          <button onClick={() => typeof window !== "undefined" && window.print()}
            className="flex items-center gap-1.5 text-xs font-medium text-[#B8913A] border border-[#B8913A]/30 px-3 py-1.5 rounded-lg hover:bg-[#B8913A]/5 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"/>
            </svg>
            Imprimer / PDF
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 print:py-6">

        {/* Confidentiality banner */}
        <div className="flex items-center justify-between mb-8 print:mb-6">
          <div className="flex items-center gap-2 text-[#5A6280] text-xs">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
            </svg>
            Document confidentiel — CEO Summit Investment Hub
          </div>
          <div className="text-[#5A6280] text-xs font-mono">{dealRef}</div>
        </div>

        {/* Hero header */}
        <div className="bg-white rounded-2xl p-8 mb-6 border border-[#E8E2D9] shadow-sm">
          <div className="flex items-start gap-6">
            {/* Logo placeholder */}
            <div className="w-16 h-16 bg-[#B8913A]/10 border-2 border-[#B8913A]/20 rounded-xl flex items-center justify-center flex-shrink-0 text-[#B8913A] font-bold text-xl">
              {project.title.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="font-display text-2xl font-bold text-[#0F1320] mb-1">{project.title}</h1>
                  {project.tagline && <p className="text-[#5A6280] text-base">{project.tagline}</p>}
                </div>
                {project.amount_requested && (
                  <div className="text-right flex-shrink-0">
                    <div className="text-3xl font-bold text-[#B8913A]">
                      {formatCurrency(project.amount_requested, project.currency)}
                    </div>
                    <div className="text-[#5A6280] text-xs mt-0.5">Financement recherché</div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {project.sector && (
                  <span className="bg-[#0F1320]/5 text-[#0F1320] text-xs px-3 py-1 rounded-full font-medium">
                    {SECTOR_LABELS[project.sector] || project.sector}
                  </span>
                )}
                {project.stage && (
                  <span className="bg-[#B8913A]/10 text-[#B8913A] text-xs px-3 py-1 rounded-full font-medium">
                    {STAGE_LABELS[project.stage] || project.stage}
                  </span>
                )}
                {project.funding_type && (
                  <span className="bg-[#0F1320]/5 text-[#0F1320] text-xs px-3 py-1 rounded-full font-medium">
                    {FUNDING_TYPE_LABELS[project.funding_type] || project.funding_type}
                  </span>
                )}
                {location && (
                  <span className="bg-[#0F1320]/5 text-[#5A6280] text-xs px-3 py-1 rounded-full">
                    {location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Two-column body */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Left column — narrative */}
          <div className="md:col-span-2 space-y-5">

            {/* Business summary */}
            {project.description && (
              <div className="bg-white rounded-xl p-6 border border-[#E8E2D9] shadow-sm">
                <SectionLabel>Résumé exécutif</SectionLabel>
                <p className="text-[#0F1320] text-sm leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>
            )}

            {/* Use of funds */}
            {project.use_of_funds && (
              <div className="bg-white rounded-xl p-6 border border-[#E8E2D9] shadow-sm">
                <SectionLabel>Utilisation des fonds</SectionLabel>
                <p className="text-[#0F1320] text-sm leading-relaxed">{project.use_of_funds}</p>
              </div>
            )}

            {/* Investment details */}
            <div className="bg-white rounded-xl p-6 border border-[#E8E2D9] shadow-sm">
              <SectionLabel>Instrument de financement proposé</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {project.funding_type && (
                  <div className="p-3 bg-[#F6F4EF] rounded-lg">
                    <div className="text-[#5A6280] text-xs uppercase tracking-wider mb-1">Type</div>
                    <div className="text-[#0F1320] font-semibold text-sm">
                      {FUNDING_TYPE_LABELS[project.funding_type] || project.funding_type}
                    </div>
                  </div>
                )}
                {project.amount_requested && (
                  <div className="p-3 bg-[#F6F4EF] rounded-lg">
                    <div className="text-[#5A6280] text-xs uppercase tracking-wider mb-1">Montant</div>
                    <div className="text-[#B8913A] font-bold text-sm">
                      {formatCurrency(project.amount_requested, project.currency)}
                    </div>
                  </div>
                )}
                {project.funding_term_months && (
                  <div className="p-3 bg-[#F6F4EF] rounded-lg">
                    <div className="text-[#5A6280] text-xs uppercase tracking-wider mb-1">Durée</div>
                    <div className="text-[#0F1320] font-semibold text-sm">{project.funding_term_months} mois</div>
                  </div>
                )}
              </div>
            </div>

            {/* Impact */}
            {(project.impact_description || project.job_creation_expected) && (
              <div className="bg-white rounded-xl p-6 border border-[#E8E2D9] shadow-sm">
                <SectionLabel>Impact & Développement durable</SectionLabel>
                {project.job_creation_expected && (
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold text-[#B8913A]">{project.job_creation_expected}</span>
                    <span className="text-[#5A6280] text-sm">emplois directs estimés sur 3 ans</span>
                  </div>
                )}
                {project.impact_description && (
                  <p className="text-[#0F1320] text-sm leading-relaxed">{project.impact_description}</p>
                )}
              </div>
            )}
          </div>

          {/* Right column — key metrics */}
          <div className="space-y-5">

            {/* Company metrics */}
            <div className="bg-white rounded-xl p-6 border border-[#E8E2D9] shadow-sm">
              <SectionLabel>Entreprise</SectionLabel>
              <MetricRow label="Secteur"             value={SECTOR_LABELS[project.sector || ""] || project.sector}/>
              <MetricRow label="Stade"               value={STAGE_LABELS[project.stage || ""] || project.stage}/>
              <MetricRow label="Localisation"        value={location}/>
              <MetricRow label="Structure juridique" value={project.legal_structure}/>
              <MetricRow label="Années d'existence"  value={project.years_in_operation ? `${project.years_in_operation} an(s)` : null}/>
              <MetricRow label="Équipe"              value={project.team_size ? `${project.team_size} personne(s)` : null}/>
            </div>

            {/* Financials */}
            {project.has_existing_revenue && (
              <div className="bg-white rounded-xl p-6 border border-[#E8E2D9] shadow-sm">
                <SectionLabel>Données financières</SectionLabel>
                <MetricRow label="Revenus annuels" value={formatCurrency(project.annual_revenue, project.currency)}/>
                <div className="mt-2 text-[#5A6280] text-xs">Dernière année fiscale disponible</div>
              </div>
            )}

            {/* Collateral */}
            {project.has_collateral && (
              <div className="bg-white rounded-xl p-6 border border-[#E8E2D9] shadow-sm">
                <SectionLabel>Garanties disponibles</SectionLabel>
                <MetricRow label="Type"    value={project.collateral_type}/>
                <MetricRow label="Valeur"  value={formatCurrency(project.collateral_value, project.currency)}/>
                {project.collateral_description && (
                  <p className="text-[#5A6280] text-xs mt-2 leading-relaxed">{project.collateral_description}</p>
                )}
              </div>
            )}

            {/* CEO Summit stamp */}
            <div className="rounded-xl p-5 border border-[#B8913A]/20 bg-[#B8913A]/5">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-[#B8913A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
                </svg>
                <span className="text-[#B8913A] text-xs font-semibold uppercase tracking-wider">Dossier qualifié</span>
              </div>
              <p className="text-[#5A6280] text-xs leading-relaxed">
                Ce dossier a été examiné et validé par l&apos;équipe Cluster Capital &amp; Finance du CEO Summit Indian Ocean.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-[#E8E2D9] flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="font-display text-sm font-bold text-[#0F1320] mb-0.5">CEO Summit Investment Hub</div>
            <div className="text-[#5A6280] text-xs">Cluster Capital &amp; Finance — Indian Ocean</div>
          </div>
          <div className="text-right">
            <div className="text-[#5A6280] text-xs font-mono mb-0.5">{dealRef}</div>
            <div className="text-[#5A6280] text-xs">
              Document confidentiel — usage restreint aux parties autorisées
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
