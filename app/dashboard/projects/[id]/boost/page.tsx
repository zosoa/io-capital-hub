"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/types";

// ─── Constants ────────────────────────────────────────────────
const INVESTOR_TYPES = [
  { v: "bank",         l: "Banque / Institution de crédit" },
  { v: "pe_vc_fund",   l: "Fonds PE·VC / Impact" },
  { v: "dfi",          l: "DFI / Fonds de développement" },
  { v: "wealth_family",l: "Family Office / Gestion de patrimoine" },
  { v: "angel",        l: "Business Angel" },
  { v: "grant",        l: "Subvention / Institution publique" },
  { v: "open",         l: "Ouvert à tous les profils" },
];

const MARKET_SIZES = [
  { v: "<1M",     l: "Moins de 1 M$",   sub: "Marché local ou niche" },
  { v: "1_10M",   l: "1 – 10 M$",       sub: "Marché régional" },
  { v: "10_100M", l: "10 – 100 M$",     sub: "Marché national/sous-régional" },
  { v: ">100M",   l: "Plus de 100 M$",  sub: "Marché continental ou global" },
];

const COMPETITION = [
  { v: "pioneer",     l: "Pionnier",            sub: "Peu ou pas de concurrents directs" },
  { v: "few",         l: "Peu de concurrents",  sub: "2 à 5 acteurs sur le marché" },
  { v: "established", l: "Marché établi",        sub: "Marché mature avec acteurs connus" },
  { v: "competitive", l: "Très concurrentiel",   sub: "Nombreux acteurs, forte pression" },
];

const EXIT_HORIZONS = [
  { v: "3_5y",      l: "3 – 5 ans",    sub: "Sortie à moyen terme" },
  { v: "5_10y",     l: "5 – 10 ans",   sub: "Sortie à long terme" },
  { v: "long_term", l: "10 ans +",     sub: "Partenariat durable" },
  { v: "flexible",  l: "Flexible",     sub: "Ouvert à la discussion" },
];

const SDG_OPTIONS = [
  { v: "1",  l: "Pas de pauvreté" },
  { v: "2",  l: "Faim zéro / Agriculture" },
  { v: "3",  l: "Bonne santé" },
  { v: "4",  l: "Éducation de qualité" },
  { v: "5",  l: "Égalité des sexes" },
  { v: "7",  l: "Énergie propre" },
  { v: "8",  l: "Travail décent & croissance" },
  { v: "9",  l: "Industrie & innovation" },
  { v: "11", l: "Villes durables" },
  { v: "13", l: "Action climatique" },
  { v: "17", l: "Partenariats" },
];

const DOCS = [
  { v: "business_plan",    l: "Business plan" },
  { v: "pitch_deck",       l: "Pitch deck (présentation)" },
  { v: "financial_model",  l: "Modèle financier / Projections" },
  { v: "audited_accounts", l: "Comptes audités / certifiés" },
  { v: "annual_accounts",  l: "États financiers annuels" },
  { v: "legal_docs",       l: "Statuts / Documents juridiques" },
  { v: "teaser",           l: "Executive summary / Teaser" },
];

const STAGES_WITH_REVENUE = ["early_revenue", "growth", "expansion", "bridge"];

// ─── Score calculator ──────────────────────────────────────────
function calcScore(p: Partial<Project>): number {
  let s = 0;
  // Team (25)
  if (p.founder_bio)               s += 8;
  if (p.founder_linkedin)          s += 5;
  if (p.founder_experience_years)  s += 6;
  if (p.founder_fulltime !== null) s += 6;
  // Market (25)
  if (p.investor_type_sought?.length) s += 8;
  if (p.market_size)               s += 7;
  if (p.competition_level)         s += 5;
  if (p.competitive_advantage)     s += 5;
  // Financials (25)
  if (p.revenue_y1 || p.monthly_burn_rate) s += 15;
  if (p.ebitda_margin !== null && p.ebitda_margin !== undefined) s += 5;
  if (p.growth_rate_12m !== null && p.growth_rate_12m !== undefined) s += 5;
  // ESG (15)
  if (p.esg_women_leadership !== null) s += 4;
  if (p.esg_board_exists !== null)     s += 4;
  if (p.esg_audited)                   s += 4;
  if (p.esg_sdgs?.length)             s += 3;
  // Documents (10)
  if (p.documents_available?.length)  s += 10;
  return Math.min(s, 100);
}

