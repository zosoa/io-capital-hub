"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import "../landing.css";
import "./eligibilite.css";

const FUNDING = [
  { v: "equity", l: "Fonds propres", s: "Equity / capital" },
  { v: "debt", l: "Dette", s: "Prêt / crédit" },
  { v: "mezzanine", l: "Mezzanine", s: "Hybride dette-capital" },
  { v: "grant", l: "Subvention", s: "Non dilutif" },
  { v: "hybrid", l: "Je ne sais pas encore", s: "On vous oriente" },
];
const DURATION = [
  { v: "short", l: "moins de 2 ans" },
  { v: "medium", l: "2 – 5 ans" },
  { v: "long", l: "5 – 8 ans" },
  { v: "very_long", l: "plus de 8 ans" },
];
const SECTORS = [
  { v: "energy", l: "Énergie & Transition" },
  { v: "agriculture", l: "Agro & Industriel" },
  { v: "tech", l: "Tech & Fintech" },
  { v: "tourism", l: "Tourisme & Hôtellerie" },
  { v: "infrastructure", l: "Infrastructure & Logistique" },
  { v: "blue_economy", l: "Économie bleue" },
  { v: "mining", l: "Mines & Ressources" },
  { v: "education", l: "Savoir & Éducation" },
];
const STAGES = [
  { v: "idea", l: "Idée" },
  { v: "pre_revenue", l: "Pré-revenu" },
  { v: "early_revenue", l: "Premiers revenus" },
  { v: "growth", l: "Croissance" },
  { v: "expansion", l: "Expansion" },
];
const COUNTRIES = ["Madagascar", "Maurice", "Comores", "Seychelles", "La Réunion", "Kenya", "Afrique du Sud", "Autre / région"];
const CURRENCIES = ["USD", "EUR", "MUR", "MGA"];

