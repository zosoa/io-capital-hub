"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import CardSelectWithOther from "@/components/ui/CardSelectWithOther";
import type { Project, ProjectFormData } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { friendlyError } from "@/lib/friendlyError";

// ─── Step Icons ───────────────────────────────────────────────
const StepIcons: React.ReactNode[] = [
  <svg key="1" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
  </svg>,
  <svg key="2" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>,
  <svg key="3" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>
  </svg>,
  <svg key="4" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
  </svg>,
  <svg key="5" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/>
  </svg>,
];

const STEPS = [
  { n: 1, label: "Votre dossier",  desc: "Identité & secteur" },
  { n: 2, label: "Financement",    desc: "Besoin & structure" },
  { n: 3, label: "Organisation",   desc: "Votre entreprise" },
  { n: 4, label: "Vos atouts",     desc: "Forces & garanties" },
  { n: 5, label: "Impact",         desc: "Impact & soumission" },
];

const SECTORS = [
  { v:"energy",            l:"Énergie" },
  { v:"agriculture",       l:"Agriculture" },
  { v:"tech",              l:"Technologie" },
  { v:"real_estate",       l:"Immobilier" },
  { v:"infrastructure",    l:"Infrastructure" },
  { v:"manufacturing",     l:"Industrie" },
  { v:"tourism",           l:"Tourisme" },
  { v:"health",            l:"Santé" },
  { v:"education",         l:"Éducation" },
  { v:"financial_services",l:"Services financiers" },
  { v:"other",             l:"Autre" },
];

const FUNDING_TYPES = [
  {
    v: "debt",
    l: "Emprunt / Prêt",
    tag: "Vous remboursez — vous gardez 100 % du capital",
    pros: ["Vous conservez la pleine propriété de votre entreprise", "Remboursement sur une durée définie", "Intérêts souvent déductibles fiscalement"],
    watch: ["Échéances de remboursement à honorer régulièrement", "Des garanties peuvent être requises"],
    note: null as string | null,
  },
  {
    v: "equity",
    l: "Partenariat / Co-actionnaire",
    tag: "Un investisseur entre au capital et partage la croissance",
    pros: ["Aucun remboursement fixe", "L'investisseur partage le risque avec vous", "Accès à son réseau, expertise et contacts"],
    watch: ["Dilution de votre participation au capital", "L'investisseur a un droit de regard sur les décisions"],
    note: null as string | null,
  },
  {
    v: "mezzanine",
    l: "Financement hybride",
    tag: "Mi-prêt, mi-participation — pour projets avancés",
    pros: ["Plus flexible qu'un prêt classique", "Moins dilutif que l'equity pure"],
    watch: ["Structure juridique plus complexe à mettre en place", "Généralement adapté aux montants > 500 000"],
    note: "Ce mécanisme requiert une structuration avancée. Notre équipe vous accompagnera lors de la revue du dossier.",
  },
  {
    v: "grant",
    l: "Subvention / Don",
    tag: "Fonds non remboursables — institutionnels ou ONG",
    pros: ["Aucun remboursement", "Aucune dilution de capital"],
    watch: ["Conditions d'éligibilité souvent strictes", "Délais d'attribution et rapports d'utilisation exigés"],
    note: null as string | null,
  },
  {
    v: "hybrid",
    l: "Combinaison d'instruments",
    tag: "Plusieurs mécanismes combinés — à définir ensemble",
    pros: ["Adapté aux besoins de financement complexes", "Optimise la structure globale du plan"],
    watch: ["Structuration plus longue à mettre en place", "Nécessite un accompagnement dédié"],
    note: "Pas encore sûr de votre choix ? Sélectionnez ceci — notre équipe structurera le bon plan avec vous.",
  },
];

const STAGES = [
  { v: "idea",          l: "Idée / Concept",                   desc: "Mon projet est défini mais pas encore lancé" },
  { v: "pre_revenue",   l: "Démarrage (0–2 ans)",              desc: "Mon activité est lancée, je génère peu ou pas encore de revenus" },
  { v: "early_revenue", l: "Premiers revenus",                 desc: "Je commence à générer du chiffre d'affaires — validation du marché en cours" },
  { v: "growth",        l: "Croissance (2–5 ans)",             desc: "Mon activité tourne bien, je veux accélérer" },
  { v: "expansion",     l: "Expansion / Internationalisation", desc: "Je veux ouvrir de nouveaux marchés ou pays" },
  { v: "bridge",        l: "Restructuration / Refinancement",  desc: "Je cherche à consolider ou remplacer une dette existante" },
];

const LEGAL_STRUCTURES = [
  { v: "ei",    l: "Entreprise individuelle",          desc: "Une seule personne — vous êtes l'entreprise. Simple à créer." },
  { v: "sarl",  l: "SARL / EURL",                     desc: "Société à responsabilité limitée. Structure la plus répandue dans la région." },
  { v: "sa",    l: "SA — Société Anonyme",             desc: "Pour les plus grandes structures. Permet l'entrée d'actionnaires formels." },
  { v: "coop",  l: "Coopérative / Association / ONG",  desc: "Structure collective ou à but non lucratif." },
  { v: "other", l: "Autre / En cours de création",    desc: "SAS, LLC, GIE, ou pas encore immatriculé — précisez ci-dessous." },
];