// ─── Sub-components ───────────────────────────────────────────
function SectionCard({ title, icon, score, maxScore, children, saving, lastSaved }: {
  title: string; icon: React.ReactNode; score: number; maxScore: number;
  children: React.ReactNode; saving?: boolean; lastSaved?: boolean;
}) {
  const pct  = Math.round((score / maxScore) * 100);
  const done = pct >= 80;
  return (
    <div className="card overflow-hidden">
      <div className={`px-6 py-4 border-b flex items-center justify-between gap-3 ${done ? "bg-green-50 border-green-100" : "bg-[#FAF7F3] border-[#EDE7DE]"}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${done ? "bg-green-100 text-green-600" : "bg-[#B8913A]/10 text-[#B8913A]"}`}>
            {done ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
            ) : icon}
          </div>
          <span className={`font-bold text-sm ${done ? "text-green-800" : "text-[#0F1320]"}`}>{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {saving    && <span className="text-[10px] text-[#B8913A] animate-pulse">Sauvegarde…</span>}
          {!saving && lastSaved && <span className="text-[10px] text-green-600 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
            Sauvegardé
          </span>}
          <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${done ? "bg-green-100 text-green-700" : pct > 0 ? "bg-[#B8913A]/10 text-[#B8913A]" : "bg-[#F0EEE9] text-[#B0A898]"}`}>
            {pct}%
          </div>
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-[#9A9FAF] mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

function MultiChip({ options, selected, onChange }: {
  options: { v: string; l: string; sub?: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(v: string) {
    onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  }
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {options.map(o => {
        const on = selected.includes(o.v);
        return (
          <button key={o.v} type="button" onClick={() => toggle(o.v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
              on ? "border-[#B8913A] bg-[#B8913A]/8 text-[#0F1320]" : "border-[#DDD8D0] text-[#7A8098] hover:border-[#B8913A]/40"
            }`}>
            {on && <svg className="w-3 h-3 text-[#B8913A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
            {o.l}
          </button>
        );
      })}
    </div>
  );
}

