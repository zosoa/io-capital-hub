"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Turnstile from "@/components/auth/Turnstile";

import { COUNTRIES } from "@/lib/countries";
import { friendlyError } from "@/lib/friendlyError";

function PasswordStrength({ password }: { password: string }) {
  const len = password.length;
  const strength = len === 0 ? 0 : len < 6 ? 1 : len < 8 ? 2 : len < 12 ? 3 : 4;
  const colors = ["bg-[#E4E7EC]","bg-red-500","bg-yellow-500","bg-[#BC5A34]","bg-green-500"];
  const labels = ["","Trop court","Faible","Bon","Fort"];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i=>(
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : "bg-[#E4E7EC]"}`}/>
        ))}
      </div>
      {len > 0 && <p className={`text-xs ${strength < 2 ? "text-red-600" : strength < 3 ? "text-yellow-600" : "text-[#918A7C]"}`}>{labels[strength]}</p>}
    </div>
  );
}

function SignupForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const isInvestor   = searchParams.get("intent") === "investor";

  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");
  const [form, setForm] = useState({
    full_name: "", email: "", password: "", confirm_password: "",
    organization: "", job_title: "", country: "Madagascar", phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey,   setCaptchaKey]   = useState(0);
  const handleCaptcha = useCallback((token: string) => setCaptchaToken(token), []);
  // If the widget isn't configured (dev), treat as "not required".
  const captchaConfigured = typeof process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY === "string" && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY.length > 0;

  // Pre-onboarding handoff: prefill name / email / country from the /eligibilite
  // funnel (stored in sessionStorage). The full project data is carried into the
  // project wizard after signup; here we only lift the identity fields.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("capitalhub_lead");
      if (!raw) return;
      const lead = JSON.parse(raw) as { full_name?: string; email?: string; country?: string };
      setForm(f => ({
        ...f,
        full_name: f.full_name || lead.full_name || "",
        email:     f.email     || lead.email     || "",
        country:   lead.country && COUNTRIES.includes(lead.country) ? lead.country : f.country,
      }));
    } catch { /* private mode / bad JSON — ignore */ }
  }, []);

  function update(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm_password) { setError("Les mots de passe ne correspondent pas."); return; }
    if (form.password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (captchaConfigured && !captchaToken) {
      setError("Veuillez compléter la vérification anti-bot ci-dessous.");
      return;
    }
    setLoading(true); setError("");
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        // `intent` is consumed by the handle_new_user trigger to set the role
        // atomically at INSERT time — the C3 role-escalation guard blocks any
        // client-side role update, so this is the only path that actually works.
        data: {
          full_name: form.full_name,
          intent:    isInvestor ? "investor" : "client",
        },
        emailRedirectTo: `${window.location.origin}/auth/callback${isInvestor ? "?intent=investor" : ""}`,
        // Cloudflare Turnstile token — validated server-side by Supabase.
        ...(captchaToken ? { captchaToken } : {}),
      },
    });
    if (err) {
      setError(friendlyError(err));
      setLoading(false);
      setCaptchaToken(null);
      setCaptchaKey(k => k + 1);
      return;
    }

    // Save extra profile fields (role was set by the trigger, don't touch it).
    // I-H5: await + surface errors so the user isn't silently left with an
    // incomplete profile (blank organization, job_title, phone) after signup.
    if (data.user) {
      const { error: updateErr } = await supabase.from("profiles").update({
        organization: form.organization || null,
        job_title:    form.job_title    || null,
        country:      form.country,
        phone:        form.phone        || null,
      }).eq("id", data.user.id);

      if (updateErr) {
        // Soft-fail: account was created, but extra profile fields didn't
        // save. Tell the user so they can complete them later instead of
        // silently proceeding.
        setError("Compte créé, mais certaines informations de profil n'ont pas pu être enregistrées. Vous pourrez les compléter depuis votre espace.");
        // Still move forward so they aren't stuck on this screen — the
        // auth.users row exists regardless.
      }
    }

    // If email confirmation is disabled we get a session immediately → go to destination
    if (data.session) {
      router.push(isInvestor ? "/dashboard/investor-profile" : "/dashboard");
      return;
    }

    // Otherwise show the "check your inbox" screen
    setConfirmedEmail(form.email);
    setConfirmed(true);
    setLoading(false);
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.password) { setError("Tous les champs sont requis."); return; }
    if (form.password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    setError(""); setStep(2);
  }

  // ── Email confirmation screen ──────────────────────────────
  if (confirmed) {
    return (
      <div className="min-h-screen ed bg-white flex items-center justify-center px-4 py-16">
        <div className="relative z-10 w-full max-w-md text-center">
          <Link href="/" className="flex flex-col items-center gap-3 mb-10">
            <img src="/landing/ceo-logo.png" alt="CEO Summit" className="h-9 w-auto"/>
            <div>
              <div className="font-bold text-[#22201B] text-sm tracking-wide">CEO Summit IO</div>
              <div className="text-[#BC5A34] text-xs tracking-[0.15em] uppercase mt-0.5">Investment Hub · Cluster Capital &amp; Finance</div>
            </div>
          </Link>

          <div className="bg-white rounded-2xl p-10 border border-[#E4E7EC] shadow-[0_30px_60px_-40px_rgba(34,32,27,0.28)]">
            {/* Envelope icon */}
            <div className="w-16 h-16 bg-[#BC5A34]/10 border border-[#BC5A34]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#BC5A34]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
              </svg>
            </div>

            <h1 className="font-display text-2xl font-bold text-[#22201B] mb-2">Vérifiez vos emails</h1>
            <p className="text-[#918A7C] text-sm leading-relaxed mb-2">
              Un lien de confirmation a été envoyé à
            </p>
            <p className="text-[#BC5A34] font-medium mb-6">{confirmedEmail}</p>
            <p className="text-[#918A7C] text-xs leading-relaxed mb-8">
              Cliquez sur le lien dans l&apos;email pour activer votre compte, puis revenez vous connecter.
            </p>

            <Link href="/auth/login" className="btn-primary w-full justify-center py-3">
              Aller à la page de connexion
            </Link>
          </div>

          <p className="text-[#B3AA9C] text-xs mt-4">
            Pas reçu ? Vérifiez vos spams ou{" "}
            <button onClick={() => setConfirmed(false)} className="text-[#918A7C] hover:text-[#22201B]/50 underline transition-colors">
              recommencez
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ed bg-white flex items-center justify-center px-4 py-16">

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <Link href="/" className="flex flex-col items-center gap-3 mb-10">
          <img src="/landing/ceo-logo.png" alt="CEO Summit" className="h-9 w-auto"/>
          <div className="text-center">
            <div className="font-bold text-[#22201B] text-sm tracking-wide">CEO Summit IO</div>
            <div className="text-[#BC5A34] text-xs tracking-[0.15em] uppercase mt-0.5">Investment Hub · Cluster Capital &amp; Finance</div>
          </div>
        </Link>
        {isInvestor && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-px flex-1 bg-[#E4E7EC]"/>
            <span className="text-[#BC5A34]/70 text-xs font-medium tracking-wide px-3">Réseau investisseur</span>
            <div className="h-px flex-1 bg-[#E4E7EC]"/>
          </div>
        )}

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { n: 1, label: "Identifiants" },
            { n: 2, label: "Profil" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  step > s.n ? "bg-[#BC5A34] text-white" : step === s.n ? "bg-[#BC5A34]/15 border border-[#BC5A34]/40 text-[#BC5A34]" : "bg-white text-[#8A8275] border border-[#DADEE4]"
                }`}>
                  {step > s.n ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                    </svg>
                  ) : s.n}
                </div>
                <span className={`text-xs hidden sm:block transition-colors ${step === s.n ? "text-[#575249]" : "text-[#B3AA9C]"}`}>{s.label}</span>
              </div>
              {i < 1 && <div className={`w-12 h-px transition-all duration-300 ${step > 1 ? "bg-[#BC5A34]/50" : "bg-[#E4E7EC]"}`}/>}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 border border-[#E4E7EC] shadow-[0_30px_60px_-40px_rgba(34,32,27,0.28)]">
          <h1 className="font-display text-2xl font-bold text-[#22201B] mb-1.5">
            {step === 1
              ? (isInvestor ? "Rejoindre le réseau investisseur" : "Créer votre compte")
              : (isInvestor ? "Votre profil professionnel" : "Votre profil professionnel")}
          </h1>
          <p className="text-[#918A7C] text-sm mb-7">
            {step === 1
              ? (isInvestor ? "Accès gratuit · Réseau qualifié Océan Indien & Afrique" : "Accès 100% gratuit · Aucune carte bancaire requise")
              : (isInvestor ? "Ces informations nous permettent de vous envoyer les bons deals" : "Aidez-nous à mieux vous mettre en relation avec les investisseurs")}
          </p>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374l7.02-12.124c.866-1.5 3.032-1.5 3.898 0l6.588 11.375z"/>
              </svg>
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-5">
              <div>
                <label className="form-label">Nom complet *</label>
                <input type="text" required value={form.full_name} onChange={e=>update("full_name",e.target.value)}
                  className="form-input" placeholder="Jean Dupont"/>
              </div>
              <div>
                <label className="form-label">Email professionnel *</label>
                <input type="email" required value={form.email} onChange={e=>update("email",e.target.value)}
                  className="form-input" placeholder="jean@monentreprise.mg" autoComplete="email"/>
              </div>
              <div>
                <label className="form-label">Mot de passe *</label>
                <input type="password" required value={form.password} onChange={e=>update("password",e.target.value)}
                  className="form-input" placeholder="Minimum 8 caractères" autoComplete="new-password"/>
                <PasswordStrength password={form.password}/>
              </div>
              <div>
                <label className="form-label">Confirmer le mot de passe *</label>
                <input type="password" required value={form.confirm_password} onChange={e=>update("confirm_password",e.target.value)}
                  className="form-input" placeholder="••••••••" autoComplete="new-password"/>
                {form.confirm_password && form.password !== form.confirm_password && (
                  <p className="text-red-600 text-xs mt-1.5">Les mots de passe ne correspondent pas</p>
                )}
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-3.5 mt-1">
                Continuer
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                </svg>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Organisation</label>
                  <input type="text" value={form.organization} onChange={e=>update("organization",e.target.value)}
                    className="form-input" placeholder="Mon Entreprise SA"/>
                </div>
                <div>
                  <label className="form-label">Poste</label>
                  <input type="text" value={form.job_title} onChange={e=>update("job_title",e.target.value)}
                    className="form-input" placeholder="CEO / Fondateur"/>
                </div>
              </div>
              <div>
                <label className="form-label">Pays</label>
                <select value={COUNTRIES.includes(form.country) ? form.country : "Autre"}
                  onChange={e => update("country", e.target.value)} className="form-input">
                  {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                {(form.country === "Autre" || !COUNTRIES.includes(form.country)) && (
                  <input type="text"
                    value={COUNTRIES.includes(form.country) ? "" : form.country}
                    onChange={e => update("country", e.target.value)}
                    className="form-input mt-2"
                    placeholder="Précisez votre pays..."/>
                )}
              </div>
              <div>
                <label className="form-label">Téléphone</label>
                <input type="tel" value={form.phone} onChange={e=>update("phone",e.target.value)}
                  className="form-input" placeholder="+261 34 00 000 00"/>
              </div>
              <Turnstile key={captchaKey} onToken={handleCaptcha}/>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setError(""); setStep(1); }}
                  className="btn-secondary flex-1 justify-center py-3.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
                  </svg>
                  Retour
                </button>
                <button type="submit" disabled={loading}
                  className="btn-primary flex-1 justify-center py-3.5 disabled:opacity-60">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                      Création...
                    </span>
                  ) : "Créer mon compte"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[#E4E7EC] text-center text-sm text-[#918A7C]">
            {isInvestor ? "Déjà membre du réseau ?" : "Déjà inscrit ?"}{" "}
            <Link href="/auth/login" className="text-[#BC5A34] hover:text-[#A44B29] font-medium transition-colors">
              Se connecter
            </Link>
          </div>
        </div>

        <p className="text-[#8A8275] text-xs text-center mt-4 leading-relaxed">
          En créant un compte, vous acceptez nos{" "}
          <Link href="/legal/cgu" className="text-[#BC5A34]/80 hover:text-[#BC5A34] underline underline-offset-2 transition-colors">
            CGU
          </Link>
          {" "}et notre{" "}
          <Link href="/legal/privacy" className="text-[#BC5A34]/80 hover:text-[#BC5A34] underline underline-offset-2 transition-colors">
            politique de confidentialité
          </Link>.
        </p>
      </div>
    </div>
  );
}

// useSearchParams() requires a Suspense boundary for Next 15 prerendering.
export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen ed bg-white"/>}>
      <SignupForm/>
    </Suspense>
  );
}
