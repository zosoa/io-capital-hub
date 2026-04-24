import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatCurrency, SECTOR_LABELS, STAGE_LABELS, FUNDING_TYPE_LABELS } from "@/lib/utils";
import type { Project, InvestorProfile } from "@/types";
import SaveToggle from "./SaveToggle";
import SortPersist from "./SortPersist";
import { expandZones, zoneMatches, type ZoneExpansion } from "@/lib/zones";

// ─── Match score (0–4) between project and investor profile ────────────────
// Four binary criteria, summed. UI displays up to 4 stars.
//   1. Sector:   investor stores DB keys (I-C1) → direct equality.
//   2. Ticket:   investor's min/max converted to USD via fx_rates (I-C2).
//   3. Geo:      zone expansion (I-H1) — "Région Océan Indien" expands to its
//                countries, "International" matches everything, individual
//                countries match themselves.
//   4. Duration: investor duration_prefs includes project's range (I-H2).
function matchScore(
  project: Pick<Project, "sector"|"amount_requested"|"country"|"funding_duration_range"> & { normalized_usd_amount?: number | null },
  inv: InvestorProfile | null,
  fxToUsd: number,
  zoneExp: ZoneExpansion,
): number {
  if (!inv) return 0;
  let score = 0;

  if (inv.priority_sectors?.includes(project.sector || "")) score++;

  const usdProject = project.normalized_usd_amount ?? project.amount_requested;
  if (
    inv.ticket_min != null && inv.ticket_max != null &&
    usdProject != null && fxToUsd > 0
  ) {
    const invMinUsd = inv.ticket_min * fxToUsd;
    const invMaxUsd = inv.ticket_max * fxToUsd;
    if (usdProject >= invMinUsd && usdProject <= invMaxUsd) score++;
  }

  // Zone-aware match: pre-expanded once per scorer invocation for efficiency.
  if (zoneMatches(zoneExp, project.country)) score++;

  if (
    inv.duration_prefs && inv.duration_prefs.length > 0 &&
    project.funding_duration_range &&
    inv.duration_prefs.includes(project.funding_duration_range)
  ) score++;

  return score;
}

type SortKey = "match" | "amount_desc" | "amount_asc" | "newest";

