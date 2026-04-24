"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import CardSelectWithOther from "@/components/ui/CardSelectWithOther";
import type { InvestorProfile } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { friendlyError } from "@/lib/friendlyError";

// ─── Constants ────────────────────────────────────────────────
const ROLE_TYPES = [
  { v: "bank",         l: "Banque / Institution financière", desc: "Banque commerciale, banque d'investissement, caisse d'épargne" },
  { v: "pe_vc_fund",   l: "Fonds PE / Capital-risque",       desc: "Private equity, venture capital, fonds de croissance" },
  { v: "dfi",          l: "Institution de développement",    desc: "DFI, banque de développement, fonds d'aide institutionnel" },
  { v: "wealth_family",l: "Family office / Privé",           desc: "Gestion de fortune privée, investisseur individuel HNWI" },
  { v: "advisor",      l: "Conseiller / Structurateur",      desc: "Conseil en financement, banquier d'affaires, advisory" },
  { v: "legal",        l: "Juriste / Avocat d'affaires",     desc: "Conseil juridique, corporate law, deals structuring" },
  { v: "other",        l: "Autre profil",                    desc: "Autre rôle dans l'écosystème capital & financement" },
];

// DB keys (projects.sector) with French display labels. We store keys in
// investor_profiles.priority_sectors so the deal-flow scorer can string-match
// against projects.sector (English keys) directly. Custom "other" free text
// is persisted as a plain string in the array alongside keys.
const SECTOR_OPTIONS: { v: string; l: string }[] = [
  { v: "energy",             l: "Énergie" },
  { v: "agriculture",        l: "Agriculture" },
  { v: "tech",               l: "Technologie" },
  { v: "real_estate",        l: "Immobilier" },
  { v: "infrastructure",     l: "Infrastructure" },
  { v: "manufacturing",      l: "Industrie" },
  { v: "tourism",            l: "Tourisme" },
  { v: "health",             l: "Santé" },
  { v: "education",          l: "Éducation" },
  { v: "financial_services", l: "Services financiers" },
  { v: "other",              l: "Autre" },
];
const KNOWN_SECTOR_KEYS = SECTOR_OPTIONS.map(o => o.v);

const DURATION_PREFS = [
  { v: "short",     l: "Court terme (< 2 ans)" },
  { v: "medium",    l: "Moyen terme (2–5 ans)" },
  { v: "long",      l: "Long terme (5–10 ans)" },
  { v: "very_long", l: "Très long terme (10 ans+)" },
];

const GEO_ZONES = [
  "Madagascar", "Maurice", "Réunion", "Comores", "Seychelles",
  "Mayotte", "Mozambique", "Kenya", "Tanzanie", "Afrique du Sud",
  "Afrique subsaharienne", "Région Océan Indien", "International", "Autre",
];

// Legacy constant kept for reference; new code uses KNOWN_SECTOR_KEYS above.


const KNOWN_GEO_ZONES = [
  "Madagascar", "Maurice", "Réunion", "Comores", "Seychelles",
  "Mayotte", "Mozambique", "Kenya", "Tanzanie", "Afrique du Sud",
  "Afrique subsaharienne", "Région Océan Indien", "International", "Autre",
];

const OBJECTIVES = [
  { v: "deal_flow",     l: "Accéder à du deal flow qualifié" },
  { v: "co_invest",     l: "Co-investir avec d'autres acteurs" },
  { v: "network",       l: "Élargir mon réseau professionnel" },
  { v: "advisory",      l: "Proposer mes services de conseil" },
  { v: "market_intel",  l: "Suivre les opportunités du marché" },
  { v: "impact",        l: "Investir à impact dans la région" },
];

const PHOTO_CONSENTS = [
  { v: "yes",       l: "Oui, j'accepte",              desc: "Mon nom et photo peuvent apparaître sur la plateforme" },
  { v: "initials",  l: "Initiales seulement",          desc: "Visible sous forme d'initiales" },
  { v: "no",        l: "Non, pas de visibilité",       desc: "Mon profil reste confidentiel" },
];

const CURRENCIES = ["USD", "EUR", "MGA", "MUR", "XOF"];

// I-L3 — localStorage key for first-timers' wizard draft. Cleared on save.
const DRAFT_KEY = "investorProfile.draft.v1";