function RadioCards({ options, value, onChange, cols = 2 }: {
  options: { v: string; l: string; sub?: string }[];
  value: string;
  onChange: (v: string) => void;
  cols?: number;
}) {
  return (
    <div className={`grid gap-2 mt-1 grid-cols-${cols}`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {options.map(o => (
        <button key={o.v} type="button" onClick={() => onChange(o.v)}
          className={`text-left p-3 rounded-xl border-2 transition-all ${
            value === o.v ? "border-[#B8913A] bg-[#B8913A]/6" : "border-[#E8E2D9] hover:border-[#B8913A]/30"
          }`}>
          <div className={`text-sm font-semibold ${value === o.v ? "text-[#0F1320]" : "text-[#5A6280]"}`}>{o.l}</div>
          {o.sub && <div className="text-[11px] text-[#9A9FAF] mt-0.5 leading-snug">{o.sub}</div>}
        </button>
      ))}
    </div>
  );
}

function ToggleField({ checked, onChange, labelOn, labelOff }: {
  checked: boolean | null; onChange: (v: boolean) => void; labelOn: string; labelOff: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3.5 bg-[#FAF7F3] rounded-xl border border-[#E8E2D9] cursor-pointer"
      onClick={() => onChange(!checked)}>
      <div className={`w-10 h-5 rounded-full transition-all flex items-center px-0.5 flex-shrink-0 ${checked ? "bg-[#B8913A]" : "bg-[#DDD8D0]"}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}/>
      </div>
      <span className="text-[#0F1320] text-sm select-none">{checked ? labelOn : labelOff}</span>
    </div>
  );
}

// ─── Score breakdown panel ────────────────────────────────────
function ScoreBreakdown(props: {
  founderBio: string; founderLinkedin: string; founderExp: string; founderFulltime: boolean | null;
  investorTypes: string[]; marketSize: string; competition: string; advantage: string;
  revY1: string; burnRate: string; ebitda: string; growth: string;
  womenLead: boolean | null; board: boolean | null; audited: string; sdgs: string[];
  docs: string[]; hasRevenue: boolean;
}) {
  const [open, setOpen] = useState(false);

  const categories = [
    {
      label: "Équipe & fondateur",
      earned: [props.founderBio, props.founderLinkedin, props.founderExp, props.founderFulltime !== null].filter(Boolean).length,
      max: 4,
      pts: 25,
      items: [
        { label: "Biographie du fondateur",         pts: 8,  done: !!props.founderBio },
        { label: "Profil LinkedIn",                  pts: 5,  done: !!props.founderLinkedin },
        { label: "Années d'expérience",              pts: 6,  done: !!props.founderExp },
        { label: "Engagement temps plein",           pts: 6,  done: props.founderFulltime !== null },
      ],
    },
    {
      label: "Marché & investisseur",
      earned: [props.investorTypes.length > 0, props.marketSize, props.competition, props.advantage].filter(Boolean).length,
      max: 4,
      pts: 25,
      items: [
        { label: "Type(s) d'investisseur ciblé(s)",  pts: 8,  done: props.investorTypes.length > 0 },
        { label: "Taille du marché cible",           pts: 7,  done: !!props.marketSize },
        { label: "Niveau de concurrence",            pts: 5,  done: !!props.competition },
        { label: "Avantage concurrentiel",           pts: 5,  done: !!props.advantage },
      ],
    },
    {
      label: "Chiffres financiers",
      earned: props.hasRevenue
        ? [props.revY1, props.ebitda, props.growth].filter(v => v !== "").length
        : [props.burnRate].filter(Boolean).length,
      max: props.hasRevenue ? 3 : 1,
      pts: 25,
      items: props.hasRevenue
        ? [
            { label: "Chiffre d'affaires (N-1)",       pts: 15, done: !!props.revY1 },
            { label: "Marge EBITDA estimée",            pts: 5,  done: props.ebitda !== "" },
            { label: "Taux de croissance 12 mois",      pts: 5,  done: props.growth !== "" },
          ]
        : [
            { label: "Budget mensuel (burn rate)",      pts: 15, done: !!props.burnRate },
          ],
    },
    {
      label: "Impact & gouvernance",
      earned: [props.womenLead !== null, props.board !== null, props.audited, props.sdgs.length > 0].filter(Boolean).length,
      max: 4,
      pts: 15,
      items: [
        { label: "Femmes en direction",               pts: 4,  done: props.womenLead !== null },
        { label: "Conseil / comité consultatif",      pts: 4,  done: props.board !== null },
        { label: "Comptes audités ou vérifiés",       pts: 4,  done: !!props.audited },
        { label: "Objectifs ODD alignés",             pts: 3,  done: props.sdgs.length > 0 },
      ],
    },
    {
      label: "Documents disponibles",
      earned: props.docs.length > 0 ? 1 : 0,
      max: 1,
      pts: 10,
      items: [
        { label: "Au moins un document disponible",   pts: 10, done: props.docs.length > 0 },
      ],
    },
  ];

  const totalEarned = calcScore({
    founder_bio: props.founderBio, founder_linkedin: props.founderLinkedin,
    founder_experience_years: props.founderExp ? +props.founderExp : undefined,
    founder_fulltime: props.founderFulltime ?? undefined,
    investor_type_sought: props.investorTypes, market_size: props.marketSize,
    competition_level: props.competition, competitive_advantage: props.advantage,
    revenue_y1: props.revY1 ? +props.revY1 : undefined,
    monthly_burn_rate: props.burnRate ? +props.burnRate : undefined,
    ebitda_margin: props.ebitda !== "" ? +props.ebitda : undefined,
    growth_rate_12m: props.growth !== "" ? +props.growth : undefined,
    esg_women_leadership: props.womenLead ?? undefined, esg_board_exists: props.board ?? undefined,
    esg_audited: props.audited, esg_sdgs: props.sdgs, documents_available: props.docs,
  });

  const missing = categories.flatMap(c => c.items.filter(i => !i.done).map(i => ({ ...i, category: c.label })));

  return (
    <div className="card overflow-hidden mb-5">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-6 py-4 flex items-center justify-between gap-3 bg-[#FAF7F3] border-b border-[#EDE7DE] hover:bg-[#F5F0E8] transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#B8913A]/10 text-[#B8913A] flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
            </svg>
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-[#0F1320]">Détail du score — comment gagner des points</div>
            <div className="text-[11px] text-[#9A9FAF] mt-0.5">
              {totalEarned}/100 pts · {missing.length > 0 ? `${missing.length} élément${missing.length > 1 ? "s" : ""} manquant${missing.length > 1 ? "s" : ""}` : "Dossier complet ✓"}
            </div>
          </div>
        </div>
        <svg className={`w-4 h-4 text-[#9A9FAF] flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
        </svg>
      </button>

      {open && (
        <div className="p-6 space-y-5">
          {/* Category breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map(cat => {
              const earnedPts = Math.round((cat.earned / cat.max) * cat.pts);
              const pct = Math.round((cat.earned / cat.max) * 100);
              return (
                <div key={cat.label} className="p-4 rounded-xl border border-[#E8E2D9] bg-[#FAF7F3]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#0F1320]">{cat.label}</span>
                    <span className={`text-xs font-bold tabular-nums ${pct === 100 ? "text-green-600" : "text-[#B8913A]"}`}>
                      {earnedPts}/{cat.pts} pts
                    </span>
                  </div>
                  <div className="h-1 bg-[#E8E2D9] rounded-full overflow-hidden mb-3">
                    <div className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-green-500" : "bg-[#B8913A]"}`} style={{ width: `${pct}%` }}/>
                  </div>
                  <ul className="space-y-1">
                    {cat.items.map(item => (
                      <li key={item.label} className="flex items-center gap-2 text-[11px]">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? "bg-green-100" : "bg-[#E8E2D9]"}`}>
                          {item.done ? (
                            <svg className="w-2 h-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                            </svg>
                          ) : (
                            <div className="w-1 h-1 rounded-full bg-[#C8C0B5]"/>
                          )}
                        </div>
                        <span className={item.done ? "text-[#5A6280] line-through" : "text-[#7A8098]"}>{item.label}</span>
                        <span className={`ml-auto font-semibold tabular-nums flex-shrink-0 ${item.done ? "text-green-600" : "text-[#B8913A]"}`}>
                          +{item.pts}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Next steps hint */}
          {missing.length > 0 && (
            <div className="p-4 rounded-xl bg-[#B8913A]/6 border border-[#B8913A]/20">
              <div className="text-xs font-bold text-[#B8913A] uppercase tracking-wider mb-2">
                Pour gagner le plus de points rapidement
              </div>
              <ul className="space-y-1.5">
                {missing.slice(0, 3).map(item => (
                  <li key={item.label} className="flex items-center gap-2 text-xs text-[#5A6280]">
                    <svg className="w-3 h-3 text-[#B8913A] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                    </svg>
                    <span>{item.label}</span>
                    <span className="ml-auto font-semibold text-[#B8913A]">+{item.pts} pts</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function BoostPage() {
  const params    = useParams<{ id: string }>();
  const router    = useRouter();
  const projectId = params.id;

  const [project, setProject]   = useState<Project | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving,    setSaving]    = useState<string | null>(null); // which section is saving
  const [lastSaved, setLastSaved] = useState<string | null>(null); // which section last saved OK
  const [saveError, setSaveError] = useState<string | null>(null);

  // Section state mirrors DB fields
  // ── Team ──
  const [founderBio,     setFounderBio]     = useState("");
  const [founderLinkedin,setFounderLinkedin]= useState("");
  const [founderExp,     setFounderExp]     = useState("");
  const [founderFulltime,setFounderFulltime]= useState<boolean | null>(null);
  const [keyMembers,     setKeyMembers]     = useState("");

  // ── Market ──
  const [investorTypes, setInvestorTypes]  = useState<string[]>([]);
  const [marketSize,    setMarketSize]     = useState("");
  const [competition,   setCompetition]    = useState("");
  const [advantage,     setAdvantage]      = useState("");
  const [equityStake,   setEquityStake]    = useState("");
  const [valuation,     setValuation]      = useState("");
  const [exitHorizon,   setExitHorizon]    = useState("");

  // ── Financials ──
  const [revY1,       setRevY1]      = useState("");
  const [revY2,       setRevY2]      = useState("");
  const [revY3,       setRevY3]      = useState("");
  const [ebitda,      setEbitda]     = useState("");
  const [growth,      setGrowth]     = useState("");
  const [burnRate,    setBurnRate]   = useState("");

  // ── ESG ──
  const [womenLead,   setWomenLead]  = useState<boolean | null>(null);
  const [womenPct,    setWomenPct]   = useState("");
  const [board,       setBoard]      = useState<boolean | null>(null);
  const [audited,     setAudited]    = useState("");
  const [envPolicy,   setEnvPolicy]  = useState<boolean | null>(null);
  const [sdgs,        setSdgs]       = useState<string[]>([]);

  // ── Logo ──
  const [logoUrl,       setLogoUrl]       = useState("");
  const [logoUploading, setLogoUploading] = useState(false);

  // ── Documents ──
  const [docs, setDocs] = useState<string[]>([]);

  // Load project
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("projects").select("*").eq("id", projectId).single();
      if (data) {
        const p = data as Project;
        setProject(p);
        // Hydrate state
        setFounderBio(p.founder_bio || "");
        setFounderLinkedin(p.founder_linkedin || "");
        setFounderExp(p.founder_experience_years?.toString() || "");
        setFounderFulltime(p.founder_fulltime ?? null);
        setKeyMembers(p.team_key_members?.toString() || "");
        setInvestorTypes(p.investor_type_sought || []);
        setMarketSize(p.market_size || "");
        setCompetition(p.competition_level || "");
        setAdvantage(p.competitive_advantage || "");
        setEquityStake(p.equity_stake_offered?.toString() || "");
        setValuation(p.pre_money_valuation?.toString() || "");
        setExitHorizon(p.exit_horizon || "");
        setRevY1(p.revenue_y1?.toString() || "");
        setRevY2(p.revenue_y2?.toString() || "");
        setRevY3(p.revenue_y3?.toString() || "");
        setEbitda(p.ebitda_margin?.toString() || "");
        setGrowth(p.growth_rate_12m?.toString() || "");
        setBurnRate(p.monthly_burn_rate?.toString() || "");
        setWomenLead(p.esg_women_leadership ?? null);
        setWomenPct(p.esg_women_percentage?.toString() || "");
        setBoard(p.esg_board_exists ?? null);
        setAudited(p.esg_audited || "");
        setEnvPolicy(p.esg_environmental ?? null);
        setSdgs(p.esg_sdgs || []);
        setDocs(p.documents_available || []);
        setLogoUrl(p.project_logo_url || "");
      }
      setLoading(false);
    }
    load();
  }, [projectId]);

  async function uploadLogo(file: File) {
    if (!file.type.startsWith("image/")) return;
    // S-3: verify file bytes (not just MIME header) before hitting storage.
    try {
      const { assertIsImage } = await import("@/lib/imageMime");
      await assertIsImage(file, ["jpeg", "png", "webp", "svg"]);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Fichier invalide.");
      return;
    }
    // Cap upload size at 5 MB — bucket allows more but the UI never needs it.
    if (file.size > 5 * 1024 * 1024) {
      setSaveError("Le fichier dépasse 5 Mo.");
      return;
    }
    setLogoUploading(true);
    setSaveError(null);
    const supabase = createClient();
    const ext  = file.name.split(".").pop();
    const path = `${projectId}/logo.${ext}`;
    const { error: upErr } = await supabase.storage.from("project-logos").upload(path, file, { upsert: true });
    if (upErr) {
      setSaveError("Erreur lors de l'envoi du logo : " + upErr.message);
      setLogoUploading(false);
      return;
    }
    // Get the clean public URL (no cache buster in DB — add it only for display)
    const { data: { publicUrl } } = supabase.storage.from("project-logos").getPublicUrl(path);
    const { error: dbErr } = await supabase.from("projects").update({ project_logo_url: publicUrl }).eq("id", projectId);
    if (dbErr) {
      setSaveError("Logo envoyé mais non sauvegardé : " + dbErr.message);
    } else {
      // Cache-bust only for the local img src so the browser reloads the new file
      const displayUrl = `${publicUrl}?t=${Date.now()}`;
      setLogoUrl(displayUrl);
      setProject(p => p ? { ...p, project_logo_url: publicUrl } : p);
    }
    setLogoUploading(false);
  }

  const save = useCallback(async (section: string, patch: Record<string, unknown>) => {
    setSaving(section);
    setSaveError(null);
    const supabase = createClient();
    // Recalculate boost score from merged state
    const merged = { ...project, ...patch };
    const score  = calcScore(merged as Partial<Project>);
    const { error } = await supabase.from("projects").update({ ...patch, boost_score: score }).eq("id", projectId);
    if (error) {
      setSaveError("Erreur de sauvegarde : " + error.message);
    } else {
      setProject(p => p ? { ...p, ...patch, boost_score: score } as Project : p);
      setLastSaved(section);
      // Clear the "Sauvegardé" badge after 2 seconds
      setTimeout(() => setLastSaved(s => s === section ? null : s), 2000);
    }
    setSaving(null);
  }, [project, projectId]);

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="w-6 h-6 border-2 border-[#B8913A]/30 border-t-[#B8913A] rounded-full animate-spin"/>
    </div>
  );
  if (!project) return null;

  const hasRevenue  = STAGES_WITH_REVENUE.includes(project.stage || "");
  const isEquity    = project.funding_type === "equity";
  const globalScore = calcScore({
    founder_bio: founderBio, founder_linkedin: founderLinkedin, founder_experience_years: founderExp ? +founderExp : undefined,
    founder_fulltime: founderFulltime ?? undefined,
    investor_type_sought: investorTypes, market_size: marketSize, competition_level: competition, competitive_advantage: advantage,
    revenue_y1: revY1 ? +revY1 : undefined, monthly_burn_rate: burnRate ? +burnRate : undefined,
    ebitda_margin: ebitda !== "" ? +ebitda : undefined, growth_rate_12m: growth !== "" ? +growth : undefined,
    esg_women_leadership: womenLead ?? undefined, esg_board_exists: board ?? undefined, esg_audited: audited,
    esg_sdgs: sdgs, documents_available: docs,
  });

  return (
    <div className="p-6 md:p-8 pt-[68px] md:pt-8 max-w-3xl mx-auto">

      {/* Save error banner */}
      {saveError && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374l7.02-12.124c.866-1.5 3.032-1.5 3.898 0l6.588 11.375z"/>
          </svg>
          <div className="flex-1">
            <p className="text-red-700 text-sm">{saveError}</p>
          </div>
          <button onClick={() => setSaveError(null)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href={`/dashboard/projects/${projectId}`}
          className="text-[#9A9FAF] hover:text-[#B8913A] transition-colors flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          {project.title}
        </Link>
        <span className="text-[#C8C0B5]">/</span>
        <span className="text-[#0F1320] font-medium">Booster le dossier</span>
      </div>

      {/* Header with global score */}
      <div className="card p-6 mb-7 flex items-center gap-5">
        {/* Score ring */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#EDE7DE" strokeWidth="3"/>
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#B8913A" strokeWidth="3"
              strokeDasharray={`${(globalScore / 100) * 97.4} 97.4`}
              strokeLinecap="round" className="transition-all duration-700"/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-[#0F1320]">{globalScore}</span>
            <span className="text-[9px] text-[#9A9FAF] uppercase tracking-wide">/ 100</span>
          </div>
        </div>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold text-[#0F1320] mb-1">Boostez votre visibilité</h1>
          <p className="text-[#7A8098] text-sm leading-relaxed">
            Ces informations sont <strong className="text-[#0F1320]">100 % optionnelles</strong> — plus votre dossier est complet, plus il attire les bons investisseurs.
            Chaque section se sauvegarde automatiquement.
          </p>
          <div className="mt-3 h-1.5 bg-[#EDE7DE] rounded-full overflow-hidden">
            <div className="h-full bg-[#B8913A] rounded-full transition-all duration-700" style={{ width: `${globalScore}%` }}/>
          </div>
        </div>
      </div>

      {/* ── Score breakdown ── */}
      <ScoreBreakdown
        founderBio={founderBio}
        founderLinkedin={founderLinkedin}
        founderExp={founderExp}
        founderFulltime={founderFulltime}
        investorTypes={investorTypes}
        marketSize={marketSize}
        competition={competition}
        advantage={advantage}
        revY1={revY1}
        burnRate={burnRate}
        ebitda={ebitda}
        growth={growth}
        womenLead={womenLead}
        board={board}
        audited={audited}
        sdgs={sdgs}
        docs={docs}
        hasRevenue={hasRevenue}
      />

      <div className="space-y-5">

        {/* ── Logo du projet ── */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-[#EDE7DE] bg-[#FAF7F3] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#B8913A]/10 text-[#B8913A] flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
                </svg>
              </div>
              <span className="text-[#0F1320] font-bold text-sm">Logo du projet</span>
            </div>
            {logoUrl && (
              <span className="text-[11px] bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full font-semibold">Ajouté ✓</span>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-center gap-6">
              {/* Preview */}
              <div className="w-20 h-20 rounded-2xl border-2 border-[#E8E2D9] bg-[#FAF7F3] flex items-center justify-center overflow-hidden flex-shrink-0">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover"/>
                ) : (
                  <span className="text-[#B8913A] font-bold text-2xl">{project?.title?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              {/* Upload */}
              <div className="flex-1">
                <p className="text-[#5A6280] text-sm mb-3 leading-relaxed">
                  Un logo professionnel renforce la crédibilité de votre dossier auprès des investisseurs. Format JPG, PNG ou SVG — max 2 Mo.
                </p>
                <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
                  logoUploading ? "opacity-50 cursor-not-allowed" : "border-[#B8913A]/30 text-[#B8913A] hover:bg-[#B8913A]/5"
                }`}>
                  {logoUploading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-[#B8913A]/30 border-t-[#B8913A] rounded-full animate-spin"/>
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                      </svg>
                      {logoUrl ? "Changer le logo" : "Téléverser un logo"}
                    </>
                  )}
                  <input type="file" accept="image/*" className="sr-only" disabled={logoUploading}
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f); e.target.value = ""; }}/>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 1 : Votre équipe ── */}
        <SectionCard
          title="Votre équipe & vous"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>}
          score={[founderBio, founderLinkedin, founderExp, founderFulltime !== null].filter(Boolean).length}
          maxScore={4}
          saving={saving === "team"}
          lastSaved={lastSaved === "team"}
        >
          <Field label="Qui êtes-vous ? (2-4 lignes)" hint="Votre parcours, ce qui vous a amené à ce projet, pourquoi vous êtes la bonne personne pour le mener.">
            <textarea value={founderBio} onChange={e => setFounderBio(e.target.value)}
              onBlur={() => save("team", { founder_bio: founderBio, founder_linkedin: founderLinkedin, founder_experience_years: founderExp ? +founderExp : null, founder_fulltime: founderFulltime, team_key_members: keyMembers ? +keyMembers : null })}
              className="input resize-none" rows={3}
              placeholder="Ex : 12 ans dans l'agribusiness à Madagascar, ancien directeur technique chez X, je lance ce projet pour résoudre un problème que j'ai vécu moi-même…"/>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Années d'expérience dans ce secteur">
              <input type="number" value={founderExp} onChange={e => setFounderExp(e.target.value)}
                onBlur={() => save("team", { founder_experience_years: founderExp ? +founderExp : null })}
                className="input" placeholder="Ex : 8" min={0}/>
            </Field>
            <Field label="Nombre de membres clés de l'équipe">
              <input type="number" value={keyMembers} onChange={e => setKeyMembers(e.target.value)}
                onBlur={() => save("team", { team_key_members: keyMembers ? +keyMembers : null })}
                className="input" placeholder="Ex : 3" min={0}/>
            </Field>
          </div>

          <Field label="Êtes-vous à temps plein sur ce projet ?">
            <ToggleField checked={founderFulltime}
              onChange={v => { setFounderFulltime(v); save("team", { founder_fulltime: v }); }}
              labelOn="Oui — je suis dédié à 100 % à ce projet"
              labelOff="Non — je mène ce projet en parallèle d'une autre activité"/>
          </Field>

          <Field label="LinkedIn (URL)" hint="Permet aux investisseurs de vérifier votre parcours rapidement">
            <input type="url" value={founderLinkedin} onChange={e => setFounderLinkedin(e.target.value)}
              onBlur={() => save("team", { founder_linkedin: founderLinkedin })}
              className="input" placeholder="https://linkedin.com/in/votre-profil"/>
          </Field>
        </SectionCard>

        {/* ── SECTION 2 : Votre marché & investisseur cible ── */}
        <SectionCard
          title="Votre marché & investisseur cible"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5"/></svg>}
          score={[investorTypes.length > 0, marketSize, competition, advantage].filter(Boolean).length}
          maxScore={4}
          saving={saving === "market"}
          lastSaved={lastSaved === "market"}
        >
          <Field label="Quel type de partenaire financier correspond à votre projet ?" hint="Sélectionnez un ou plusieurs profils — cela nous aide à orienter votre dossier vers les bons interlocuteurs">
            <MultiChip options={INVESTOR_TYPES} selected={investorTypes}
              onChange={v => { setInvestorTypes(v); save("market", { investor_type_sought: v }); }}/>
          </Field>

          <Field label="Quelle est la taille de votre marché cible ?" hint="Une estimation large suffit — pas besoin d'une étude de marché">
            <RadioCards options={MARKET_SIZES} value={marketSize} cols={2}
              onChange={v => { setMarketSize(v); save("market", { market_size: v }); }}/>
          </Field>

          <Field label="Comment évaluez-vous la concurrence sur votre marché ?">
            <RadioCards options={COMPETITION} value={competition} cols={2}
              onChange={v => { setCompetition(v); save("market", { competition_level: v }); }}/>
          </Field>

          <Field label="Votre avantage distinctif en une phrase" hint="Ce que vos concurrents ne peuvent pas facilement reproduire">
            <input type="text" value={advantage} onChange={e => setAdvantage(e.target.value)}
              onBlur={() => save("market", { competitive_advantage: advantage })}
              className="input" placeholder="Ex : Seul acteur avec un agrément local + réseau de 200 distributeurs partenaires"/>
          </Field>

          {isEquity && (
            <div className="pt-2 border-t border-[#EDE7DE]">
              <div className="text-xs font-bold text-[#B8913A] uppercase tracking-wider mb-4">
                Conditions proposées à l&apos;investisseur en capital
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="% du capital que vous proposez" hint="Part ouverte à l'investisseur">
                  <div className="relative">
                    <input type="number" value={equityStake} onChange={e => setEquityStake(e.target.value)}
                      onBlur={() => save("market", { equity_stake_offered: equityStake ? +equityStake : null })}
                      className="input pr-8" placeholder="Ex : 25" min={1} max={99}/>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9FAF] text-sm">%</span>
                  </div>
                </Field>
                <Field label="Valeur estimée de votre entreprise aujourd'hui" hint="Avant l'entrée de l'investisseur">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9FAF] text-sm">$</span>
                    <input type="number" value={valuation} onChange={e => setValuation(e.target.value)}
                      onBlur={() => save("market", { pre_money_valuation: valuation ? +valuation : null })}
                      className="input pl-7" placeholder="Ex : 1 000 000"/>
                  </div>
                </Field>
              </div>
              <Field label="Dans combien de temps envisagez-vous la sortie de l'investisseur ?">
                <RadioCards options={EXIT_HORIZONS} value={exitHorizon} cols={2}
                  onChange={v => { setExitHorizon(v); save("market", { exit_horizon: v }); }}/>
              </Field>
            </div>
          )}
        </SectionCard>

        {/* ── SECTION 3 : Chiffres clés ── */}
        <SectionCard
          title={hasRevenue ? "Vos chiffres clés" : "Vos indicateurs de démarrage"}
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"/></svg>}
          score={hasRevenue
            ? [revY1, ebitda, growth].filter(v => v !== "").length
            : [burnRate].filter(Boolean).length}
          maxScore={hasRevenue ? 3 : 1}
          saving={saving === "finance"}
          lastSaved={lastSaved === "finance"}
        >
          <div className="p-3.5 bg-[#FAF7F3] rounded-xl border border-[#E8E2D9] text-xs text-[#7A8098] leading-relaxed mb-2">
            🔒 Ces données sont strictement confidentielles et ne sont partagées qu&apos;avec les investisseurs qui signent un accord de confidentialité.
          </div>

          {hasRevenue ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "CA année N-2", val: revY2, set: setRevY2 },
                  { label: "CA année N-1", val: revY1, set: setRevY1 },
                  { label: "CA année en cours (estimé)", val: revY3, set: setRevY3 },
                ].map(({ label, val, set }) => (
                  <Field key={label} label={label}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9FAF] text-xs">$</span>
                      <input type="number" value={val} onChange={e => set(e.target.value)}
                        onBlur={() => save("finance", { revenue_y1: revY1 ? +revY1 : null, revenue_y2: revY2 ? +revY2 : null, revenue_y3: revY3 ? +revY3 : null, ebitda_margin: ebitda !== "" ? +ebitda : null, growth_rate_12m: growth !== "" ? +growth : null })}
                        className="input pl-6 text-sm" placeholder="0"/>
                    </div>
                  </Field>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Marge opérationnelle (EBITDA) estimée" hint="En % du chiffre d'affaires — ex : 15 pour 15 %">
                  <div className="relative">
                    <input type="number" value={ebitda} onChange={e => setEbitda(e.target.value)}
                      onBlur={() => save("finance", { ebitda_margin: ebitda !== "" ? +ebitda : null })}
                      className="input pr-8" placeholder="Ex : 15" min={-100} max={100}/>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9FAF] text-sm">%</span>
                  </div>
                </Field>
                <Field label="Croissance sur les 12 derniers mois" hint="En % — ex : 30 pour +30 %">
                  <div className="relative">
                    <input type="number" value={growth} onChange={e => setGrowth(e.target.value)}
                      onBlur={() => save("finance", { growth_rate_12m: growth !== "" ? +growth : null })}
                      className="input pr-8" placeholder="Ex : 30" min={-100}/>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9FAF] text-sm">%</span>
                  </div>
                </Field>
              </div>
            </>
          ) : (
            <Field label="Combien dépensez-vous par mois pour faire avancer le projet ?" hint="Estimation de votre budget mensuel de fonctionnement (salaires, développement, loyer…)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9FAF] text-sm">$</span>
                <input type="number" value={burnRate} onChange={e => setBurnRate(e.target.value)}
                  onBlur={() => save("finance", { monthly_burn_rate: burnRate ? +burnRate : null })}
                  className="input pl-7" placeholder="Ex : 5 000"/>
              </div>
            </Field>
          )}
        </SectionCard>

        {/* ── SECTION 4 : Impact & gouvernance ── */}
        <SectionCard
          title="Impact & gouvernance"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3"/></svg>}
          score={[womenLead !== null, board !== null, audited, sdgs.length > 0].filter(Boolean).length}
          maxScore={4}
          saving={saving === "esg"}
          lastSaved={lastSaved === "esg"}
        >
          <p className="text-xs text-[#7A8098] leading-relaxed -mt-1 mb-1">
            Les investisseurs à impact (fonds ESG, DFI) accordent une importance particulière à ces critères. Répondez en toute honnêteté.
          </p>

          <Field label="Y a-t-il des femmes dans la direction ou parmi les fondateurs ?">
            <ToggleField checked={womenLead}
              onChange={v => { setWomenLead(v); save("esg", { esg_women_leadership: v }); }}
              labelOn="Oui — des femmes occupent des postes de direction"
              labelOff="Non — pas encore"/>
          </Field>

          {womenLead && (
            <Field label="Quelle proportion de femmes dans l'équipe de direction ?" hint="Estimation en %">
              <div className="relative">
                <input type="number" value={womenPct} onChange={e => setWomenPct(e.target.value)}
                  onBlur={() => save("esg", { esg_women_percentage: womenPct ? +womenPct : null })}
                  className="input pr-8" placeholder="Ex : 40" min={0} max={100}/>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9FAF] text-sm">%</span>
              </div>
            </Field>
          )}

          <Field label="Avez-vous un conseil d'administration ou un comité consultatif ?">
            <ToggleField checked={board}
              onChange={v => { setBoard(v); save("esg", { esg_board_exists: v }); }}
              labelOn="Oui — un conseil ou comité est constitué"
              labelOff="Non — pas encore de gouvernance formelle"/>
          </Field>

          <Field label="Vos comptes sont-ils audités ou vérifiés par un expert-comptable ?">
            <RadioCards cols={3}
              options={[
                { v: "yes",         l: "Oui",         sub: "Comptes certifiés" },
                { v: "in_progress", l: "En cours",     sub: "Audit en cours" },
                { v: "no",          l: "Pas encore",   sub: "Comptabilité interne" },
              ]}
              value={audited}
              onChange={v => { setAudited(v); save("esg", { esg_audited: v }); }}/>
          </Field>

          <Field label="Avez-vous une politique ou des pratiques environnementales dans votre activité ?">
            <ToggleField checked={envPolicy}
              onChange={v => { setEnvPolicy(v); save("esg", { esg_environmental: v }); }}
              labelOn="Oui — notre activité intègre des pratiques éco-responsables"
              labelOff="Non — pas formalisé pour l'instant"/>
          </Field>

          <Field label="Objectifs de développement durable (ODD) auxquels votre projet contribue" hint="Sélectionnez ceux qui correspondent naturellement à votre activité">
            <MultiChip options={SDG_OPTIONS} selected={sdgs}
              onChange={v => { setSdgs(v); save("esg", { esg_sdgs: v }); }}/>
          </Field>
        </SectionCard>

        {/* ── SECTION 5 : Documents disponibles ── */}
        <SectionCard
          title="Documents disponibles"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>}
          score={docs.length > 0 ? 1 : 0}
          maxScore={1}
          saving={saving === "docs"}
          lastSaved={lastSaved === "docs"}
        >
          <p className="text-xs text-[#7A8098] leading-relaxed -mt-1 mb-2">
            Cochez les documents que vous pouvez partager avec un investisseur (sur demande, sous accord de confidentialité). Cela augmente significativement l&apos;intérêt des investisseurs.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DOCS.map(d => {
              const on = docs.includes(d.v);
              return (
                <button key={d.v} type="button"
                  onClick={() => {
                    const next = on ? docs.filter(x => x !== d.v) : [...docs, d.v];
                    setDocs(next);
                    save("docs", { documents_available: next });
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    on ? "border-[#B8913A] bg-[#B8913A]/6" : "border-[#E8E2D9] hover:border-[#B8913A]/30"
                  }`}>
                  <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${on ? "border-[#B8913A] bg-[#B8913A]" : "border-[#C8C0B5]"}`}>
                    {on && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
                  </div>
                  <span className={`text-sm ${on ? "text-[#0F1320] font-medium" : "text-[#5A6280]"}`}>{d.l}</span>
                </button>
              );
            })}
          </div>
        </SectionCard>

      </div>

      {/* Back CTA */}
      <div className="mt-8 flex justify-center">
        <Link href={`/dashboard/projects/${projectId}`} className="btn-primary py-3 px-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
          </svg>
          Terminer — voir mon dossier
        </Link>
      </div>
    </div>
  );
}