const Check = ({ color = "#1E9E5A" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={color} /><path d="M7.5 12.4l2.7 2.7 6.3-6.6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Arrow = () => (
  <svg className="arw" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" /></svg>
);
const Line = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const fmt = (digits: string) => (digits ? Number(digits).toLocaleString("fr-FR") : "");
const labelOf = (arr: { v: string; l: string }[], v: string) => arr.find((x) => x.v === v)?.l ?? v;

export default function EligibilitePage() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [fundingType, setFundingType] = useState("");
  const [duration, setDuration] = useState("");
  const [sector, setSector] = useState("");
  const [country, setCountry] = useState("");
  const [stage, setStage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const step1Ok = amount.length > 0 && !!fundingType && !!duration;
  const step2Ok = !!sector && !!country && !!stage;
  const step3Ok = emailOk && consent;

  const curSymbol = useMemo(() => ({ USD: "$", EUR: "€", MUR: "₨", MGA: "Ar" }[currency] || "$"), [currency]);

  async function submit() {
    if (!step3Ok || submitting) return;
    setSubmitting(true);
    const lead = {
      email,
      full_name: name || null,
      amount_requested: amount ? Number(amount) : null,
      currency,
      funding_type: fundingType,
      funding_duration_range: duration,
      sector,
      country,
      stage,
      source: "eligibilite",
    };
    try {
      sessionStorage.setItem("capitalhub_lead", JSON.stringify(lead));
    } catch { /* private mode */ }
    // Best-effort persistence; funnel is soft, never blocks the user on failure.
    try {
      await createClient().from("leads").insert(lead);
    } catch { /* table/DB may be unavailable — lead is preserved in session */ }
    setSubmitting(false);
    setDone(true);
    window.scrollTo({ top: 0 });
  }

  const dots = [1, 2, 3].map((n) => (
    <i key={n} className={done || step > n ? "done" : step === n ? "on" : ""} />
  ));

  return (
    <div className="lp elig">
      <div className="elig-bar">
        <div className="elig-bar-in">
          <Link href="/" className="elig-brand">
            <img src="/landing/ceo-logo.png" alt="CEO Summit" />
            <b>Capital Hub</b>
          </Link>
          {!done && (
            <div className="elig-steps">
              <span className="lbl">Étape {step} sur 3</span>
              <div className="elig-dots">{dots}</div>
            </div>
          )}
        </div>
      </div>

      <div className="elig-grid">
        <div className="elig-main">
          {done ? (
            <div className="elig-result">
              <div className="result-badge"><Check /></div>
              <h1>Bonne nouvelle — votre projet correspond à nos secteurs actifs.</h1>
              <p className="rp">
                Créez votre compte pour finaliser votre dossier. Notre équipe procède à une première qualification sous
                72&nbsp;h, puis confronte votre projet aux mandats actifs du réseau — en toute confidentialité.
              </p>
              <div className="summary">
                <div className="summary-row"><span className="k">Montant recherché</span><span className="v">{curSymbol} {fmt(amount)}</span></div>
                <div className="summary-row"><span className="k">Instrument</span><span className="v">{labelOf(FUNDING, fundingType)}</span></div>
                <div className="summary-row"><span className="k">Secteur</span><span className="v">{labelOf(SECTORS, sector)}</span></div>
                <div className="summary-row"><span className="k">Pays</span><span className="v">{country}</span></div>
                <div className="summary-row"><span className="k">Stade</span><span className="v">{labelOf(STAGES, stage)}</span></div>
              </div>
              <div className="elig-nav" style={{ marginTop: 0 }}>
                <Link href="/auth/signup?from=eligibilite" className="btn btn-forest">Créer mon compte et finaliser <Arrow /></Link>
                <a href="mailto:capital@ceo-summit.mg" className="elig-back">Parler à l&apos;équipe</a>
              </div>
              <p className="result-note">Sans engagement. Aucune donnée financière ne sera partagée sans votre accord explicite.</p>
            </div>
          ) : (
            <>
              <div className="elig-eyebrow">Vérifiez votre éligibilité · 60 secondes</div>
              <h1 className="elig-h1">
                {step === 1 && "Parlons de votre besoin de financement."}
                {step === 2 && "Parlez-nous de votre projet."}
                {step === 3 && "Où pouvons-nous vous joindre ?"}
              </h1>
              <p className="elig-sub">
                {step === 1 && "Quelques réponses suffisent pour vérifier l'adéquation avec notre réseau."}
                {step === 2 && "Ces informations orientent votre dossier vers les bons mandats."}
                {step === 3 && "Nous utilisons votre email uniquement pour le suivi de votre dossier."}
              </p>
              <div className="elig-reassure"><Check /> <span>Sans engagement · votre projet n&apos;est jamais listé publiquement</span></div>

              {step === 1 && (
                <>
                  <div className="eq">
                    <div className="eq-q">Combien recherchez-vous&nbsp;?</div>
                    <div className="amount-wrap">
                      <span className="amount-cur">{curSymbol}</span>
                      <input
                        inputMode="numeric"
                        placeholder="500 000"
                        value={fmt(amount)}
                        onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 12))}
                        aria-label="Montant recherché"
                      />
                      <select className="amount-cur-sel" value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label="Devise">
                        {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="field-hint"><Line /> De 25&nbsp;000&nbsp;$ à 50&nbsp;M$ selon le secteur et le stade.</div>
                  </div>

                  <div className="eq">
                    <div className="eq-q">Quel type de financement&nbsp;?</div>
                    <div className="opt-grid cols3">
                      {FUNDING.map((o) => (
                        <button key={o.v} type="button" className={`opt${fundingType === o.v ? " sel" : ""}`} onClick={() => setFundingType(o.v)}>
                          {o.l}{o.s && <span className="opt-sub">{o.s}</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="eq">
                    <div className="eq-q">Sur quelle durée&nbsp;?</div>
                    <div className="opt-grid cols4">
                      {DURATION.map((o) => (
                        <button key={o.v} type="button" className={`opt${duration === o.v ? " sel" : ""}`} onClick={() => setDuration(o.v)}>{o.l}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="eq">
                    <div className="eq-q">Dans quel secteur&nbsp;?</div>
                    <div className="opt-grid cols2">
                      {SECTORS.map((o) => (
                        <button key={o.v} type="button" className={`opt${sector === o.v ? " sel" : ""}`} onClick={() => setSector(o.v)}>{o.l}</button>
                      ))}
                    </div>
                  </div>

                  <div className="eq">
                    <div className="eq-q">Dans quel pays&nbsp;?</div>
                    <select className="field-select" value={country} onChange={(e) => setCountry(e.target.value)}>
                      <option value="" disabled>Choisir un pays…</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="eq">
                    <div className="eq-q">À quel stade est votre projet&nbsp;?</div>
                    <div className="opt-grid cols3">
                      {STAGES.map((o) => (
                        <button key={o.v} type="button" className={`opt${stage === o.v ? " sel" : ""}`} onClick={() => setStage(o.v)}>{o.l}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="eq">
                    <div className="eq-q">Votre nom</div>
                    <input className="field-input" placeholder="Prénom et nom (facultatif)" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                  </div>
                  <div className="eq">
                    <div className="eq-q">Votre email</div>
                    <input className="field-input" type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                  </div>
                  <label className="elig-consent">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                    <span>En vérifiant mon éligibilité, j&apos;accepte les <a href="/legal/cgu">Conditions d&apos;utilisation</a> et la <a href="/legal/privacy">Politique de confidentialité</a> de Capital Hub.</span>
                  </label>
                </>
              )}

              <div className="elig-nav">
                {step > 1 && <button type="button" className="elig-back" onClick={() => setStep(step - 1)}>← Retour</button>}
                {step < 3 ? (
                  <button type="button" className="btn btn-forest" disabled={step === 1 ? !step1Ok : !step2Ok} onClick={() => { setStep(step + 1); window.scrollTo({ top: 0 }); }}>
                    Continuer <Arrow />
                  </button>
                ) : (
                  <button type="button" className="btn btn-forest" disabled={!step3Ok || submitting} onClick={submit}>
                    {submitting ? "Vérification…" : "Vérifier mon éligibilité"} <Arrow />
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <aside className="elig-side">
          <div className="side-card">
            <div className="rating">Réseau de capital privé</div>
            <div className="rating-sub">CEO Summit Indian Ocean</div>
            <ul className="side-points">
              <li><Check color="#1C3A30" /><span><b>Confidentiel par défaut.</b> Votre projet n&apos;est jamais listé publiquement.</span></li>
              <li><Check color="#1C3A30" /><span><b>Qualification humaine sous 72&nbsp;h.</b> Une équipe, pas un algorithme.</span></li>
              <li><Check color="#1C3A30" /><span><b>Mandats actifs.</b> Fonds, family offices, banques et DFIs de la région.</span></li>
              <li><Check color="#1C3A30" /><span><b>8 secteurs financés</b> à travers l&apos;Océan Indien et l&apos;Afrique.</span></li>
            </ul>
            <div className="side-logos">
              <div className="l">Soutenu par l&apos;écosystème</div>
              <div className="side-logos-row">
                <img src="/landing/logo-union-europeenne.png" alt="UE" />
                <img src="/landing/logo-undp.png" alt="UNDP" />
                <img src="/landing/logo-afd.png" alt="AFD" />
                <img src="/landing/logo-edbm.png" alt="EDBM" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
