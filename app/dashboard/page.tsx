import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatCurrency, formatDate, STATUS_CONFIG, SECTOR_LABELS, STAGE_LABELS } from "@/lib/utils";
import { readinessBreakdown, readinessSummary } from "@/lib/readiness";
import SolutionsCapital from "@/components/dashboard/SolutionsCapital";
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
function StatCard({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="card p-5">
      <div className={`text-3xl font-bold tracking-tight mb-1 ${accent ? "text-[#1F4E79]" : "text-[#0F1320]"}`}>{value}</div>
      <div className="text-[#8A8FA8] text-xs uppercase tracking-wider font-semibold">{label}</div>
    </div>
  );
}

// ─── Sector icon ───────────────────────────────────────────────
function SectorIcon({ sector }: { sector: string | null }) {
  if (sector === "tech") return (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3"/></svg>);
  if (sector === "energy") return (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>);
  if (sector === "agriculture") return (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/></svg>);
  return (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/></svg>);
}

// ─── Role type labels ──────────────────────────────────────────
const ROLE_TYPE_LABELS: Record<string, string> = {
  bank: "Banque / Institution financière", pe_vc_fund: "Fonds PE / Capital-risque", dfi: "Institution de développement",
  wealth_family: "Family office / Privé", advisor: "Conseiller / Structurateur", legal: "Juriste / Avocat d'affaires", other: "Autre profil",
};

// ─── Investor dashboard (unchanged behaviour) ──────────────────
async function InvestorDashboard({ userId, firstName }: { userId: string; firstName: string }) {
  const supabase = await createClient();
  const [{ data: investorProfile }, { data: approvedProjects }] = await Promise.all([
    supabase.from("investor_profiles").select("*").eq("user_id", userId).maybeSingle() as unknown as Promise<{ data: InvestorProfile | null }>,
    supabase.from("projects").select("id,title,sector,stage,amount_requested,currency,tagline,boost_score,funding_type").eq("status", "approved").order("boost_score", { ascending: false }).limit(4) as unknown as Promise<{ data: Pick<Project, "id"|"title"|"sector"|"stage"|"amount_requested"|"currency"|"tagline"|"boost_score"|"funding_type">[] | null }>,
  ]);
  const hour = parseInt(new Date().toLocaleString("fr-FR", { timeZone: "Indian/Antananarivo", hour: "numeric", hour12: false }), 10);
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  return (
    <div className="p-6 md:p-8 pt-[68px] md:pt-8 max-w-5xl mx-auto text-[#22201B]">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[#918A7C] text-sm font-medium mb-1">{greeting}</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#22201B]">{firstName}</h1>
          <p className="text-[#918A7C] text-sm mt-1.5">Bienvenue sur votre espace investisseur — accédez aux opportunités du Deal Flow.</p>
        </div>
        <Link href="/dashboard/deal-flow" className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#1F4E79]/15 border border-[#1F4E79]/30 text-[#1F4E79] rounded-lg text-sm font-medium hover:bg-[#1F4E79]/25 transition-colors hidden sm:flex">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/></svg>
          Voir tout le Deal Flow
        </Link>
      </div>
      {investorProfile && (
        <div className="mb-6 rounded-2xl border border-[#E4E7EC] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#575249] text-xs uppercase tracking-wider font-bold">Mon profil investisseur</h2>
            <Link href="/dashboard/investor-profile" className="text-[#1F4E79] text-xs hover:text-[#163C5E] transition-colors">Modifier →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><div className="text-[#918A7C] text-[10px] uppercase tracking-wider mb-0.5">Type</div><div className="text-[#22201B] text-sm font-medium">{ROLE_TYPE_LABELS[investorProfile.role_type] || investorProfile.role_type}</div></div>
            {investorProfile.priority_sectors && investorProfile.priority_sectors.length > 0 && (<div><div className="text-[#918A7C] text-[10px] uppercase tracking-wider mb-0.5">Secteurs</div><div className="text-[#22201B] text-sm font-medium">{investorProfile.priority_sectors.slice(0, 2).join(", ")}{investorProfile.priority_sectors.length > 2 ? ` +${investorProfile.priority_sectors.length - 2}` : ""}</div></div>)}
            {(investorProfile.ticket_min || investorProfile.ticket_max) && (<div><div className="text-[#918A7C] text-[10px] uppercase tracking-wider mb-0.5">Ticket</div><div className="text-[#22201B] text-sm font-medium tabular-nums">{investorProfile.ticket_min ? formatCurrency(investorProfile.ticket_min, investorProfile.ticket_currency || "USD") : "—"}{" – "}{investorProfile.ticket_max ? formatCurrency(investorProfile.ticket_max, investorProfile.ticket_currency || "USD") : "—"}</div></div>)}
            {investorProfile.geographic_zones && investorProfile.geographic_zones.length > 0 && (<div><div className="text-[#918A7C] text-[10px] uppercase tracking-wider mb-0.5">Zones</div><div className="text-[#22201B] text-sm font-medium">{investorProfile.geographic_zones.slice(0, 2).join(", ")}{investorProfile.geographic_zones.length > 2 ? ` +${investorProfile.geographic_zones.length - 2}` : ""}</div></div>)}
          </div>
        </div>
      )}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[#575249] text-xs uppercase tracking-wider font-bold">Opportunités récentes</h2>
        <Link href="/dashboard/deal-flow" className="text-[#1F4E79] hover:text-[#163C5E] text-sm font-medium transition-colors flex items-center gap-1.5">Voir tout<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg></Link>
      </div>
      {approvedProjects && approvedProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {approvedProjects.map(project => (
            <div key={project.id} className="rounded-xl border border-[#E4E7EC] bg-white p-4 hover:border-[#1F4E79]/30 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2"><span className="text-[10px] font-bold uppercase tracking-wider text-[#1F4E79] bg-[#1F4E79]/10 px-2 py-0.5 rounded-full">{SECTOR_LABELS[project.sector || ""] || project.sector || "—"}</span>{project.boost_score > 0 && (<span className="text-[10px] text-[#918A7C] font-mono">{project.boost_score}pts</span>)}</div>
              <h3 className="text-[#22201B] font-semibold text-sm mb-1 leading-snug">{project.title}</h3>
              {project.tagline && (<p className="text-[#918A7C] text-xs leading-snug mb-3 line-clamp-2">{project.tagline}</p>)}
              <div className="flex items-center justify-between text-xs"><span className="text-[#918A7C]">{STAGE_LABELS[project.stage || ""] || project.stage || "—"}</span>{project.amount_requested && (<span className="text-[#575249] font-semibold tabular-nums">{formatCurrency(project.amount_requested, project.currency)}</span>)}</div>
            </div>
          ))}
        </div>
      ) : (<div className="rounded-xl border border-[#E4E7EC] bg-white p-8 text-center mb-6"><p className="text-[#918A7C] text-sm">Aucune opportunité disponible pour le moment.</p></div>)}
    </div>
  );
}

// ─── Founder Capital Journey ───────────────────────────────────
function CapitalJourney({ status, readiness }: { status: string; readiness: number }) {
  const submitted = status !== "draft";
  const inReview = status === "under_review";
  const qualified = ["approved", "funded"].includes(status);
  type S = "done" | "active" | "todo";
  const live: { n: string; label: string; sub: string; s: S }[] = [
    { n: "01", label: "Dossier soumis", sub: "Reçu et en file de traitement", s: submitted ? "done" : "active" },
    { n: "02", label: "Qualification éditoriale", sub: "Revue par notre équipe", s: qualified ? "done" : inReview ? "active" : "todo" },
    { n: "03", label: "Capital Readiness", sub: `Complétude ${readiness}/100`, s: "active" },
    { n: "04", label: "Deal Book", sub: "Après validation éditoriale", s: qualified ? "done" : "todo" },
  ];
  const future = [
    { n: "05", label: "KAPEX Verified", sub: "Confiance", tag: "Service" },
    { n: "06", label: "Investor Matching", sub: "Trouver les bons investisseurs", tag: "Service" },
    { n: "07", label: "Investor Introductions", sub: "Ouvrir la conversation", tag: "Service" },
    { n: "08", label: "KAPEX Forum · Maurice", sub: "Se rencontrer", tag: "Annuel" },
    { n: "09", label: "Fundraising & suivi", sub: "Faire avancer la relation", tag: "À venir" },
  ];
  const dot = (s: S) => {
    if (s === "done") return <span className="w-6 h-6 rounded-full bg-[#0C1F36]/10 border border-[#0C1F36]/25 text-[#0C1F36] flex items-center justify-center flex-shrink-0"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg></span>;
    if (s === "active") return <span className="w-6 h-6 rounded-full bg-[#1F4E79]/12 border-2 border-[#1F4E79]/50 flex items-center justify-center flex-shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-[#1F4E79] animate-pulse"/></span>;
    return <span className="w-6 h-6 rounded-full bg-[#F5F3EF] border border-[#EDE7DE] text-[#C8C0B5] flex items-center justify-center flex-shrink-0 text-[10px]">○</span>;
  };
  return (
    <div className="card p-5">
      <h2 className="text-sm font-bold text-[#0F1320] uppercase tracking-wider mb-4">Votre parcours vers le capital</h2>
      <div className="space-y-1.5">
        {live.map(st => (
          <div key={st.n} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[#EDE7DE] bg-white">
            <span className="font-mono text-[11px] text-[#B0A898] w-5">{st.n}</span>
            {dot(st.s)}
            <div className="flex-1 min-w-0"><div className="text-[13px] font-semibold text-[#0F1320] leading-tight">{st.label}</div><div className="text-[11px] text-[#918A7C]">{st.sub}</div></div>
            {st.s === "active" && <span className="text-[9.5px] font-bold uppercase tracking-wide text-[#1F4E79] bg-[#1F4E79]/10 px-2 py-0.5 rounded-full">En cours</span>}
            {st.s === "done" && <span className="text-[9.5px] font-bold uppercase tracking-wide text-[#0C1F36] bg-[#0C1F36]/8 px-2 py-0.5 rounded-full">Fait</span>}
          </div>
        ))}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#B0A898] mt-4 mb-2 px-1">Services &amp; étapes à venir</div>
      <div className="space-y-1.5">
        {future.map(st => (
          <div key={st.n} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[#EDE7DE] bg-[#FAF9F7] opacity-80">
            <span className="font-mono text-[11px] text-[#C8C0B5] w-5">{st.n}</span>
            <span className="w-6 h-6 rounded-full bg-[#F2F3F6] border border-[#EDE7DE] text-[#B0A898] flex items-center justify-center flex-shrink-0"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5H6.75a1.5 1.5 0 01-1.5-1.5v-6a1.5 1.5 0 011.5-1.5z"/></svg></span>
            <div className="flex-1 min-w-0"><div className="text-[13px] font-semibold text-[#575249] leading-tight">{st.label}</div><div className="text-[11px] text-[#B0A898]">{st.sub}</div></div>
            <span className="text-[9.5px] font-bold uppercase tracking-wide text-[#B0A898] bg-[#F2F3F6] px-2 py-0.5 rounded-full">{st.tag}</span>
          </div>
        ))}
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
    supabase.from("projects").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5) as unknown as Promise<{ data: Project[] | null }>,
  ]);

  const isInvestor = profile?.role === "investor";
  const firstName = profile?.full_name?.split(" ")[0] || "vous";
  if (isInvestor) return <InvestorDashboard userId={user!.id} firstName={firstName} />;

  const stats = {
    total: projects?.length || 0,
    submitted: projects?.filter(p => ["submitted", "under_review"].includes(p.status)).length || 0,
    approved: projects?.filter(p => p.status === "approved").length || 0,
    funded: projects?.filter(p => p.status === "funded").length || 0,
  };
  const hour = parseInt(new Date().toLocaleString("fr-FR", { timeZone: "Indian/Antananarivo", hour: "numeric", hour12: false }), 10);
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  // Focus project = the most advanced live dossier, else the most recent.
  const focus = projects?.find(p => ["submitted", "under_review", "approved", "funded"].includes(p.status)) || projects?.[0] || null;
  const readiness = focus ? readinessBreakdown(focus) : null;

  // Deterministic "Next Step" over data we already store.
  let next = { title: "Déposez votre premier dossier", desc: "Présentez votre projet aux investisseurs du réseau, en toute confidentialité.", href: "/dashboard/projects/new", cta: "Commencer" };
  if (focus && focus.status === "draft") {
    next = { title: "Terminez et soumettez votre dossier", desc: "Votre dossier est en brouillon. Finalisez-le pour lancer la revue éditoriale.", href: `/dashboard/projects/${focus.id}/edit`, cta: "Continuer" };
  } else if (focus && readiness && readiness.total < 40) {
    next = { title: "Complétez votre dossier", desc: `${readiness.weakest.label} est la section la plus incomplète de votre dossier de financement.`, href: `/dashboard/projects/${focus.id}/boost`, cta: "Compléter" };
  } else if (focus && readiness && readiness.total < 70) {
    next = { title: `Renforcez : ${readiness.weakest.label}`, desc: "C'est aujourd'hui la partie la plus faible de votre dossier de financement.", href: `/dashboard/projects/${focus.id}/boost`, cta: "Renforcer" };
  } else if (focus && focus.status === "approved") {
    next = { title: "Demandez une mise en relation investisseur", desc: "Votre dossier est prêt. Explorez Investor Matching dans Solutions Capital.", href: "#solutions", cta: "Découvrir" };
  } else if (focus) {
    next = { title: "Votre dossier est prêt", desc: "Il est complet et en attente de validation éditoriale. Notre équipe revient vers vous.", href: `/dashboard/projects/${focus.id}`, cta: "Voir mon dossier" };
  }

  return (
    <div className="p-6 md:p-8 pt-[68px] md:pt-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="text-[#9A9FAF] text-sm font-medium mb-1">{greeting}</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0F1320]">{firstName}</h1>
          <p className="text-[#7A8098] text-sm mt-1.5">{stats.total === 0 ? "Bienvenue sur KAPEX — votre parcours vers le capital commence ici." : "Votre parcours vers le capital."}</p>
        </div>
        <Link href="/dashboard/projects/new" className="flex-shrink-0 btn-primary py-2.5 px-5 text-sm hidden sm:inline-flex">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
          Nouveau dossier
        </Link>
      </div>

      {stats.total === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 bg-[#1F4E79]/8 border border-[#1F4E79]/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-[#1F4E79]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
          </div>
          <h2 className="font-display text-xl font-bold text-[#0F1320] mb-2">Déposez votre premier dossier</h2>
          <p className="text-[#7A8098] mb-7 max-w-md mx-auto text-sm leading-relaxed">Notre formulaire vous guide en 5 étapes pour présenter votre projet aux investisseurs de l&apos;Océan Indien et de l&apos;Afrique.</p>
          <Link href="/dashboard/projects/new" className="btn-primary inline-flex"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>Créer mon premier dossier</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Capital Readiness + Next Step */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {readiness && focus && (
              <div className="lg:col-span-3 card p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#918A7C]">Capital Readiness</div>
                    <div className="flex items-baseline gap-1.5 mt-1"><span className="text-4xl font-bold tracking-tight text-[#0C1F36] tabular-nums">{readiness.total}</span><span className="text-sm text-[#918A7C] font-semibold">/ 100</span></div>
                  </div>
                  <Link href={`/dashboard/projects/${focus.id}/boost`} className="text-[#1F4E79] text-xs font-medium hover:underline flex-shrink-0 mt-1">Voir mon score →</Link>
                </div>
                <div className="h-2 rounded-full bg-[#EDEFF2] overflow-hidden mb-4"><div className="h-full rounded-full bg-gradient-to-r from-[#0C1F36] to-[#1F4E79]" style={{ width: `${readiness.total}%` }} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                  {readiness.categories.map(c => {
                    const ratio = c.score / c.max;
                    return (
                      <div key={c.key}>
                        <div className="flex items-center justify-between text-[12px] mb-1"><span className="text-[#575249]">{c.label}</span><span className="font-semibold text-[#0F1320] tabular-nums">{c.score}/{c.max}</span></div>
                        <div className="h-1.5 rounded-full bg-[#EDEFF2] overflow-hidden"><div className={`h-full rounded-full ${ratio < 0.6 ? "bg-[#1F4E79]" : "bg-[#0C1F36]"}`} style={{ width: `${ratio * 100}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[#918A7C] mt-4 leading-relaxed">{readinessSummary(readiness.total)} Le Capital Readiness est une évaluation interne de complétude du dossier. Il ne constitue ni une recommandation d&apos;investissement, ni une garantie de financement.</p>
              </div>
            )}
            {/* Next Step */}
            <div className={`${readiness ? "lg:col-span-2" : "lg:col-span-5"} rounded-xl p-5 text-white flex flex-col`} style={{ background: "linear-gradient(135deg,#0C1F36,#163C5E)" }}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#AEC2DA]">Votre prochaine étape</div>
              <div className="font-semibold text-base mt-1.5 leading-snug">{next.title}</div>
              <p className="text-[13px] text-[#DCE8F8] mt-2 leading-relaxed flex-1">{next.desc}</p>
              <Link href={next.href} className="mt-4 inline-flex items-center justify-center gap-2 bg-white text-[#0C1F36] font-semibold text-sm rounded-lg py-2.5 px-4 hover:bg-[#EAF1FB] transition-colors self-start">
                {next.cta}<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
              </Link>
            </div>
          </div>

          {/* Capital Journey */}
          <CapitalJourney status={focus?.status || "draft"} readiness={readiness?.total || 0} />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="En cours" value={stats.submitted} />
            <StatCard label="Approuvés" value={stats.approved} />
            <StatCard label="Financés" value={stats.funded} accent />
          </div>

          {/* Solutions Capital */}
          <div id="solutions"><SolutionsCapital userId={user!.id} projectId={focus?.id ?? null} /></div>

          {/* Forum teaser */}
          <div className="rounded-xl overflow-hidden border border-[#1F4E79]/20" style={{ background: "linear-gradient(135deg,#0C1F36,#0A1A2E)" }}>
            <div className="p-5 md:p-6 text-white">
              <div className="flex items-center gap-2 mb-2"><span className="text-[10px] font-bold uppercase tracking-wider text-[#AEC2DA]">KAPEX Forum · Maurice</span><span className="text-[9px] font-bold uppercase tracking-wide bg-white/10 text-[#AEC2DA] px-2 py-0.5 rounded-full">Annuel</span></div>
              <h3 className="font-display text-lg font-bold mb-1.5">Rencontrez les personnes derrière le capital.</h3>
              <p className="text-[#DCE8F8] text-[13px] leading-relaxed max-w-xl">Entreprises et investisseurs sélectionnés se réunissent une fois par an : pitchs en direct, rencontres B2B, meetings investisseurs et tables rondes. Une extension physique de votre parcours digital — sur sélection.</p>
              <div className="flex items-center gap-3 mt-4 text-[12px] text-[#AEC2DA] flex-wrap"><span>Pitchs en direct</span><span>·</span><span>B2B</span><span>·</span><span>Meetings investisseurs</span></div>
            </div>
          </div>

          {/* Recent dossiers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[#0F1320] uppercase tracking-wider">Dossiers récents</h2>
              <Link href="/dashboard/projects" className="text-[#1F4E79] hover:text-[#163C5E] text-sm font-medium transition-colors flex items-center gap-1.5">Voir tout<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg></Link>
            </div>
            <div className="card overflow-hidden">
              {(projects || []).map((p, i) => (
                <Link key={p.id} href={`/dashboard/projects/${p.id}`} className={`flex items-center gap-4 px-5 py-4 hover:bg-[#F8F5F0] transition-colors group ${i < (projects?.length || 0) - 1 ? "border-b border-[#EDE7DE]" : ""}`}>
                  <div className="w-8 h-8 rounded-lg bg-[#1F4E79]/8 border border-[#1F4E79]/15 flex items-center justify-center text-[#1F4E79]/70 group-hover:text-[#1F4E79] flex-shrink-0 transition-colors"><SectorIcon sector={p.sector} /></div>
                  <div className="flex-1 min-w-0"><div className="text-[#0F1320] font-medium text-sm truncate group-hover:text-[#1F4E79] transition-colors">{p.title}</div><div className="text-[#9A9FAF] text-xs mt-0.5">{SECTOR_LABELS[p.sector || ""] || p.sector || "—"} · {formatDate(p.created_at)}</div></div>
                  <div className="flex items-center gap-3 flex-shrink-0">{p.amount_requested && (<span className="text-[#0F1320] text-sm font-semibold hidden sm:block tabular-nums">{formatCurrency(p.amount_requested, p.currency)}</span>)}<StatusPill status={p.status} /><svg className="w-4 h-4 text-[#C8C0B5] group-hover:text-[#1F4E79] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg></div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
