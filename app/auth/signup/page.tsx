"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Turnstile from "@/components/auth/Turnstile";
import { COUNTRIES } from "@/lib/countries";
import { friendlyError } from "@/lib/friendlyError";

type OAuthProvider = "google" | "apple" | "azure";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"/>
    <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 010-4.22V7.05H2.18a11 11 0 000 9.9l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 002.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"/>
  </svg>
);
const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#111" aria-hidden="true">
    <path d="M16.37 12.78c.03 3.02 2.65 4.02 2.68 4.04-.02.07-.42 1.43-1.38 2.83-.83 1.22-1.69 2.43-3.05 2.45-1.33.03-1.76-.79-3.28-.79-1.52 0-2 .77-3.26.82-1.31.05-2.31-1.32-3.15-2.53-1.71-2.48-3.02-7-1.26-10.06.87-1.52 2.43-2.48 4.12-2.51 1.29-.02 2.5.87 3.28.87.78 0 2.26-1.07 3.81-.92.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.27-2.15 3.79zM14.13 4.02c.69-.84 1.16-2 1.03-3.17-1 .04-2.2.67-2.92 1.5-.64.74-1.2 1.93-1.05 3.06 1.11.09 2.25-.56 2.94-1.39z"/>
  </svg>
);
const MicrosoftIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#F25022" d="M2 2h9.5v9.5H2z"/><path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z"/>
    <path fill="#00A4EF" d="M2 12.5h9.5V22H2z"/><path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z"/>
  </svg>
);
const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5A2.25 2.25 0 002.25 6.75m19.5 0l-9.75 6-9.75-6"/>
  </svg>
);

const SOCIAL = "w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-[#DADEE4] bg-white text-[#22201B] font-semibold text-[15px] hover:bg-[#F4F5F7] hover:border-[#C7CCD4] transition-colors disabled:opacity-60";