const COLLATERAL_TYPES = [
  { v: "real_estate",  l: "Bien immobilier",                       hasValue: true,  desc: "Terrain, immeuble, local commercial" },
  { v: "equipment",    l: "Équipement / Matériel",                  hasValue: true,  desc: "Machines, véhicules, outils industriels" },
  { v: "contracts",    l: "Contrats / Commandes signées",           hasValue: false, desc: "Portefeuille de contrats clients actifs" },
  { v: "clientele",    l: "Clientèle établie",                      hasValue: false, desc: "Base clients récurrents et historique de revenus" },
  { v: "guarantee",    l: "Caution personnelle / institutionnelle", hasValue: false, desc: "Engagement du dirigeant ou d'un garant externe" },
  { v: "receivables",  l: "Créances / Stocks",                      hasValue: true,  desc: "Factures à recouvrer, stocks valorisables" },
];

const INVESTOR_TYPES = [
  { v: "bank",    l: "Banque / Institution financière" },
  { v: "pe_vc",   l: "Fonds PE / Capital-risque" },
  { v: "dfi",     l: "Institution de développement (DFI)" },
  { v: "impact",  l: "Investisseur impact" },
  { v: "family",  l: "Family office / Privé" },
  { v: "diaspora",l: "Diaspora" },
  { v: "any",     l: "Ouvert à toutes les sources" },
];

const EXIT_HORIZONS = [
  { v: "3ans",    l: "3 ans" },
  { v: "5ans",    l: "5 ans" },
  { v: "7ans",    l: "7 ans+" },
  { v: "no_exit", l: "Pas d'exit prévu" },
];

const DURATION_RANGES = [
  { v: "short",     l: "Court terme  (< 2 ans)" },
  { v: "medium",    l: "Moyen terme  (2–5 ans)" },
  { v: "long",      l: "Long terme   (5–10 ans)" },
  { v: "very_long", l: "Très long terme (10 ans+)" },
];

const CURRENCIES = ["USD","EUR","MGA","MUR","XOF","ZAR","KES","TZS"];
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", MGA: "Ar", MUR: "₨", XOF: "CFA", ZAR: "R", KES: "KSh", TZS: "TSh",
};
// COUNTRIES now imported from @/lib/countries

const LEGAL_NOTES: Record<string, string> = {
  "Madagascar":     "À Madagascar : SARL, SA et EI sont les structures les plus courantes.",
  "Maurice":        "À Maurice : les formes Ltd, SA et GBC sont largement reconnues.",
  "Réunion":        "À La Réunion (France) : SARL, SAS, SA et EI sont disponibles.",
  "Comores":        "Aux Comores : SARL et SA sont les formes dominantes.",
  "Seychelles":     "Aux Seychelles : Ltd, SA et IBC sont courants.",
  "Kenya":          "Au Kenya : Limited Company et Partnership sont les structures dominantes.",
  "Tanzanie":       "En Tanzanie : Limited Company est la forme principale.",
  "Mozambique":     "Au Mozambique : Lda (SARL) et SA sont les formes dominantes.",
  "Afrique du Sud": "En Afrique du Sud : Pty Ltd (SARL) et Public Company (SA) sont courantes.",
};

