import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatCurrency, formatDate, STATUS_CONFIG, SECTOR_LABELS, STAGE_LABELS, FUNDING_TYPE_LABELS } from "@/lib/utils";
import type { Project, InvestorProfile } from "@/types";

// ─── Status badge ──────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "text-[#5A6280]", bg: "bg-[#5A6280]/10" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${cfg.color} ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
}

// ─── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, accent = false }: {
  label: string; value: string | number; accent?: boolean;
}) {
  return (
    <div className="card p-5">
      <div className={`text-3xl font-bold tracking-tight mb-1 ${accent ? "text-[#B8913A]" : "text-[#0F1320]"}`}>
        {value}
      </div>
      <div className="text-[#8A8FA8] text-xs uppercase tracking-wider font-semibold">{label}</div>
    </div>
  );
}

// ─── Sector icon ───────────────────────────────────────────────
function SectorIcon({ sector }: { sector: string | null }) {
  if (sector === "tech") return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3"/>
    </svg>
  );
  if (sector === "energy") return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
    </svg>
  );
  if (sector === "agriculture") return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/>
    </svg>
  );
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/>
    </svg>
  );
}

// ─── Role type labels ──────────────────────────────────────────
const ROLE_TYPE_LABELS: Record<string, string> = {
  bank:          "Banque / Institution financière",
  pe_vc_fund:    "Fonds PE / Capital-risque",
  dfi:           "Institution de développement",
  wealth_family: "Family office / Privé",
  advisor:       "Conseiller / Structurateur",
  legal:         "Juriste / Avocat d'affaires",
  other:         "Autre profil",
};