export default async function DealFlowPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; saved?: string }>;
}) {
  const sp = await searchParams;
  const sort: SortKey = (["match","amount_desc","amount_asc","newest"] as const).includes(sp.sort as SortKey)
    ? (sp.sort as SortKey) : "match";
  const savedOnly = sp.saved === "1";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Load investor profile for smart filtering (null if user is a project owner)
  const { data: investorProfile } = user
    ? await supabase.from("investor_profiles").select("*").eq("user_id", user.id).maybeSingle() as { data: InvestorProfile | null }
    : { data: null };

  // Resolve the investor's ticket currency → USD rate (fallback to 1 if missing).
  let fxToUsd = 1;
  if (investorProfile?.ticket_currency && investorProfile.ticket_currency !== "USD") {
    const { data: fxRow } = await supabase
      .from("fx_rates")
      .select("rate_to_usd")
      .eq("currency", investorProfile.ticket_currency)
      .maybeSingle();
    if (fxRow?.rate_to_usd) fxToUsd = Number(fxRow.rate_to_usd);
  }

  // Pre-expand geographic zones once (I-H1) — scorer is called per project.
  const zoneExp = expandZones(investorProfile?.geographic_zones ?? null);

  // Load the user's saved project ids in parallel
  const { data: savedRows } = user
    ? await supabase.from("deal_saves").select("project_id").eq("user_id", user.id)
    : { data: [] as { project_id: string }[] | null };
  const savedIds = new Set((savedRows ?? []).map(r => r.project_id));

  const { data: allProjects } = await supabase
    .from("projects")
    .select("id,title,sector,stage,funding_type,amount_requested,currency,normalized_usd_amount,tagline,boost_score,country,funding_duration_range,created_at")
    .eq("status", "approved")
    .order("boost_score", { ascending: false }) as {
      data: (Pick<Project, "id"|"title"|"sector"|"stage"|"funding_type"|"amount_requested"|"currency"|"tagline"|"boost_score"|"country"|"funding_duration_range"> & { created_at: string; normalized_usd_amount: number | null })[] | null
    };

  const projects = allProjects || [];
  const hasProfile = !!investorProfile;

  const scored = projects.map(p => ({ ...p, _match: matchScore(p, investorProfile, fxToUsd, zoneExp), _saved: savedIds.has(p.id) }));

  // Apply sort
  let sorted: typeof scored;
  if (sort === "amount_desc") {
    sorted = [...scored].sort((a, b) => (b.normalized_usd_amount ?? 0) - (a.normalized_usd_amount ?? 0));
  } else if (sort === "amount_asc") {
    sorted = [...scored].sort((a, b) => (a.normalized_usd_amount ?? Infinity) - (b.normalized_usd_amount ?? Infinity));
  } else if (sort === "newest") {
    sorted = [...scored].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  } else {
    // "match" — profile matches first, then boost
    const matched = scored.filter(p => p._match > 0).sort((a, b) => b._match - a._match || b.boost_score - a.boost_score);
    const others  = scored.filter(p => p._match === 0);
    sorted = hasProfile ? [...matched, ...others] : scored;
  }

  if (savedOnly) sorted = sorted.filter(p => p._saved);

  const matchCount = scored.filter(p => p._match > 0).length;
  const savedCount = scored.filter(p => p._saved).length;

  const tabLink = (key: SortKey | "saved", label: string) => {
    const isActive = key === "saved" ? savedOnly : (sort === key && !savedOnly);
    const params = new URLSearchParams();
    if (key === "saved") { params.set("saved", "1"); params.set("sort", sort); }
    else                 { params.set("sort", key); }
    return (
      <Link key={key} href={`?${params.toString()}`}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
          isActive
            ? "bg-[#B8913A]/15 border-[#B8913A]/40 text-[#B8913A]"
            : "border-white/8 text-white/40 hover:text-white/70 hover:border-white/20"
        }`}>
        {label}
      </Link>
    );
  };

  return (
    <div className="p-6 md:p-8 pt-[68px] md:pt-8 max-w-5xl mx-auto">
      <Suspense fallback={null}><SortPersist/></Suspense>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1.5">Deal Flow</h1>
        <p className="text-white/40 text-sm">
          {projects.length
            ? <>
                {projects.length} opportunité{projects.length > 1 ? "s" : ""} disponible{projects.length > 1 ? "s" : ""}
                {hasProfile && matchCount > 0 && (
                  <span className="ml-2 text-[#B8913A]">
                    · {matchCount} correspond{matchCount > 1 ? "ent" : ""} à votre profil
                  </span>
                )}
              </>
            : "Aucune opportunité disponible pour le moment."}
        </p>
      </div>

      {/* Sort + saved tabs */}
      {projects.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-white/30 text-xs uppercase tracking-widest mr-2">Trier</span>
          {tabLink("match",        "Correspondance")}
          {tabLink("amount_desc",  "Montant ↓ (USD)")}
          {tabLink("amount_asc",   "Montant ↑ (USD)")}
          {tabLink("newest",       "Plus récents")}
          <span className="mx-2 h-4 w-px bg-white/10"/>
          {tabLink("saved",        `Sauvegardés${savedCount ? ` (${savedCount})` : ""}`)}
        </div>
      )}

      {/* I-M6 — Soft prompt when logged in but investor profile is blank or
          has no priority_sectors (→ matching is effectively off). Only shown
          on the default "match" sort so we don't nag when they're browsing
          saved deals. */}
      {user && (!investorProfile || !investorProfile.priority_sectors?.length)
        && projects.length > 0 && sort === "match" && !savedOnly && (
        <div className="mb-6 p-4 rounded-xl bg-[#B8913A]/6 border border-[#B8913A]/25 flex items-start gap-3 text-sm">
          <svg className="w-5 h-5 text-[#B8913A] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-white/75 font-medium mb-0.5">Activez la correspondance automatique</p>
            <p className="text-white/45 text-xs leading-relaxed">
              Sans profil d&apos;investissement complet, tous les projets apparaissent sans score de pertinence.
              Renseignez vos secteurs, ticket et zones pour voir en priorité les dossiers alignés à votre mandat.
            </p>
            <Link href="/dashboard/investor-profile?onboarding=1"
              className="inline-flex items-center gap-1.5 mt-2 text-[#B8913A] hover:text-[#C8992A] text-xs font-medium transition-colors">
              Compléter mon profil
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Match notice */}
      {hasProfile && matchCount > 0 && projects.length > 0 && sort === "match" && !savedOnly && (
        <div className="mb-6 p-3.5 rounded-xl bg-[#B8913A]/8 border border-[#B8913A]/20 flex items-center gap-3 text-sm">
          <svg className="w-4 h-4 text-[#B8913A] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
          </svg>
          <span className="text-white/70">
            Les projets <span className="text-[#B8913A] font-medium">étoilés</span> correspondent à vos critères d&apos;investissement (secteur, ticket, zone géographique, durée).
          </span>
        </div>
      )}

      {/* Project grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {sorted.map(project => (
            <div key={project.id}
              className={`rounded-xl border p-5 hover:border-[#B8913A]/30 hover:bg-[#B8913A]/5 transition-all flex flex-col relative ${
                project._match > 0
                  ? "border-[#B8913A]/30 bg-[#B8913A]/5"
                  : "border-white/8 bg-white/3"
              }`}>

              {/* Top-right: save toggle + match indicator stacked */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                {project._match > 0 && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <svg key={i} className={`w-2.5 h-2.5 ${i < project._match ? "text-[#B8913A]" : "text-white/10"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                )}
                <SaveToggle projectId={project.id} initialSaved={project._saved} variant="card"/>
              </div>

              {/* Top row: sector badge */}
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 mb-3 pr-20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8913A] bg-[#B8913A]/10 px-2.5 py-1 rounded-full truncate max-w-[160px]">
                  {SECTOR_LABELS[project.sector || ""] || project.sector || "—"}
                </span>
                {project.boost_score > 0 && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-14 h-1 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-[#B8913A]"
                        style={{ width: `${Math.min(project.boost_score, 100)}%` }}/>
                    </div>
                    <span className="text-[10px] text-white/30 font-mono whitespace-nowrap">{project.boost_score}pt</span>
                  </div>
                )}
              </div>

              {/* Title + tagline */}
              <h3 className="text-white font-semibold text-base mb-1.5 leading-snug">{project.title}</h3>
              {project.tagline && (
                <p className="text-white/40 text-xs leading-relaxed mb-4 flex-1 line-clamp-3">{project.tagline}</p>
              )}
              {!project.tagline && <div className="flex-1"/>}

              {/* Meta row */}
              <div className="border-t border-white/6 pt-3 mt-3 flex flex-wrap items-center gap-2">
                {project.stage && (
                  <span className="text-[10px] text-white/35 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">
                    {STAGE_LABELS[project.stage] || project.stage}
                  </span>
                )}
                {project.funding_type && (
                  <span className="text-[10px] text-white/35 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">
                    {FUNDING_TYPE_LABELS[project.funding_type] || project.funding_type}
                  </span>
                )}
                {project.amount_requested && (
                  <span className="ml-auto text-white/70 font-semibold text-sm tabular-nums">
                    {formatCurrency(project.amount_requested, project.currency)}
                  </span>
                )}
              </div>

              {/* CTA */}
              <div className="mt-4">
                <Link href={`/dashboard/deal-flow/${project.id}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#B8913A]/30 text-[#B8913A] text-xs font-medium hover:bg-[#B8913A]/10 hover:border-[#B8913A]/50 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  Voir le dossier
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/8 bg-white/3 p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-[#B8913A]/10 border border-[#B8913A]/20 flex items-center justify-center mx-auto mb-4 text-[#B8913A]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/>
            </svg>
          </div>
          <h2 className="text-white font-display text-lg font-bold mb-2">
            {savedOnly ? "Aucun projet sauvegardé" : "Aucune opportunité pour le moment"}
          </h2>
          <p className="text-white/35 text-sm mb-6 leading-relaxed">
            {savedOnly
              ? "Cliquez sur l'icône favori depuis un projet pour le retrouver ici."
              : "Les projets qualifiés par notre équipe apparaîtront ici. De nouveaux dossiers sont ajoutés chaque semaine."}
          </p>
          <div className="flex flex-col gap-3">
            {savedOnly ? (
              <Link href="/dashboard/deal-flow"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#B8913A]/10 border border-[#B8913A]/25 text-[#B8913A] text-sm font-medium hover:bg-[#B8913A]/20 transition-all">
                Voir tous les projets
              </Link>
            ) : (
              <>
                <Link href="/dashboard/investor-profile"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#B8913A]/10 border border-[#B8913A]/25 text-[#B8913A] text-sm font-medium hover:bg-[#B8913A]/20 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                  </svg>
                  Compléter mon profil investisseur
                </Link>
                <a href="mailto:contact@ceosummit.io"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/8 text-white/40 text-sm hover:text-white/60 hover:border-white/15 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                  </svg>
                  Nous contacter
                </a>
              </>
            )}
          </div>
        </div>
      )}

      {/* Back link */}
      <div className="mt-8">
        <Link href="/dashboard" className="text-white/30 hover:text-white/60 text-sm transition-colors flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