// ─── Sub-components ───────────────────────────────────────────
function FormField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
      {hint && <p className="text-xs text-white/30 mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

function AmountInput({ value, onChange, currencySymbol, placeholder }: {
  value: string; onChange: (v: string) => void; currencySymbol: string; placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm font-mono pointer-events-none select-none min-w-[1.5rem]">
        {currencySymbol}
      </span>
      <input type="number" value={value} onChange={e => onChange(e.target.value)}
        min={0} step={1000} className="form-input font-mono"
        style={{ paddingLeft: `${Math.max(2.5, currencySymbol.length * 0.65 + 1.5)}rem` }}
        placeholder={placeholder || "0"}/>
    </div>
  );
}

function Toggle({ checked, onChange, labelOn, labelOff }: {
  checked: boolean; onChange: (v: boolean) => void; labelOn: string; labelOff: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-brand-navyMid rounded-xl border border-white/8 cursor-pointer"
      onClick={() => onChange(!checked)}>
      <div className={`w-11 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 flex-shrink-0 ${checked ? "bg-[#B8913A]" : "bg-white/10"}`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${checked ? "translate-x-5" : "translate-x-0"}`}/>
      </div>
      <span className="text-white/60 text-sm select-none">{checked ? labelOn : labelOff}</span>
    </div>
  );
}

function FundingTypeCard({ type, selected, expanded, onSelect, onToggleExpand }: {
  type: typeof FUNDING_TYPES[0]; selected: boolean; expanded: boolean;
  onSelect: () => void; onToggleExpand: (e: React.MouseEvent) => void;
}) {
  return (
    <div className={`rounded-xl border-2 transition-all duration-200 overflow-hidden ${
      selected ? "border-[#B8913A] bg-[#B8913A]/8" : "border-white/8 bg-brand-navyMid hover:border-[#B8913A]/30"
    }`}>
      <button type="button" onClick={onSelect} className="text-left w-full p-4">
        <div className="flex items-start gap-3">
          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all ${selected ? "border-[#B8913A] bg-[#B8913A]" : "border-white/20"}`}>
            {selected && (
              <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-semibold text-sm leading-none mb-1 ${selected ? "text-white" : "text-white/70"}`}>{type.l}</div>
            <div className={`text-xs leading-snug ${selected ? "text-white/60" : "text-white/35"}`}>{type.tag}</div>
          </div>
        </div>
      </button>
      <button type="button" onClick={onToggleExpand}
        className={`w-full flex items-center gap-1.5 px-4 pb-3 text-[11px] transition-colors ${selected ? "text-[#B8913A]/70 hover:text-[#B8913A]" : "text-white/25 hover:text-white/45"}`}>
        <svg className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
        </svg>
        En savoir plus
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/8 pt-3 space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-[#B8913A]/60 mb-2">Avantages</div>
            <ul className="space-y-1">
              {type.pros.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                  <svg className="w-3 h-3 text-[#B8913A]/60 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-white/20 mb-2">À retenir</div>
            <ul className="space-y-1">
              {type.watch.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/35">
                  <svg className="w-3 h-3 text-white/20 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374l7.02-12.124c.866-1.5 3.032-1.5 3.898 0l6.588 11.375z"/>
                  </svg>
                  {w}
                </li>
              ))}
            </ul>
          </div>
          {type.note && <div className="pt-2 border-t border-white/5 text-xs text-[#B8913A]/70 leading-relaxed italic">{type.note}</div>}
        </div>
      )}
    </div>
  );
}

// ─── Helpers to reconstruct state from stored project ─────────
function reconstructSectors(project: Project): string[] {
  const sectors: string[] = [];
  if (project.sector) sectors.push(project.sector);
  if (project.sub_sector && project.sector !== "other") {
    const dashIdx = project.sub_sector.indexOf(" — ");
    const sectorPart = dashIdx >= 0 ? project.sub_sector.substring(0, dashIdx) : project.sub_sector;
    sectorPart.split(", ").map(s => s.trim()).forEach(code => {
      if (code && SECTORS.find(s => s.v === code) && !sectors.includes(code)) sectors.push(code);
    });
  }
  return sectors;
}

function reconstructSectorOther(project: Project): string {
  if (!project.sub_sector) return "";
  if (project.sector === "other") return project.sub_sector;
  const dashIdx = project.sub_sector.indexOf(" — ");
  return dashIdx >= 0 ? project.sub_sector.substring(dashIdx + 3) : "";
}

function reconstructLegalKey(legalLabel: string | null): string {
  if (!legalLabel) return "";
  const match = LEGAL_STRUCTURES.find(l => l.l === legalLabel);
  return match ? match.v : "other";
}

function reconstructLegalOther(legalLabel: string | null): string {
  if (!legalLabel) return "";
  const match = LEGAL_STRUCTURES.find(l => l.l === legalLabel);
  return match ? "" : legalLabel;
}

// ─── Main component ───────────────────────────────────────────
export default function EditProjectForm({ project }: { project: Project }) {
  const router = useRouter();
  const [step,       setStep]      = useState(1);
  const [loading,    setLoading]   = useState(false);
  const [error,      setError]     = useState("");
  const [saved,      setSaved]     = useState(false);

  // ── Reconstruct derived state (stable with useMemo) ──────────
  const initSectors       = useMemo(() => reconstructSectors(project),           []);  // eslint-disable-line react-hooks/exhaustive-deps
  const initSectorOther   = useMemo(() => reconstructSectorOther(project),       []);  // eslint-disable-line react-hooks/exhaustive-deps
  const initLegalKey      = useMemo(() => reconstructLegalKey(project.legal_structure),  []);  // eslint-disable-line react-hooks/exhaustive-deps
  const initLegalOther    = useMemo(() => reconstructLegalOther(project.legal_structure),[]);  // eslint-disable-line react-hooks/exhaustive-deps
  const initCollaterals   = useMemo(() => project.collateral_type
    ? project.collateral_type.split(", ").map(s => s.trim()).filter(Boolean)
    : [], []);  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Form state — pre-populated ────────────────────────────────
  const [form, setForm] = useState<ProjectFormData>({
    title:                  project.title            || "",
    tagline:                project.tagline          || "",
    description:            project.description      || "",
    sector:                 project.sector           || "",
    sub_sector:             project.sub_sector       || "",
    stage:                  project.stage            || "",
    country:                project.country          || "Madagascar",
    city:                   project.city             || "",
    funding_type:           project.funding_type     || "",
    amount_requested:       project.amount_requested?.toString() || "",
    currency:               project.currency         || "USD",
    funding_term_months:    project.funding_term_months?.toString() || "",
    funding_duration_range: project.funding_duration_range || "",
    use_of_funds:           project.use_of_funds     || "",
    investor_type_sought:   project.investor_type_sought || [],
    equity_stake_offered:   project.equity_stake_offered?.toString() || "",
    pre_money_valuation:    project.pre_money_valuation?.toString() || "",
    exit_horizon:           project.exit_horizon     || "",
    legal_structure:        initLegalKey,
    years_in_operation:     project.years_in_operation?.toString() || "0",
    team_size:              project.team_size?.toString() || "",
    has_existing_revenue:   project.has_existing_revenue || false,
    annual_revenue:         project.annual_revenue?.toString() || "",
    has_collateral:         project.has_collateral || false,
    collateral_type:        project.collateral_type || "",
    collateral_description: project.collateral_description || "",
    collateral_value:       project.collateral_value?.toString() || "",
    job_creation_expected:  project.job_creation_expected?.toString() || "",
    impact_description:     project.impact_description || "",
  });

  const [selectedSectors,       setSelectedSectors]       = useState<string[]>(initSectors);
  const [sectorOtherDesc,       setSectorOtherDesc]       = useState(initSectorOther);
  const [expandedFundingType,   setExpandedFundingType]   = useState<string | null>(null);
  const [legalStructureOther,   setLegalStructureOther]   = useState(initLegalOther);
  const [selectedCollateralTypes, setSelectedCollateralTypes] = useState<string[]>(initCollaterals);

  const hasValuedCollateral = selectedCollateralTypes.some(v => COLLATERAL_TYPES.find(c => c.v === v)?.hasValue);

  function toggleSector(v: string) {
    setSelectedSectors(prev => prev.includes(v) ? prev.filter(s => s !== v) : [...prev, v]);
  }
  function toggleCollateral(v: string) {
    setSelectedCollateralTypes(prev => prev.includes(v) ? prev.filter(c => c !== v) : [...prev, v]);
  }
  function toggleInvestorType(v: string) {
    const cur = form.investor_type_sought || [];
    const next = v === "any"
      ? (cur.includes("any") ? [] : ["any"])
      : (cur.includes(v) ? cur.filter(t => t !== v) : [...cur.filter(t => t !== "any"), v]);
    setForm(f => ({ ...f, investor_type_sought: next }));
  }
  function update(k: keyof ProjectFormData, v: string | boolean | string[]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function validate(): string {
    if (step === 1) {
      if (!form.title.trim())           return "Le titre du dossier est requis.";
      if (selectedSectors.length === 0) return "Veuillez sélectionner au moins un secteur.";
      if (selectedSectors.includes("other") && !sectorOtherDesc.trim())
                                        return "Veuillez décrire votre secteur d'activité.";
      if (!form.stage)                  return "Veuillez sélectionner le stade du projet.";
    }
    if (step === 2) {
      if (!form.funding_type)       return "Veuillez sélectionner un type de financement.";
      if (!form.amount_requested)   return "Veuillez indiquer le montant recherché.";
      if (!form.use_of_funds.trim()) return "Veuillez décrire l'utilisation des fonds.";
    }
    return "";
  }

  function nextStep() {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setStep(s => Math.min(s + 1, 5));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function prevStep() { setError(""); setStep(s => Math.max(s - 1, 1)); }

  async function saveProject(newStatus?: string) {
    setLoading(true); setError(""); setSaved(false);
    const supabase = createClient();

    // F11 — Block resubmission if is_authorized_rep is false
    if (newStatus === "submitted") {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase.from("profiles").select("is_authorized_rep").eq("id", user.id).single();
        if (!prof?.is_authorized_rep) {
          setError("Vous devez confirmer être le représentant légal autorisé dans votre profil avant de soumettre.");
          setLoading(false);
          return;
        }
      }
    }

    const lsObj    = LEGAL_STRUCTURES.find(l => l.v === form.legal_structure);
    const legalLabel = lsObj
      ? (lsObj.v === "other" ? (legalStructureOther || "Autre") : lsObj.l)
      : form.legal_structure;

    const targetStatus = newStatus || project.status;

    const payload = {
      title:      form.title,
      tagline:    form.tagline     || null,
      description: form.description || null,
      sector:     (selectedSectors[0] || null) as string | null,
      sub_sector: selectedSectors.length > 1
        ? selectedSectors.slice(1).join(", ") + (sectorOtherDesc ? ` — ${sectorOtherDesc}` : "")
        : (selectedSectors.includes("other") ? sectorOtherDesc : null),
      stage:      form.stage || null,
      country:    form.country,
      city:       form.city || null,
      funding_type:           form.funding_type || null,
      amount_requested:       form.amount_requested ? parseFloat(form.amount_requested) : null,
      currency:               form.currency,
      funding_term_months:    form.funding_term_months ? parseInt(form.funding_term_months) : null,
      funding_duration_range: form.funding_duration_range || null,
      use_of_funds:           form.use_of_funds || null,
      investor_type_sought:   (form.investor_type_sought || []).length > 0 ? form.investor_type_sought : null,
      equity_stake_offered:   (form.funding_type === "equity" && form.equity_stake_offered) ? parseFloat(form.equity_stake_offered) : null,
      pre_money_valuation:    (form.funding_type === "equity" && form.pre_money_valuation) ? parseFloat(form.pre_money_valuation) : null,
      exit_horizon:           (form.funding_type === "equity" && form.exit_horizon) ? form.exit_horizon : null,
      legal_structure:     legalLabel || null,
      years_in_operation:  parseInt(form.years_in_operation) || 0,
      team_size:           form.team_size ? parseInt(form.team_size) : null,
      has_existing_revenue: form.has_existing_revenue,
      annual_revenue:      form.annual_revenue ? parseFloat(form.annual_revenue) : null,
      has_collateral:      selectedCollateralTypes.length > 0,
      collateral_type:     selectedCollateralTypes.length > 0 ? selectedCollateralTypes.join(", ") : null,
      collateral_description: form.collateral_description || null,
      collateral_value:    (hasValuedCollateral && form.collateral_value) ? parseFloat(form.collateral_value) : null,
      job_creation_expected: form.job_creation_expected ? parseInt(form.job_creation_expected) : null,
      impact_description:  form.impact_description || null,
      status: targetStatus,
      submitted_at: targetStatus === "submitted" && !project.submitted_at ? new Date().toISOString() : project.submitted_at,
    };

    const { error: err } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", project.id);

    setLoading(false);
    if (err) { setError(friendlyError(err)); return; }
    router.push(`/dashboard/projects/${project.id}?updated=1`);
  }

  const progress     = Math.round((step / 5) * 100);
  const currentStep  = STEPS[step - 1];
  const canResubmit  = project.status === "draft" || project.status === "rejected";
  const isUnderReview = project.status === "under_review" || project.status === "submitted";

  return (
    <div className="min-h-screen bg-brand-navy">
      {/* Top bar */}
      <div className="bg-brand-navyMid border-b border-white/5 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href={`/dashboard/projects/${project.id}`}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Mon dossier
          </Link>
          <div className="text-white/60 font-medium text-sm hidden sm:block">Modifier le dossier</div>
          <button onClick={() => saveProject()} disabled={loading}
            className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors disabled:opacity-40">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
            </svg>
            {loading ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/5">
        <div className="h-full bg-[#B8913A] transition-all duration-500 ease-out" style={{ width: `${progress}%` }}/>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Under-review notice */}
        {isUnderReview && (
          <div className="mb-6 p-4 bg-yellow-500/8 border border-yellow-500/20 rounded-xl flex items-start gap-3">
            <svg className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
            <p className="text-yellow-300/80 text-sm leading-relaxed">
              Ce dossier est actuellement <strong>en cours d&apos;examen</strong>. Vous pouvez enregistrer des modifications mais elles ne rouvriront pas le processus de revue en cours.
            </p>
          </div>
        )}

        {/* Saved confirmation */}
        {saved && (
          <div className="mb-6 p-4 bg-green-500/8 border border-green-500/20 rounded-xl flex items-center gap-2 text-green-400 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
            </svg>
            Modifications enregistrées avec succès.
          </div>
        )}

        {/* Step indicators */}
        <div className="flex items-center mb-10 overflow-x-auto pb-2 gap-0">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center">
              <div className={`flex items-center gap-2 transition-all duration-300 ${
                step === s.n ? "opacity-100" : step > s.n ? "opacity-60" : "opacity-25"
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-all duration-300 ${
                  step > s.n  ? "bg-[#B8913A]/20 text-[#B8913A] border border-[#B8913A]/30" :
                  step === s.n ? "bg-[#B8913A] text-white" :
                                 "bg-white/5 text-white/30 border border-white/10"
                }`}>
                  {step > s.n ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                    </svg>
                  ) : s.n}
                </div>
                <div className="hidden sm:block">
                  <div className={`text-xs font-medium ${step === s.n ? "text-white" : "text-white/40"}`}>{s.label}</div>
                  <div className="text-xs text-white/20">{s.desc}</div>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 sm:w-12 h-px mx-2 flex-shrink-0 transition-all duration-300 ${step > s.n ? "bg-[#B8913A]/40" : "bg-white/8"}`}/>
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/8">
          {/* Step header */}
          <div className="flex items-center gap-3 mb-7 pb-6 border-b border-white/5">
            <div className="w-10 h-10 bg-[#B8913A]/10 border border-[#B8913A]/20 rounded-xl flex items-center justify-center text-[#B8913A]">
              {StepIcons[step - 1]}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">{currentStep.label}</h2>
              <p className="text-white/40 text-sm">{currentStep.desc}</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/8 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          {/* ══ STEP 1: Project Identity ══ */}
          {step === 1 && (
            <div className="space-y-6">
              <FormField label="Titre du dossier *" hint="Soyez précis et accrocheur.">
                <input type="text" value={form.title} onChange={e => update("title", e.target.value)}
                  className="form-input" placeholder="Nom de votre projet"/>
              </FormField>

              <FormField label="Accroche (optionnel)" hint="Une phrase qui résume votre projet en moins de 100 caractères">
                <input type="text" value={form.tagline} onChange={e => update("tagline", e.target.value)}
                  className="form-input" placeholder="La première plateforme agritech de Madagascar"/>
              </FormField>

              <FormField label="Description du projet" hint="Présentez votre projet, le problème qu'il résout et votre avantage concurrentiel">
                <textarea value={form.description} onChange={e => update("description", e.target.value)}
                  className="form-input min-h-[120px] resize-y" rows={4}
                  placeholder="Décrivez votre projet en 3 à 5 paragraphes..."/>
              </FormField>

              <FormField label="Secteur d'activité *" hint="Vous pouvez sélectionner plusieurs secteurs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-1">
                  {SECTORS.map(s => (
                    <button key={s.v} type="button" onClick={() => toggleSector(s.v)}
                      className={`text-left p-4 rounded-xl border-2 transition-all duration-200 w-full relative ${
                        selectedSectors.includes(s.v)
                          ? "border-[#B8913A] bg-[#B8913A]/8 text-white"
                          : "border-white/8 bg-brand-navyMid text-white/50 hover:border-[#B8913A]/30 hover:text-white/70"
                      }`}>
                      <div className="font-medium text-sm">{s.l}</div>
                      {selectedSectors.includes(s.v) && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-[#B8913A] rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {selectedSectors.includes("other") && (
                  <div className="mt-3">
                    <input type="text" value={sectorOtherDesc} onChange={e => setSectorOtherDesc(e.target.value)}
                      className="form-input" placeholder="Décrivez votre secteur d'activité..."/>
                  </div>
                )}
                {selectedSectors.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectedSectors.map(v => {
                      const label = SECTORS.find(s => s.v === v)?.l || v;
                      return (
                        <span key={v} className="flex items-center gap-1 bg-[#B8913A]/10 border border-[#B8913A]/20 text-[#B8913A] text-xs px-2.5 py-1 rounded-full">
                          {v === "other" && sectorOtherDesc ? sectorOtherDesc : label}
                          <button type="button" onClick={() => toggleSector(v)} className="hover:text-white transition-colors">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </FormField>

              <FormField label="Stade du projet *">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                  {STAGES.map(s => (
                    <button key={s.v} type="button" onClick={() => update("stage", s.v)}
                      className={`text-left p-4 rounded-xl border-2 transition-all duration-200 w-full ${
                        form.stage === s.v
                          ? "border-[#B8913A] bg-[#B8913A]/8 text-white"
                          : "border-white/8 bg-brand-navyMid text-white/50 hover:border-[#B8913A]/30 hover:text-white/70"
                      }`}>
                      <div className={`font-semibold text-sm mb-1 ${form.stage === s.v ? "text-white" : ""}`}>{s.l}</div>
                      <div className="text-xs opacity-60 leading-snug">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Pays">
                  <select value={form.country} onChange={e => update("country", e.target.value)} className="form-input">
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </FormField>
                <FormField label="Ville">
                  <input type="text" value={form.city} onChange={e => update("city", e.target.value)}
                    className="form-input" placeholder="Antananarivo"/>
                </FormField>
              </div>
            </div>
          )}

          {/* ══ STEP 2: Funding ══ */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="form-label">Type de financement recherché *</label>
                <p className="text-white/30 text-xs mb-3 leading-relaxed">
                  Cliquez sur &ldquo;En savoir plus&rdquo; pour comprendre les implications de chaque type.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {FUNDING_TYPES.map(f => (
                    <FundingTypeCard
                      key={f.v} type={f} selected={form.funding_type === f.v}
                      expanded={expandedFundingType === f.v}
                      onSelect={() => update("funding_type", f.v)}
                      onToggleExpand={e => { e.stopPropagation(); setExpandedFundingType(prev => prev === f.v ? null : f.v); }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Devise">
                  <select value={form.currency} onChange={e => update("currency", e.target.value)} className="form-input">
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </FormField>
                <FormField label="Montant recherché *" hint="Indiquez le montant exact">
                  <AmountInput value={form.amount_requested} onChange={v => update("amount_requested", v)}
                    currencySymbol={CURRENCY_SYMBOLS[form.currency] || form.currency} placeholder="Ex : 500 000"/>
                </FormField>
              </div>

              <div>
                <label className="form-label">Horizon de financement souhaité</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                  {DURATION_RANGES.map(d => (
                    <button key={d.v} type="button" onClick={() => update("funding_duration_range", d.v)}
                      className={`text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                        form.funding_duration_range === d.v
                          ? "border-[#B8913A] bg-[#B8913A]/8 text-white"
                          : "border-white/8 bg-brand-navyMid text-white/50 hover:border-[#B8913A]/30"
                      }`}>
                      <div className={`text-xs font-semibold leading-snug ${form.funding_duration_range === d.v ? "text-white" : ""}`}>{d.l}</div>
                    </button>
                  ))}
                </div>
                <p className="text-white/25 text-xs mt-2">Vous pouvez aussi préciser le nombre de mois :</p>
                <input type="number" value={form.funding_term_months} onChange={e => update("funding_term_months", e.target.value)}
                  className="form-input mt-2" placeholder="Ex : 60 mois (optionnel)" min={1} max={360}/>
              </div>

              <div>
                <label className="form-label">
                  Quel type d&apos;investisseur recherchez-vous ?
                  <span className="text-white/25 normal-case font-normal ml-1">(optionnel — plusieurs choix)</span>
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {INVESTOR_TYPES.map(t => {
                    const sel = (form.investor_type_sought || []).includes(t.v);
                    return (
                      <button key={t.v} type="button" onClick={() => toggleInvestorType(t.v)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                          sel ? "bg-[#B8913A]/15 border-[#B8913A]/40 text-[#B8913A]"
                              : "bg-brand-navyMid border-white/10 text-white/40 hover:border-[#B8913A]/30 hover:text-white/60"
                        }`}>
                        {t.l}
                      </button>
                    );
                  })}
                </div>
              </div>

              {form.funding_type === "equity" && (
                <div className="p-5 bg-brand-navyMid rounded-xl border border-[#B8913A]/20 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#B8913A]/70 text-xs font-semibold uppercase tracking-wider">Termes du partenariat (optionnel)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Capital proposé (%)" hint="Part du capital offerte à l'investisseur">
                      <div className="relative">
                        <input type="number" value={form.equity_stake_offered}
                          onChange={e => update("equity_stake_offered", e.target.value)}
                          className="form-input pr-8" placeholder="Ex : 25" min={1} max={99}/>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">%</span>
                      </div>
                    </FormField>
                    <FormField label="Valorisation pré-money" hint={`Estimation actuelle (${form.currency})`}>
                      <AmountInput value={form.pre_money_valuation} onChange={v => update("pre_money_valuation", v)}
                        currencySymbol={CURRENCY_SYMBOLS[form.currency] || form.currency} placeholder="Ex : 1 000 000"/>
                    </FormField>
                  </div>
                  <div>
                    <label className="form-label">Horizon de sortie envisagé</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {EXIT_HORIZONS.map(h => (
                        <button key={h.v} type="button" onClick={() => update("exit_horizon", h.v)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                            form.exit_horizon === h.v
                              ? "bg-[#B8913A]/15 border-[#B8913A]/40 text-[#B8913A]"
                              : "bg-white/5 border-white/10 text-white/40 hover:border-[#B8913A]/30 hover:text-white/60"
                          }`}>
                          {h.l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <FormField label="Utilisation prévue des fonds *" hint="Soyez précis : ex. 60 % équipement, 30 % BFR, 10 % marketing">
                <textarea value={form.use_of_funds} onChange={e => update("use_of_funds", e.target.value)}
                  className="form-input min-h-[100px] resize-y" rows={3}
                  placeholder="Décrivez comment vous utiliserez les fonds..."/>
              </FormField>
            </div>
          )}

          {/* ══ STEP 3: Organisation ══ */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="form-label">Structure juridique</label>
                {LEGAL_NOTES[form.country] && (
                  <p className="text-white/30 text-xs mb-3 leading-relaxed">
                    <svg className="w-3 h-3 inline mr-1 text-[#B8913A]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
                    </svg>
                    {LEGAL_NOTES[form.country]}
                  </p>
                )}
                <CardSelectWithOther
                  options={LEGAL_STRUCTURES}
                  value={form.legal_structure}
                  onChange={v => update("legal_structure", v)}
                  otherValue={legalStructureOther}
                  onOtherChange={setLegalStructureOther}
                  otherPlaceholder="Ex : SAS, LLC, GIE, en cours d'immatriculation..."/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Années d'existence">
                  <input type="number" value={form.years_in_operation}
                    onChange={e => update("years_in_operation", e.target.value)}
                    className="form-input" placeholder="0" min={0} max={100}/>
                </FormField>
                <FormField label="Taille de l'équipe">
                  <input type="number" value={form.team_size} onChange={e => update("team_size", e.target.value)}
                    className="form-input" placeholder="Ex : 12" min={1}/>
                </FormField>
              </div>

              <FormField label="Revenus existants">
                <Toggle checked={form.has_existing_revenue} onChange={v => update("has_existing_revenue", v)}
                  labelOn="Oui — l'entreprise génère des revenus"
                  labelOff="Non — pas encore de revenus"/>
              </FormField>

              {form.has_existing_revenue && (
                <FormField label={`Chiffre d'affaires annuel (${form.currency})`} hint="Dernière année fiscale disponible">
                  <AmountInput value={form.annual_revenue} onChange={v => update("annual_revenue", v)}
                    currencySymbol={CURRENCY_SYMBOLS[form.currency] || form.currency} placeholder="Ex : 150 000"/>
                </FormField>
              )}

              <div className="p-4 rounded-xl border border-white/5 flex items-start gap-3">
                <svg className="w-4 h-4 text-white/20 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                </svg>
                <p className="text-white/25 text-xs leading-relaxed">
                  Ces données financières sont strictement confidentielles et uniquement partagées avec les investisseurs qui expriment un intérêt concret pour votre projet.
                </p>
              </div>
            </div>
          )}

          {/* ══ STEP 4: Assets & Strengths ══ */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="p-5 bg-brand-navyMid rounded-xl border border-white/8">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#B8913A]/70 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
                  </svg>
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-1">Vos atouts & garanties</h3>
                    <p className="text-white/40 text-xs leading-relaxed">
                      Les investisseurs regardent l&apos;ensemble de votre dossier — vos actifs, contrats et clientèle fidèle sont de véritables atouts.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">Sélectionnez vos atouts <span className="text-white/25 normal-case font-normal">(plusieurs choix possibles)</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                  {COLLATERAL_TYPES.map(c => {
                    const active = selectedCollateralTypes.includes(c.v);
                    return (
                      <button key={c.v} type="button" onClick={() => toggleCollateral(c.v)}
                        className={`text-left p-4 rounded-xl border-2 transition-all duration-200 w-full relative ${
                          active ? "border-[#B8913A] bg-[#B8913A]/8 text-white"
                                 : "border-white/8 bg-brand-navyMid text-white/50 hover:border-[#B8913A]/30 hover:text-white/70"
                        }`}>
                        <div className={`font-semibold text-sm mb-0.5 ${active ? "text-white" : ""}`}>{c.l}</div>
                        <div className="text-xs opacity-55 leading-snug">{c.desc}</div>
                        {active && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-[#B8913A] rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedCollateralTypes.length === 0 && (
                  <p className="text-white/25 text-xs mt-3 leading-relaxed">
                    Si vous n&apos;avez aucune garantie formelle, vous pouvez passer à l&apos;étape suivante.
                  </p>
                )}
              </div>

              {selectedCollateralTypes.length > 0 && (
                <FormField label="Décrivez vos atouts" hint="Plus vous êtes précis, plus votre dossier inspire confiance aux investisseurs">
                  <textarea value={form.collateral_description}
                    onChange={e => update("collateral_description", e.target.value)}
                    className="form-input resize-y" rows={3}
                    placeholder="Ex : Contrats signés avec 3 distributeurs représentant 200k€/an de CA récurrent..."/>
                </FormField>
              )}

              {hasValuedCollateral && (
                <FormField label={`Valeur estimée de vos actifs (${form.currency})`} hint="Estimation globale des actifs physiques déclarés ci-dessus">
                  <AmountInput value={form.collateral_value} onChange={v => update("collateral_value", v)}
                    currencySymbol={CURRENCY_SYMBOLS[form.currency] || form.currency} placeholder="Ex : 200 000"/>
                </FormField>
              )}
            </div>
          )}

          {/* ══ STEP 5: Impact & Review ══ */}
          {step === 5 && (
            <div className="space-y-6">
              <FormField label="Emplois créés (estimation)" hint="Nombre d'emplois directs prévus dans les 3 ans suivant le financement">
                <input type="number" value={form.job_creation_expected}
                  onChange={e => update("job_creation_expected", e.target.value)}
                  className="form-input" placeholder="Ex : 25" min={0}/>
              </FormField>

              <FormField label="Impact social & environnemental">
                <textarea value={form.impact_description} onChange={e => update("impact_description", e.target.value)}
                  className="form-input resize-y min-h-[100px]" rows={3}
                  placeholder="Comment votre projet contribue-t-il au développement de la région ?"/>
              </FormField>

              {/* Summary */}
              <div className="border-t border-white/8 pt-6">
                <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#B8913A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/>
                  </svg>
                  Récapitulatif des modifications
                </h3>
                <div className="space-y-0">
                  {[
                    ["Projet",       form.title || "—"],
                    ["Secteurs",     selectedSectors.map(v => SECTORS.find(s => s.v === v)?.l || v).join(", ") || "—"],
                    ["Financement",  FUNDING_TYPES.find(f => f.v === form.funding_type)?.l || "—"],
                    ["Montant",      form.amount_requested ? `${CURRENCY_SYMBOLS[form.currency] || form.currency}${parseFloat(form.amount_requested).toLocaleString("fr-FR")}` : "—"],
                    ["Stade",        STAGES.find(s => s.v === form.stage)?.l || "—"],
                    ["Localisation", [form.city, form.country].filter(Boolean).join(", ") || "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-start py-2.5 border-b border-white/5 last:border-0">
                      <span className="text-white/35 text-sm">{k}</span>
                      <span className="text-white/70 text-sm font-medium text-right max-w-[60%]">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={prevStep} disabled={step === 1}
            className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed py-3 px-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
            </svg>
            Précédent
          </button>

          <div className="text-white/45 text-sm">{step} / {STEPS.length}</div>

          {step < 5 ? (
            <button onClick={nextStep} className="btn-primary py-3 px-8">
              Suivant
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => saveProject()} disabled={loading}
                className="btn-secondary py-3 px-5 text-sm disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Sauvegarde...
                  </span>
                ) : "Enregistrer les modifications"}
              </button>
              {canResubmit && (
                <button onClick={() => saveProject("submitted")} disabled={loading}
                  className="btn-primary py-3 px-8 disabled:opacity-60">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                      Envoi...
                    </span>
                  ) : (
                    <>
                      {project.status === "rejected" ? "Resubmettre" : "Soumettre le dossier"}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