// ─── Steps ────────────────────────────────────────────────────
const STEPS = [
  { n: 1, label: "Votre profil",  desc: "Identité & rôle" },
  { n: 2, label: "Mandat",        desc: "Critères d'investissement" },
  { n: 3, label: "Réseau",        desc: "Objectifs & engagement" },
];

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

function Chips({ items, selected, onToggle, multi = true }: {
  items: { v: string; l: string }[];
  selected: string[];
  onToggle: (v: string) => void;
  multi?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-1.5">
      {items.map(item => {
        const active = selected.includes(item.v);
        return (
          <button key={item.v} type="button" onClick={() => onToggle(item.v)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              active
                ? "bg-[#B8913A]/15 border-[#B8913A]/40 text-[#B8913A]"
                : "bg-brand-navyMid border-white/10 text-white/40 hover:border-[#B8913A]/30 hover:text-white/60"
            }`}>
            {item.l}
          </button>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function InvestorProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = !searchParams ? false : searchParams.get("onboarding") === "1";
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [existingId, setExistingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Step 1
  const [fullName, setFullName]       = useState("");
  const [title, setTitle]             = useState("");
  const [organization, setOrg]        = useState("");
  const [email, setEmail]             = useState("");
  const [phone, setPhone]             = useState("");
  const [linkedin, setLinkedin]       = useState("");
  const [country, setCountry]         = useState("Madagascar");
  const [countryOther, setCountryOther] = useState("");
  const [city, setCity]               = useState("");
  const [roleType, setRoleType]       = useState("");
  const [roleOther, setRoleOther]     = useState("");

  // Step 2
  const [sectors, setSectors]           = useState<string[]>([]);
  const [sectorOther, setSectorOther]   = useState("");
  const [currency, setCurrency]         = useState("USD");
  const [ticketMin, setTicketMin]       = useState("");
  const [ticketMax, setTicketMax]       = useState("");
  const [durations, setDurations]       = useState<string[]>([]);
  const [geoZones, setGeoZones]         = useState<string[]>([]);
  const [geoOther, setGeoOther]         = useState("");
  const [mandateConditions, setMandate] = useState("");

  // Step 3
  const [objectives, setObjectives]         = useState<string[]>([]);
  const [openToFlow, setOpenToFlow]         = useState(true);
  const [flowConditions, setFlowConditions] = useState("");
  const [bio, setBio]                       = useState("");
  const [photoConsent, setPhotoConsent]     = useState("initials");

  // Load existing profile
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data } = await supabase
        .from("investor_profiles").select("*").eq("user_id", user.id).maybeSingle() as { data: InvestorProfile | null };

      if (data) {
        setExistingId(data.id);
        setFullName(data.full_name || "");
        setTitle(data.title || "");
        setOrg(data.organization || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setLinkedin(data.linkedin_url || "");
        // Detect custom country value using the canonical list
        const loadedCountry = data.country || "Madagascar";
        if (COUNTRIES.includes(loadedCountry)) {
          setCountry(loadedCountry);
        } else {
          setCountry("Autre");
          setCountryOther(loadedCountry);
        }
        setCity(data.city || "");
        setRoleType(data.role_type || "");
        setRoleOther(data.role_other || "");

        // Sectors are stored as DB keys (audit fix I-C1). Any string that
        // isn't a known key is a free-text "other" value — pop it into the
        // sectorOther field and add "other" as selected.
        const loadedSectors = data.priority_sectors || [];
        const customSector = loadedSectors.find(s => !KNOWN_SECTOR_KEYS.includes(s));
        if (customSector) {
          setSectorOther(customSector);
          setSectors([...loadedSectors.filter(s => KNOWN_SECTOR_KEYS.includes(s)), "other"]);
        } else {
          setSectors(loadedSectors);
        }

        // Handle custom geo zone value
        const loadedGeoZones = data.geographic_zones || [];
        const customGeo = loadedGeoZones.find(z => !KNOWN_GEO_ZONES.includes(z));
        if (customGeo) {
          setGeoOther(customGeo);
          setGeoZones([...loadedGeoZones.filter(z => KNOWN_GEO_ZONES.includes(z)), "Autre"]);
        } else {
          setGeoZones(loadedGeoZones);
        }

        setTicketMin(data.ticket_min?.toString() || "");
        setTicketMax(data.ticket_max?.toString() || "");
        setCurrency(data.ticket_currency || "USD");
        setDurations(data.duration_prefs || []);
        setMandate(data.mandate_conditions || "");
        setObjectives(data.objectives || []);
        setOpenToFlow(data.open_to_deal_flow ?? true);
        setFlowConditions(data.deal_flow_conditions || "");
        setBio(data.bio || "");
        setPhotoConsent(data.photo_consent || "initials");
      } else {
        // Pre-fill from user profile
        const { data: profile } = await supabase
          .from("profiles").select("full_name,email,organization,job_title,country,phone").eq("id", user.id).single();
        if (profile) {
          setFullName(profile.full_name || "");
          setEmail(profile.email || "");
          setOrg(profile.organization || "");
          setTitle(profile.job_title || "");
          setPhone(profile.phone || "");
          const profileCountry = profile.country || "Madagascar";
          if (COUNTRIES.includes(profileCountry)) {
            setCountry(profileCountry);
          } else {
            setCountry("Autre");
            setCountryOther(profileCountry);
          }
        }

        // I-L3 — rehydrate any draft saved from a previous visit. Only fires
        // when the user has NO saved investor profile yet (first-time flow);
        // existing-profile users always take the DB as source of truth.
        try {
          const raw = localStorage.getItem(DRAFT_KEY);
          if (raw) {
            const d = JSON.parse(raw) as Record<string, unknown>;
            if (typeof d.fullName     === "string") setFullName(d.fullName);
            if (typeof d.title        === "string") setTitle(d.title);
            if (typeof d.organization === "string") setOrg(d.organization);
            if (typeof d.email        === "string") setEmail(d.email);
            if (typeof d.phone        === "string") setPhone(d.phone);
            if (typeof d.linkedin     === "string") setLinkedin(d.linkedin);
            if (typeof d.country      === "string") setCountry(d.country);
            if (typeof d.countryOther === "string") setCountryOther(d.countryOther);
            if (typeof d.city         === "string") setCity(d.city);
            if (typeof d.roleType     === "string") setRoleType(d.roleType);
            if (typeof d.roleOther    === "string") setRoleOther(d.roleOther);
            if (Array.isArray(d.sectors))     setSectors(d.sectors as string[]);
            if (typeof d.sectorOther  === "string") setSectorOther(d.sectorOther);
            if (typeof d.currency     === "string") setCurrency(d.currency);
            if (typeof d.ticketMin    === "string") setTicketMin(d.ticketMin);
            if (typeof d.ticketMax    === "string") setTicketMax(d.ticketMax);
            if (Array.isArray(d.durations))   setDurations(d.durations as string[]);
            if (Array.isArray(d.geoZones))    setGeoZones(d.geoZones as string[]);
            if (typeof d.geoOther     === "string") setGeoOther(d.geoOther);
            if (typeof d.mandateConditions === "string") setMandate(d.mandateConditions);
            if (Array.isArray(d.objectives))  setObjectives(d.objectives as string[]);
            if (typeof d.openToFlow   === "boolean") setOpenToFlow(d.openToFlow);
            if (typeof d.flowConditions === "string") setFlowConditions(d.flowConditions);
            if (typeof d.bio          === "string") setBio(d.bio);
            if (typeof d.photoConsent === "string") setPhotoConsent(d.photoConsent);
          }
        } catch { /* ignore malformed/disabled storage */ }
      }
      setPageLoading(false);
    }
    load();
  }, [router]);

  // I-L3 — persist the current form state as a draft on every change, but
  // only for first-time users (existingId null). Skipped while the initial
  // load is still happening to avoid clobbering with empty state.
  useEffect(() => {
    if (pageLoading) return;
    if (existingId) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        fullName, title, organization, email, phone, linkedin,
        country, countryOther, city, roleType, roleOther,
        sectors, sectorOther, currency, ticketMin, ticketMax,
        durations, geoZones, geoOther, mandateConditions,
        objectives, openToFlow, flowConditions, bio, photoConsent,
      }));
    } catch { /* quota / disabled */ }
  }, [pageLoading, existingId,
    fullName, title, organization, email, phone, linkedin,
    country, countryOther, city, roleType, roleOther,
    sectors, sectorOther, currency, ticketMin, ticketMax,
    durations, geoZones, geoOther, mandateConditions,
    objectives, openToFlow, flowConditions, bio, photoConsent]);

  function toggleChip(setter: React.Dispatch<React.SetStateAction<string[]>>, v: string) {
    setter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  }

  // validate(n) runs the rules for step n. validate() (no arg) runs all rules
  // across every step — used on final submit when the user may have edited
  // earlier steps via the wizard back button.
  function validate(n: number = 0): string {
    const run = (which: number) => {
      if (which === 1) {
        if (!fullName.trim()) return "Votre nom complet est requis.";
        if (!roleType)        return "Veuillez sélectionner votre rôle.";
        if (roleType === "other" && !roleOther.trim()) return "Veuillez préciser votre rôle.";
        // I-M2: LinkedIn — accept empty; otherwise must be a recognisable URL.
        if (linkedin.trim()) {
          const linkedinOK = /^https?:\/\/(www\.|[a-z]{2}\.)?linkedin\.com\/(in|company|pub)\/[\w\-_%/.]+\/?$/i.test(linkedin.trim());
          if (!linkedinOK) return "Le lien LinkedIn semble invalide (format attendu : https://www.linkedin.com/in/...).";
        }
        // I-M2: Phone — accept empty, otherwise ≥7 digits and only legal chars.
        if (phone.trim()) {
          const digits = phone.replace(/\D/g, "");
          const phoneOK = /^\+?[\d\s().\-]{7,}$/.test(phone.trim()) && digits.length >= 7;
          if (!phoneOK) return "Le numéro de téléphone semble invalide.";
        }
      }
      if (which === 2) {
        if (sectors.length === 0) return "Sélectionnez au moins un secteur prioritaire.";
        // I-M1: ticket range sanity.
        const min = ticketMin ? parseInt(ticketMin) : null;
        const max = ticketMax ? parseInt(ticketMax) : null;
        if (min != null && max != null && min > max) {
          return "Le ticket minimum ne peut pas dépasser le maximum.";
        }
      }
      if (which === 3) {
        // I-M3: bio hard cap — also enforced on the textarea but server-truncation is ugly.
        if (bio.length > 2000) return `La biographie est trop longue (${bio.length} / 2000 caractères).`;
      }
      return "";
    };

    if (n > 0) return run(n);
    for (const s of [1, 2, 3]) {
      const e = run(s);
      if (e) return e;
    }
    return "";
  }

  function nextStep() {
    const err = validate(step);
    if (err) { setError(err); return; }
    setError("");
    setStep(s => Math.min(s + 1, 3));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    // Re-run all-step validators on final submit — user may have edited an
    // earlier step via the wizard back button without re-clicking Suivant.
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true); setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Session expirée."); setLoading(false); return; }

    const payload = {
      user_id:            user.id,
      // Trim defensively so a user typing just whitespace doesn't hit the
      // CHECK constraint (investor_profiles_full_name_nonempty, audit I-H7).
      full_name:          fullName.trim(),
      title:              title.trim() || null,
      organization:       organization.trim() || null,
      email:              email || null,
      phone:              phone || null,
      linkedin_url:       linkedin || null,
      country:            country === "Autre" ? (countryOther || null) : (country || null),
      city:               city || null,
      role_type:          roleType,
      role_other:         roleType === "other" ? roleOther : null,
      // Keep DB keys as-is. "other" gets replaced with the free-text value if provided.
      priority_sectors:   sectors.map(s => s === "other" && sectorOther ? sectorOther : s),
      ticket_min:         ticketMin ? parseInt(ticketMin) : null,
      ticket_max:         ticketMax ? parseInt(ticketMax) : null,
      ticket_currency:    currency,
      duration_prefs:     durations,
      geographic_zones:   geoZones.map(z => z === "Autre" && geoOther ? geoOther : z),
      mandate_conditions: mandateConditions || null,
      objectives:         objectives,
      open_to_deal_flow:  openToFlow,
      deal_flow_conditions: openToFlow ? (flowConditions || null) : null,
      bio:                bio || null,
      photo_consent:      photoConsent,
      is_active:          true,
    };

    // Upsert on user_id to eliminate the double-click race (audit I-C6).
    // The UNIQUE index on user_id enforces one row per investor server-side;
    // using onConflict lets a concurrent second submit update rather than
    // create a zombie duplicate.
    let saveErr;
    if (existingId) {
      ({ error: saveErr } = await supabase.from("investor_profiles").update(payload).eq("id", existingId));
    } else {
      ({ error: saveErr } = await supabase
        .from("investor_profiles")
        .upsert(payload, { onConflict: "user_id" }));
    }

    setLoading(false);
    if (saveErr) { setError(friendlyError(saveErr)); toast.error("Erreur lors de la sauvegarde"); return; }
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    setSaved(true);
    toast.success("Profil investisseur sauvegardé");
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#B8913A]/30 border-t-[#B8913A] rounded-full animate-spin"/>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#B8913A]/15 border border-[#B8913A]/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#B8913A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
            </svg>
          </div>
          <h2 className="text-white font-display text-xl font-bold mb-1">Profil enregistré</h2>
          <p className="text-white/40 text-sm">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  const progress = Math.round((step / 3) * 100);
  const currentStep = STEPS[step - 1];

  return (
    <div className="min-h-screen bg-brand-navy">
      {/* Top bar — I-L6 cleanup: single source of truth for the page title,
          existing-profile users get a back link, first-timers don't. */}
      <div className="bg-brand-navyMid border-b border-white/5 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          {existingId ? (
            <Link href="/dashboard" className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
              Mon espace
            </Link>
          ) : <div className="w-24"/>}
          <div className="text-white font-medium text-sm flex-1 text-center truncate">
            {existingId ? "Modifier mon profil investisseur" : "Créer mon profil investisseur"}
          </div>
          <div className="w-24"/>
        </div>
      </div>

      {/* Progress */}
      <div className="h-0.5 bg-white/5">
        <div className="h-full bg-[#B8913A] transition-all duration-500 ease-out" style={{ width: `${progress}%` }}/>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Onboarding banner — shown when redirected from dashboard without a profile */}
        {isOnboarding && !existingId && (
          <div className="mb-8 p-4 rounded-xl bg-[#B8913A]/8 border border-[#B8913A]/20 flex items-start gap-3">
            <svg className="w-5 h-5 text-[#B8913A] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-sm font-medium mb-1">Complétez votre profil pour des recommandations personnalisées</p>
              <p className="text-white/40 text-xs leading-relaxed">
                En renseignant vos critères d&apos;investissement, nos algorithmes mettront en avant les dossiers qui correspondent à votre mandat.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => router.push("/dashboard/deal-flow")}
                  className="text-xs text-white/30 hover:text-white/60 transition-colors underline underline-offset-2">
                  Parcourir le deal flow d&apos;abord
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step indicators */}
        <div className="flex items-center justify-center mb-10 gap-0">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center">
              <div className={`flex items-center gap-2 transition-all duration-300 ${
                step === s.n ? "opacity-100" : step > s.n ? "opacity-60" : "opacity-25"
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-all ${
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
                <div className={`w-10 sm:w-16 h-px mx-3 flex-shrink-0 transition-all ${step > s.n ? "bg-[#B8913A]/40" : "bg-white/8"}`}/>
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-7 pb-6 border-b border-white/5">
            <div className="w-10 h-10 bg-[#B8913A]/10 border border-[#B8913A]/20 rounded-xl flex items-center justify-center text-[#B8913A]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                {step === 1 && <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>}
                {step === 2 && <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M7.5 8.25h9M7.5 12H12"/>}
                {step === 3 && <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>}
              </svg>
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

          {/* ══ STEP 1: Identity & Role ══ */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Nom complet *">
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    className="form-input" placeholder="Prénom Nom"/>
                </FormField>
                <FormField label="Titre / Fonction">
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    className="form-input" placeholder="Ex : Directeur des Investissements"/>
                </FormField>
              </div>

              <FormField label="Organisation / Institution">
                <input type="text" value={organization} onChange={e => setOrg(e.target.value)}
                  className="form-input" placeholder="Ex : BNI Madagascar, I&P, DEG..."/>
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Email">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="form-input" placeholder="email@exemple.com"/>
                </FormField>
                <FormField label="Téléphone">
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    className="form-input" placeholder="+261 34 ..."/>
                </FormField>
              </div>

              <FormField label="LinkedIn">
                <input type="url" value={linkedin} onChange={e => setLinkedin(e.target.value)}
                  className="form-input" placeholder="https://linkedin.com/in/..."/>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Pays">
                  <select value={country} onChange={e => setCountry(e.target.value)} className="form-input">
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {country === "Autre" && (
                    <input type="text" value={countryOther} onChange={e => setCountryOther(e.target.value)}
                      className="form-input mt-2" placeholder="Précisez votre pays..."/>
                  )}
                </FormField>
                <FormField label="Ville">
                  <input type="text" value={city} onChange={e => setCity(e.target.value)}
                    className="form-input" placeholder="Antananarivo"/>
                </FormField>
              </div>

              {/* Role type */}
              <div>
                <label className="form-label">Votre rôle dans l&apos;écosystème *</label>
                <CardSelectWithOther
                  options={ROLE_TYPES}
                  value={roleType}
                  onChange={setRoleType}
                  otherValue={roleOther}
                  onOtherChange={setRoleOther}
                  otherPlaceholder="Précisez votre rôle..."
                  gridClass="grid-cols-1 sm:grid-cols-2"/>
              </div>
            </div>
          )}

          {/* ══ STEP 2: Investment Mandate ══ */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Sectors */}
              <div>
                <label className="form-label">
                  Secteurs prioritaires *
                  <span className="text-white/25 normal-case font-normal ml-1">(plusieurs choix)</span>
                </label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {SECTOR_OPTIONS.map(({ v, l }) => {
                    const active = sectors.includes(v);
                    return (
                      <button key={v} type="button" onClick={() => toggleChip(setSectors, v)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          active
                            ? "bg-[#B8913A]/15 border-[#B8913A]/40 text-[#B8913A]"
                            : "bg-brand-navyMid border-white/10 text-white/40 hover:border-[#B8913A]/30 hover:text-white/60"
                        }`}>
                        {l}
                      </button>
                    );
                  })}
                </div>
                {sectors.includes("other") && (
                  <input
                    type="text"
                    value={sectorOther}
                    onChange={e => setSectorOther(e.target.value)}
                    className="form-input mt-2"
                    placeholder="Précisez le secteur..."
                  />
                )}
              </div>

              {/* Ticket size */}
              <div>
                <label className="form-label">Ticket d&apos;intervention</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1.5">
                  <div>
                    <select value={currency} onChange={e => setCurrency(e.target.value)} className="form-input">
                      {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <input type="number" value={ticketMin} onChange={e => setTicketMin(e.target.value)}
                      className="form-input font-mono" placeholder="Min (ex : 100 000)" min={0}/>
                  </div>
                  <div>
                    <input type="number" value={ticketMax} onChange={e => setTicketMax(e.target.value)}
                      className="form-input font-mono" placeholder="Max (ex : 5 000 000)" min={0}/>
                  </div>
                </div>
                <p className="text-white/25 text-xs mt-1.5">Ticket minimum et maximum par opération</p>
              </div>

              {/* Duration preferences */}
              <div>
                <label className="form-label">
                  Durée d&apos;investissement préférée
                  <span className="text-white/25 normal-case font-normal ml-1">(plusieurs choix)</span>
                </label>
                <Chips
                  items={DURATION_PREFS}
                  selected={durations}
                  onToggle={v => toggleChip(setDurations, v)}
                />
              </div>

              {/* Geographic zones */}
              <div>
                <label className="form-label">
                  Zones géographiques d&apos;intervention
                  <span className="text-white/25 normal-case font-normal ml-1">(plusieurs choix)</span>
                </label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {GEO_ZONES.map(z => {
                    const active = geoZones.includes(z);
                    return (
                      <button key={z} type="button" onClick={() => toggleChip(setGeoZones, z)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          active
                            ? "bg-[#B8913A]/15 border-[#B8913A]/40 text-[#B8913A]"
                            : "bg-brand-navyMid border-white/10 text-white/40 hover:border-[#B8913A]/30 hover:text-white/60"
                        }`}>
                        {z}
                      </button>
                    );
                  })}
                </div>
                {geoZones.includes("Autre") && (
                  <input
                    type="text"
                    value={geoOther}
                    onChange={e => setGeoOther(e.target.value)}
                    className="form-input mt-2"
                    placeholder="Précisez la zone géographique..."
                  />
                )}
              </div>

              {/* Mandate conditions */}
              <FormField label="Conditions & critères de mandat" hint="Exigences particulières, conditions d'éligibilité, critères de sélection">
                <textarea value={mandateConditions} onChange={e => setMandate(e.target.value)}
                  className="form-input resize-y" rows={3}
                  placeholder="Ex : projets générant des revenus stables, présence de co-investisseurs institutionnels, garanties partielles exigées..."/>
              </FormField>
            </div>
          )}

          {/* ══ STEP 3: Network & Bio ══ */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Objectives */}
              <div>
                <label className="form-label">
                  Vos objectifs sur la plateforme
                  <span className="text-white/25 normal-case font-normal ml-1">(plusieurs choix)</span>
                </label>
                <Chips
                  items={OBJECTIVES}
                  selected={objectives}
                  onToggle={v => toggleChip(setObjectives, v)}
                />
              </div>

              {/* Open to deal flow */}
              <div>
                <label className="form-label">Ouvert à recevoir des opportunités ?</label>
                <div className="flex gap-3 mt-1.5">
                  {[
                    { v: true,  l: "Oui — je souhaite recevoir des deal flow qualifiés" },
                    { v: false, l: "Non — je ne souhaite pas être contacté pour l'instant" },
                  ].map(opt => (
                    <button key={String(opt.v)} type="button" onClick={() => setOpenToFlow(opt.v)}
                      className={`flex-1 text-left p-4 rounded-xl border-2 transition-all ${
                        openToFlow === opt.v
                          ? "border-[#B8913A] bg-[#B8913A]/8 text-white"
                          : "border-white/8 bg-brand-navyMid text-white/40 hover:border-[#B8913A]/30"
                      }`}>
                      <div className={`text-xs font-medium leading-snug ${openToFlow === opt.v ? "text-white" : ""}`}>{opt.l}</div>
                    </button>
                  ))}
                </div>
              </div>

              {openToFlow && (
                <FormField label="Conditions de mise en relation" hint="Précisez vos critères pour recevoir des opportunités pertinentes">
                  <textarea value={flowConditions} onChange={e => setFlowConditions(e.target.value)}
                    className="form-input resize-y" rows={2}
                    placeholder="Ex : projets > 500k USD, secteur énergie/agriculture, porteurs avec expérience prouvée..."/>
                </FormField>
              )}

              {/* Bio — I-M3: hard cap + live counter */}
              <FormField label="Biographie professionnelle" hint="Présentez votre parcours, expertise et vision d'investissement">
                <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 2000))}
                  maxLength={2000}
                  className="form-input resize-y" rows={4}
                  placeholder="Décrivez votre expérience, vos domaines d'expertise et ce que vous apportez aux projets que vous accompagnez..."/>
                <div className={`text-right text-[10px] mt-1 tabular-nums ${
                  bio.length > 1800 ? "text-[#B8913A]" : "text-white/25"
                }`}>
                  {bio.length} / 2000
                </div>
              </FormField>

              {/* Photo consent */}
              <div>
                <label className="form-label">Visibilité sur la plateforme</label>
                <p className="text-white/25 text-xs mb-2 leading-relaxed">
                  Votre profil peut apparaître dans notre annuaire des acteurs du financement (avec votre accord).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {PHOTO_CONSENTS.map(pc => (
                    <button key={pc.v} type="button" onClick={() => setPhotoConsent(pc.v)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        photoConsent === pc.v
                          ? "border-[#B8913A] bg-[#B8913A]/8 text-white"
                          : "border-white/8 bg-brand-navyMid text-white/50 hover:border-[#B8913A]/30"
                      }`}>
                      <div className={`font-semibold text-sm mb-0.5 ${photoConsent === pc.v ? "text-white" : ""}`}>{pc.l}</div>
                      <div className="text-xs opacity-55 leading-snug">{pc.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-brand-navyMid rounded-xl border border-white/8 text-xs text-white/30 leading-relaxed">
                En enregistrant votre profil, vous consentez à ce que vos informations soient utilisées dans le cadre des activités de mise en relation du CEO Summit Investment Hub. Vos données ne seront jamais partagées avec des tiers sans votre accord explicite.
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={() => { setError(""); setStep(s => Math.max(s - 1, 1)); }}
            disabled={step === 1}
            className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed py-3 px-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
            </svg>
            Précédent
          </button>
          <div className="text-white/45 text-sm">{step} / {STEPS.length}</div>
          {step < 3 ? (
            <button onClick={nextStep} className="btn-primary py-3 px-8">
              Suivant
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="btn-primary py-3 px-8 disabled:opacity-60">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Enregistrement...
                </span>
              ) : (
                <>
                  {existingId ? "Mettre à jour" : "Enregistrer mon profil"}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