function PasswordStrength({ password }: { password: string }) {
  const len = password.length;
  const strength = len === 0 ? 0 : len < 6 ? 1 : len < 8 ? 2 : len < 12 ? 3 : 4;
  const colors = ["bg-[#E4E7EC]", "bg-red-500", "bg-yellow-500", "bg-[#1A5FB4]", "bg-green-500"];
  const labels = ["", "Trop court", "Faible", "Bon", "Fort"];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : "bg-[#E4E7EC]"}`} />
        ))}
      </div>
      {len > 0 && <p className={`text-xs ${strength < 2 ? "text-red-600" : strength < 3 ? "text-yellow-600" : "text-[#918A7C]"}`}>{labels[strength]}</p>}
    </div>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInvestor = searchParams.get("intent") === "investor";

  const [emailMode, setEmailMode] = useState(false);
  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");
  const [form, setForm] = useState({
    full_name: "", email: "", password: "", confirm_password: "",
    organization: "", job_title: "", country: "Madagascar", phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | "">("");
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const handleCaptcha = useCallback((token: string) => setCaptchaToken(token), []);
  const captchaConfigured = typeof process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY === "string" && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY.length > 0;

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
      if (lead.email) setEmailMode(true);
    } catch { /* ignore */ }
  }, []);

  function update(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function oauth(provider: OAuthProvider) {
    setError(""); setOauthLoading(provider);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback${isInvestor ? "?intent=investor" : ""}` },
    });
    if (err) {
      setError("Cette connexion sera bientôt disponible. Continuez avec votre email pour le moment.");
      setEmailMode(true);
      setOauthLoading("");
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm_password) { setError("Les mots de passe ne correspondent pas."); return; }
    if (form.password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (captchaConfigured && !captchaToken) { setError("Veuillez compléter la vérification anti-bot ci-dessous."); return; }
    setLoading(true); setError("");
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, intent: isInvestor ? "investor" : "client" },
        emailRedirectTo: `${window.location.origin}/auth/callback${isInvestor ? "?intent=investor" : ""}`,
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
    if (data.user) {
      const { error: updateErr } = await supabase.from("profiles").update({
        organization: form.organization || null,
        job_title:    form.job_title    || null,
        country:      form.country,
        phone:        form.phone        || null,
      }).eq("id", data.user.id);
      if (updateErr) {
        setError("Compte créé, mais certaines informations de profil n'ont pas pu être enregistrées. Vous pourrez les compléter depuis votre espace.");
      }
    }
    if (data.session) {
      router.push(isInvestor ? "/dashboard/investor-profile" : "/dashboard");
      return;
    }
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

  // ── Email confirmation (terminal) screen ──
  if (confirmed) {
    return (
      <div className="ed min-h-screen flex items-center justify-center bg-white px-4 py-16">
        <div className="w-full max-w-md text-center">
          <img src="/landing/ceo-logo.png" alt="CEO Summit" className="h-10 w-auto mx-auto mb-6" />
          <div className="bg-white rounded-2xl p-10 border border-[#E4E7EC] shadow-[0_30px_60px_-40px_rgba(20,55,110,0.28)]">
            <div className="w-16 h-16 bg-[#1A5FB4]/10 border border-[#1A5FB4]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#1A5FB4]">
              <MailIcon />
            </div>
            <h1 className="font-display text-2xl font-bold text-[#22201B] mb-2">Vérifiez vos emails</h1>
            <p className="text-[#918A7C] text-sm mb-2">Un lien de confirmation a été envoyé à</p>
            <p className="text-[#1A5FB4] font-semibold mb-6">{confirmedEmail}</p>
            <p className="text-[#918A7C] text-xs leading-relaxed mb-8">Cliquez sur le lien pour activer votre compte, puis revenez vous connecter.</p>
            <Link href="/auth/login" className="btn-primary w-full justify-center py-3.5">Aller à la connexion</Link>
          </div>
          <p className="text-[#B3AA9C] text-xs mt-4">
            Pas reçu ? Vérifiez vos spams ou{" "}
            <button onClick={() => setConfirmed(false)} className="text-[#918A7C] hover:text-[#575249] underline transition-colors">recommencez</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ed min-h-screen w-full flex bg-white">
      {/* ── Left: image panel ── */}
      <div className="hidden lg:block lg:w-[52%] relative overflow-hidden">
        <img src="/landing/auth-hero.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,55,110,0.05) 30%, rgba(15,40,85,0.72) 100%)" }} />
        <div className="absolute top-8 left-9 flex items-center gap-2.5">
          <span className="text-white font-bold text-lg tracking-tight">CEO&nbsp;Summit&nbsp;IO</span>
          <span className="text-white/70 text-[11px] tracking-[0.18em] uppercase pt-0.5">Capital&nbsp;Hub</span>
        </div>
        <div className="absolute bottom-0 left-0 p-10 pr-14">
          <h2 className="text-white font-bold text-[30px] leading-[1.15] max-w-md">
            {isInvestor
              ? "Un deal-flow qualifié, filtré selon vos critères."
              : "Présentez votre projet aux investisseurs du réseau."}
          </h2>
          <p className="text-white/75 text-sm mt-3">Réseau de financement privé · CEO Summit Indian Ocean</p>
        </div>
      </div>

      {/* ── Right: signup panel ── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-[400px]">
          <div className="flex flex-col items-center text-center mb-7">
            <img src="/landing/ceo-logo.png" alt="CEO Summit" className="h-10 w-auto mb-5" />
            {isInvestor && (
              <span className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A5FB4]/8 text-[#1A5FB4] text-xs font-semibold">
                Réseau investisseur
              </span>
            )}
            <h1 className="font-display text-[26px] font-bold text-[#22201B] leading-tight">
              {isInvestor ? "Rejoindre le réseau investisseur" : "Créer votre compte"}
            </h1>
            <p className="text-[#575249] text-[15px] mt-2">
              {isInvestor ? "Accès gratuit · Deal-flow qualifié Océan Indien & Afrique" : "Accès gratuit · Aucune carte bancaire requise"}
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">{error}</div>
          )}

          {!emailMode ? (
            <div className="space-y-3">
              <button type="button" onClick={() => oauth("google")} disabled={!!oauthLoading} className={SOCIAL}><GoogleIcon /> S&apos;inscrire avec Google</button>
              <button type="button" onClick={() => oauth("apple")} disabled={!!oauthLoading} className={SOCIAL}><AppleIcon /> S&apos;inscrire avec Apple</button>
              <button type="button" onClick={() => oauth("azure")} disabled={!!oauthLoading} className={SOCIAL}><MicrosoftIcon /> S&apos;inscrire avec Microsoft</button>
              <button type="button" onClick={() => { setError(""); setEmailMode(true); }}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-[#1A5FB4] text-white font-semibold text-[15px] hover:bg-[#154C90] transition-colors">
                <MailIcon /> S&apos;inscrire avec email
              </button>
            </div>
          ) : (
            <>
              {/* Step indicators */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {[{ n: 1, label: "Identifiants" }, { n: 2, label: "Profil" }].map((sIdx, i) => (
                  <div key={sIdx.n} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      step > sIdx.n ? "bg-[#1A5FB4] text-white" : step === sIdx.n ? "bg-[#1A5FB4]/12 border border-[#1A5FB4]/40 text-[#1A5FB4]" : "bg-[#F4F5F7] text-[#8A8275] border border-[#DADEE4]"}`}>
                      {step > sIdx.n ? "✓" : sIdx.n}
                    </div>
                    <span className={`text-xs hidden sm:block ${step === sIdx.n ? "text-[#575249]" : "text-[#918A7C]"}`}>{sIdx.label}</span>
                    {i < 1 && <div className={`w-10 h-px ${step > 1 ? "bg-[#1A5FB4]/50" : "bg-[#E4E7EC]"}`} />}
                  </div>
                ))}
              </div>

              {step === 1 ? (
                <form onSubmit={handleStep1} className="space-y-4">
                  <div>
                    <label className="form-label">Nom complet *</label>
                    <input type="text" required value={form.full_name} onChange={e => update("full_name", e.target.value)} className="form-input" placeholder="Jean Dupont" />
                  </div>
                  <div>
                    <label className="form-label">Email professionnel *</label>
                    <input type="email" required value={form.email} onChange={e => update("email", e.target.value)} className="form-input" placeholder="jean@monentreprise.mg" autoComplete="email" />
                  </div>
                  <div>
                    <label className="form-label">Mot de passe *</label>
                    <input type="password" required value={form.password} onChange={e => update("password", e.target.value)} className="form-input" placeholder="Minimum 8 caractères" autoComplete="new-password" />
                    <PasswordStrength password={form.password} />
                  </div>
                  <div>
                    <label className="form-label">Confirmer le mot de passe *</label>
                    <input type="password" required value={form.confirm_password} onChange={e => update("confirm_password", e.target.value)} className="form-input" placeholder="••••••••" autoComplete="new-password" />
                    {form.confirm_password && form.password !== form.confirm_password && <p className="text-red-600 text-xs mt-1.5">Les mots de passe ne correspondent pas</p>}
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center py-3.5">Continuer</button>
                  <button type="button" onClick={() => { setError(""); setEmailMode(false); }} className="w-full text-center text-sm text-[#918A7C] hover:text-[#575249] transition-colors">← Autres options</button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="form-label">Organisation</label>
                      <input type="text" value={form.organization} onChange={e => update("organization", e.target.value)} className="form-input" placeholder="Mon Entreprise SA" />
                    </div>
                    <div>
                      <label className="form-label">Poste</label>
                      <input type="text" value={form.job_title} onChange={e => update("job_title", e.target.value)} className="form-input" placeholder="CEO / Fondateur" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Pays</label>
                    <select value={COUNTRIES.includes(form.country) ? form.country : "Autre"} onChange={e => update("country", e.target.value)} className="form-input">
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {(form.country === "Autre" || !COUNTRIES.includes(form.country)) && (
                      <input type="text" value={COUNTRIES.includes(form.country) ? "" : form.country} onChange={e => update("country", e.target.value)} className="form-input mt-2" placeholder="Précisez votre pays..." />
                    )}
                  </div>
                  <div>
                    <label className="form-label">Téléphone</label>
                    <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} className="form-input" placeholder="+261 34 00 000 00" />
                  </div>
                  <Turnstile key={captchaKey} onToken={handleCaptcha} />
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => { setError(""); setStep(1); }} className="btn-secondary flex-1 justify-center py-3.5">Retour</button>
                    <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3.5 disabled:opacity-60">
                      {loading ? "Création..." : "Créer mon compte"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          <p className="text-[#918A7C] text-xs text-center mt-5 leading-relaxed">
            En créant un compte, vous acceptez nos{" "}
            <Link href="/legal/cgu" className="text-[#1A5FB4] hover:underline">CGU</Link>{" "}et notre{" "}
            <Link href="/legal/privacy" className="text-[#1A5FB4] hover:underline">politique de confidentialité</Link>.
          </p>

          <div className="mt-5 pt-5 border-t border-[#E4E7EC] text-center text-sm text-[#575249]">
            {isInvestor ? "Déjà membre ?" : "Déjà inscrit ?"}{" "}
            <Link href="/auth/login" className="text-[#1A5FB4] hover:text-[#154C90] font-semibold transition-colors">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SignupForm />
    </Suspense>
  );
}