// ─── Investor dashboard ────────────────────────────────────────
async function InvestorDashboard({ userId, firstName }: { userId: string; firstName: string }) {
  const supabase = await createClient();

  const [{ data: investorProfile }, { data: approvedProjects }] = await Promise.all([
    supabase.from("investor_profiles").select("*").eq("user_id", userId).maybeSingle() as unknown as Promise<{ data: InvestorProfile | null }>,
    supabase.from("projects")
      .select("id,title,sector,stage,amount_requested,currency,tagline,boost_score,funding_type")
      .eq("status", "approved")
      .order("boost_score", { ascending: false })
      .limit(4) as unknown as Promise<{ data: Pick<Project, "id"|"title"|"sector"|"stage"|"amount_requested"|"currency"|"tagline"|"boost_score"|"funding_type">[] | null }>,
  ]);

  const hour = parseInt(new Date().toLocaleString("fr-FR", { timeZone: "Indian/Antananarivo", hour: "numeric", hour12: false }), 10);
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="p-6 md:p-8 pt-[68px] md:pt-8 max-w-5xl mx-auto text-white">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-white/40 text-sm font-medium mb-1">{greeting}</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">{firstName}</h1>
          <p className="text-white/40 text-sm mt-1.5">
            Bienvenue sur votre espace investisseur — accédez aux opportunités du Deal Flow.
          </p>
        </div>
        <Link href="/dashboard/deal-flow"
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#B8913A]/15 border border-[#B8913A]/30 text-[#B8913A] rounded-lg text-sm font-medium hover:bg-[#B8913A]/25 transition-colors hidden sm:flex">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/>
          </svg>
          Voir tout le Deal Flow
        </Link>
      </div>

      {/* Investor profile card */}
      {investorProfile && (
        <div className="mb-6 rounded-2xl border border-white/8 bg-white/3 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white/70 text-xs uppercase tracking-wider font-bold">Mon profil investisseur</h2>
            <Link href="/dashboard/investor-profile" className="text-[#B8913A] text-xs hover:text-[#C8992A] transition-colors">
              Modifier →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Type</div>
              <div className="text-white text-sm font-medium">{ROLE_TYPE_LABELS[investorProfile.role_type] || investorProfile.role_type}</div>
            </div>
            {investorProfile.priority_sectors && investorProfile.priority_sectors.length > 0 && (
              <div>
                <div className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Secteurs</div>
                <div className="text-white text-sm font-medium">{investorProfile.priority_sectors.slice(0, 2).join(", ")}{investorProfile.priority_sectors.length > 2 ? ` +${investorProfile.priority_sectors.length - 2}` : ""}</div>
              </div>
            )}
            {(investorProfile.ticket_min || investorProfile.ticket_max) && (
              <div>
                <div className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Ticket</div>
                <div className="text-white text-sm font-medium tabular-nums">
                  {investorProfile.ticket_min ? formatCurrency(investorProfile.ticket_min, "USD") : "—"}
                  {" – "}
                  {investorProfile.ticket_max ? formatCurrency(investorProfile.ticket_max, "USD") : "—"}
                </div>
              </div>
            )}
            {investorProfile.geographic_zones && investorProfile.geographic_zones.length > 0 && (
              <div>
                <div className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Zones</div>
                <div className="text-white text-sm font-medium">{investorProfile.geographic_zones.slice(0, 2).join(", ")}{investorProfile.geographic_zones.length > 2 ? ` +${investorProfile.geographic_zones.length - 2}` : ""}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deal flow preview */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-white/70 text-xs uppercase tracking-wider font-bold">Opportunités récentes</h2>
        <Link href="/dashboard/deal-flow"
          className="text-[#B8913A] hover:text-[#C8992A] text-sm font-medium transition-colors flex items-center gap-1.5">
          Voir tout
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </Link>
      </div>

      {approvedProjects && approvedProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {approvedProjects.map(project => (
            <div key={project.id} className="rounded-xl border border-white/8 bg-white/3 p-4 hover:border-[#B8913A]/30 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8913A] bg-[#B8913A]/10 px-2 py-0.5 rounded-full">
                  {SECTOR_LABELS[project.sector || ""] || project.sector || "—"}
                </span>
                {project.boost_score > 0 && (
                  <span className="text-[10px] text-white/30 font-mono">{project.boost_score}pts</span>
                )}
              </div>
              <h3 className="text-white font-semibold text-sm mb-1 leading-snug">{project.title}</h3>
              {project.tagline && (
                <p className="text-white/40 text-xs leading-snug mb-3 line-clamp-2">{project.tagline}</p>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/30">{STAGE_LABELS[project.stage || ""] || project.stage || "—"}</span>
                {project.amount_requested && (
                  <span className="text-white/70 font-semibold tabular-nums">{formatCurrency(project.amount_requested, project.currency)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center mb-6">
          <p className="text-white/30 text-sm">Aucune opportunité disponible pour le moment.</p>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/dashboard/deal-flow"
          className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/3 hover:border-[#B8913A]/30 hover:bg-[#B8913A]/5 transition-all group">
          <div className="w-9 h-9 rounded-lg bg-[#B8913A]/10 border border-[#B8913A]/20 flex items-center justify-center text-[#B8913A] flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/>
            </svg>
          </div>
          <div>
            <div className="text-white/80 font-medium text-sm group-hover:text-white transition-colors">Voir tout le deal flow →</div>
            <div className="text-white/30 text-xs">Toutes les opportunités approuvées</div>
          </div>
        </Link>
        <Link href="/dashboard/investor-profile"
          className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/3 hover:border-[#B8913A]/30 hover:bg-[#B8913A]/5 transition-all group">
          <div className="w-9 h-9 rounded-lg bg-[#B8913A]/10 border border-[#B8913A]/20 flex items-center justify-center text-[#B8913A] flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
            </svg>
          </div>
          <div>
            <div className="text-white/80 font-medium text-sm group-hover:text-white transition-colors">Modifier mon profil →</div>
            <div className="text-white/30 text-xs">Critères, secteurs, ticket d&apos;intervention</div>
          </div>
        </Link>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: projects }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("projects").select("*").eq("user_id", user!.id)
      .order("created_at", { ascending: false }).limit(5) as unknown as Promise<{ data: Project[] | null }>,
  ]);

  const isInvestor = profile?.role === "investor";
  const firstName = profile?.full_name?.split(" ")[0] || "vous";

  if (isInvestor) {
    return <InvestorDashboard userId={user!.id} firstName={firstName} />;
  }

  const stats = {
    total:     projects?.length || 0,
    submitted: projects?.filter(p => ["submitted","under_review"].includes(p.status)).length || 0,
    approved:  projects?.filter(p => p.status === "approved").length || 0,
    funded:    projects?.filter(p => p.status === "funded").length || 0,
  };

  const hour      = parseInt(new Date().toLocaleString("fr-FR", { timeZone: "Indian/Antananarivo", hour: "numeric", hour12: false }), 10);
  const greeting  = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="p-6 md:p-8 pt-[68px] md:pt-8 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[#9A9FAF] text-sm font-medium mb-1">{greeting}</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0F1320]">
            {firstName}
          </h1>
          <p className="text-[#7A8098] text-sm mt-1.5">
            {stats.total === 0
              ? "Bienvenue sur CEO Summit IO — Investment Hub. Soumettez votre premier dossier pour commencer."
              : `Vous avez ${stats.total} dossier${stats.total > 1 ? "s" : ""} actif${stats.total > 1 ? "s" : ""} sur la plateforme.`}
          </p>
        </div>
        <Link href="/dashboard/projects/new"
          className="flex-shrink-0 btn-primary py-2.5 px-5 text-sm hidden sm:inline-flex">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
          </svg>
          Nouveau dossier
        </Link>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Total"    value={stats.total}/>
        <StatCard label="En cours" value={stats.submitted}/>
        <StatCard label="Approuvés" value={stats.approved}/>
        <StatCard label="Financés"  value={stats.funded} accent/>
      </div>

      {/* ── Main content ── */}
      {stats.total === 0 ? (

        /* Empty state */
        <div className="card p-12 text-center">
          <div className="w-14 h-14 bg-[#B8913A]/8 border border-[#B8913A]/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-[#B8913A]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-[#0F1320] mb-2">Soumettez votre premier dossier</h2>
          <p className="text-[#7A8098] mb-7 max-w-md mx-auto text-sm leading-relaxed">
            Notre formulaire vous guide en 5 étapes pour présenter votre projet aux investisseurs de l&apos;Océan Indien et de l&apos;Afrique.
          </p>
          <Link href="/dashboard/projects/new" className="btn-primary inline-flex">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            Créer mon premier dossier
          </Link>
        </div>

      ) : (

        /* Project list */
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#0F1320] uppercase tracking-wider">Dossiers récents</h2>
            <Link href="/dashboard/projects"
              className="text-[#B8913A] hover:text-[#9A7B3A] text-sm font-medium transition-colors flex items-center gap-1.5">
              Voir tout
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </Link>
          </div>

          <div className="card overflow-hidden">
            {(projects || []).map((p, i) => (
              <Link key={p.id} href={`/dashboard/projects/${p.id}`}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-[#F8F5F0] transition-colors group ${
                  i < (projects?.length || 0) - 1 ? "border-b border-[#EDE7DE]" : ""
                }`}>
                <div className="w-8 h-8 rounded-lg bg-[#B8913A]/8 border border-[#B8913A]/15 flex items-center justify-center text-[#B8913A]/70 group-hover:text-[#B8913A] flex-shrink-0 transition-colors">
                  <SectorIcon sector={p.sector}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#0F1320] font-medium text-sm truncate group-hover:text-[#B8913A] transition-colors">
                    {p.title}
                  </div>
                  <div className="text-[#9A9FAF] text-xs mt-0.5">
                    {SECTOR_LABELS[p.sector || ""] || p.sector || "—"} · {formatDate(p.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {p.amount_requested && (
                    <span className="text-[#0F1320] text-sm font-semibold hidden sm:block tabular-nums">
                      {formatCurrency(p.amount_requested, p.currency)}
                    </span>
                  )}
                  <StatusPill status={p.status}/>
                  <svg className="w-4 h-4 text-[#C8C0B5] group-hover:text-[#B8913A] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-4">
            <Link href="/dashboard/projects/new" className="btn-primary inline-flex text-sm py-2.5 px-5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
              </svg>
              Nouveau dossier
            </Link>
          </div>
        </div>
      )}

      {/* ── Advisory tip ── */}
      <div className="mt-6 card p-5 border-l-2 border-l-[#B8913A] rounded-l-none" style={{ borderLeftWidth: 3 }}>
        <div className="flex items-start gap-3">
          <svg className="w-4 h-4 text-[#B8913A] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
          </svg>
          <div>
            <h3 className="text-[#0F1320] font-semibold text-sm mb-0.5">Conseil de l&apos;équipe</h3>
            <p className="text-[#7A8098] text-xs leading-relaxed">
              Les dossiers avec une description complète et des données financières reçoivent{" "}
              <strong className="text-[#0F1320]">3× plus de retours</strong> d&apos;investisseurs.
              Pensez à compléter votre profil, vos états financiers et une présentation de l&apos;équipe.
            </p>
          </div>
        </div>
      </div>

      {/* ── What's next panel ── */}
      <div className="mt-6 card overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EDE7DE] bg-[#FAF7F3]">
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-[#B8913A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
            </svg>
            <h2 className="text-[#0F1320] font-bold text-sm uppercase tracking-wider">
              Votre dossier en route vers les investisseurs
            </h2>
          </div>
          <p className="text-[#7A8098] text-xs mt-2 leading-relaxed max-w-xl">
            Une fois soumis, votre projet intègre le <strong className="text-[#0F1320]">CEO Summit Investment Deal Book</strong> — le document de référence distribué à notre réseau d&apos;investisseurs actifs dans l&apos;Océan Indien et au-delà.
          </p>
        </div>

        {/* Journey steps */}
        <div className="px-6 py-5">
          <div className="flex flex-col sm:flex-row gap-0 sm:gap-0">
            {[
              {
                n: "1",
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                  </svg>
                ),
                label:    "Dossier soumis",
                sub:      "Votre projet est reçu et en file de traitement",
                status:   stats.submitted > 0 || stats.approved > 0 || stats.funded > 0 ? "done" : stats.total > 0 ? "active" : "pending",
              },
              {
                n: "2",
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                ),
                label:    "Revue éditoriale",
                sub:      "Notre équipe analyse votre dossier sous 48h",
                status:   stats.approved > 0 || stats.funded > 0 ? "done" : stats.submitted > 0 ? "active" : "pending",
              },
              {
                n: "3",
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                  </svg>
                ),
                label:    "Publication Deal Book",
                sub:      "Votre projet est présenté aux investisseurs partenaires",
                status:   stats.funded > 0 ? "done" : stats.approved > 0 ? "active" : "pending",
              },
            ].map((step, i) => {
              const isDone    = step.status === "done";
              const isActive  = step.status === "active";
              return (
                <div key={step.n} className="flex sm:flex-col flex-1 items-start sm:items-center gap-3 sm:gap-2 sm:text-center relative pb-5 sm:pb-0">
                  {/* Connector line */}
                  {i < 2 && (
                    <>
                      <div className="hidden sm:block absolute top-5 left-[calc(50%+1.25rem)] right-0 h-px bg-[#EDE7DE]"/>
                      {(isDone) && <div className="hidden sm:block absolute top-5 left-[calc(50%+1.25rem)] right-0 h-px bg-[#B8913A]/40"/>}
                    </>
                  )}
                  {/* Icon circle */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isDone   ? "bg-[#B8913A]/12 border border-[#B8913A]/30 text-[#B8913A]" :
                    isActive ? "bg-[#F0EBDF] border-2 border-[#B8913A]/50 text-[#B8913A]" :
                               "bg-[#F5F3EF] border border-[#EDE7DE] text-[#C8C0B5]"
                  }`}>
                    {isDone ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                    ) : step.icon}
                  </div>
                  {/* Text */}
                  <div className="flex-1 sm:flex-none sm:px-2">
                    <div className={`text-xs font-bold leading-none mb-1 ${isDone || isActive ? "text-[#0F1320]" : "text-[#B0A898]"}`}>
                      {step.label}
                    </div>
                    <div className="text-[11px] text-[#9A9FAF] leading-snug">{step.sub}</div>
                    {isActive && !isDone && (
                      <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-[#B8913A] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B8913A] animate-pulse"/>
                        En cours
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Opportunities */}
        <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#EDE7DE] bg-[#FAF7F3] p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#B8913A]/10 border border-[#B8913A]/20 flex items-center justify-center text-[#B8913A] flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
              </svg>
            </div>
            <div>
              <div className="text-[#0F1320] font-semibold text-xs mb-0.5">Pitching live</div>
              <p className="text-[#7A8098] text-[11px] leading-relaxed">
                Les dossiers sélectionnés sont invités à pitcher en direct lors des événements CEO Summit devant des investisseurs qualifiés.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-[#EDE7DE] bg-[#FAF7F3] p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#B8913A]/10 border border-[#B8913A]/20 flex items-center justify-center text-[#B8913A] flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
              </svg>
            </div>
            <div>
              <div className="text-[#0F1320] font-semibold text-xs mb-0.5">Pitch digital ciblé</div>
              <p className="text-[#7A8098] text-[11px] leading-relaxed">
                Mise en relation confidentielle avec 3 investisseurs ciblés pour un échange direct — sur sélection de notre équipe.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 text-[11px] text-[#B0A898] leading-relaxed">
          Notre équipe vous contactera si votre dossier est retenu pour l&apos;une de ces étapes.
        </div>
      </div>
    </div>
  );
}
