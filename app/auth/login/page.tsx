"use client";

import { useState, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/friendlyError";
import Turnstile from "@/components/auth/Turnstile";
import { KapexLogo } from "@/components/ui/logo";

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
const LockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5H6.75a1.5 1.5 0 01-1.5-1.5v-6a1.5 1.5 0 011.5-1.5z"/>
  </svg>
);

const SOCIAL = "w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-[#DADEE4] bg-white text-[#22201B] font-semibold text-[15px] hover:bg-[#F4F5F7] hover:border-[#C7CCD4] transition-colors disabled:opacity-60";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get("redirect") || "/dashboard";
  const resetSuccess  = searchParams.get("reset")   === "1";
  const accountDeleted = searchParams.get("deleted") === "1";
  const [emailMode, setEmailMode] = useState(false);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | "">("");
  const [error,    setError]    = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const handleCaptcha = useCallback((token: string) => setCaptchaToken(token), []);
  const captchaConfigured = typeof process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY === "string"
    && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY.length > 0;

  async function oauth(provider: OAuthProvider) {
    setError(""); setOauthLoading(provider);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) {
      // Provider not enabled yet in Supabase → graceful fallback to email.
      setError("Cette connexion sera bientôt disponible. Continuez avec votre email pour le moment.");
      setEmailMode(true);
      setOauthLoading("");
    }
    // On success the browser is redirected to the provider — nothing else to do.
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (captchaConfigured && !captchaToken) {
      setError("Veuillez compléter la vérification anti-bot ci-dessous.");
      return;
    }
    setLoading(true); setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email, password,
      options: captchaToken ? { captchaToken } : undefined,
    });
    if (err) {
      setError(friendlyError(err));
      setLoading(false);
      setCaptchaToken(null);
      setCaptchaKey(k => k + 1);
      return;
    }
    router.push(redirect);
  }

  return (
    <div className="ed min-h-screen w-full flex bg-white">
      {/* ── Left: image panel ── */}
      <div className="hidden lg:block lg:w-[52%] relative overflow-hidden">
        <img src="/landing/auth-hero.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,55,110,0.05) 30%, rgba(15,40,85,0.72) 100%)" }} />
        <div className="absolute top-8 left-9">
          <KapexLogo height={30} variant="light" showDescriptor={false} />
        </div>
        <div className="absolute bottom-0 left-0 p-10 pr-14">
          <h2 className="text-white font-bold text-[30px] leading-[1.15] max-w-md">
            Le portail de capital privé de l&apos;Océan Indien.
          </h2>
          <p className="text-white/75 text-sm mt-3">Une initiative du CEO Summit Indian Ocean</p>
        </div>
      </div>

      {/* ── Right: auth panel ── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-[380px]">
          <div className="flex flex-col items-center text-center mb-8">
            <KapexLogo height={32} variant="dark" className="mb-5" />
            <h1 className="font-display text-[26px] font-bold text-[#22201B] leading-tight">Se connecter ou s&apos;inscrire</h1>
            <p className="text-[#575249] text-[15px] mt-2">Accédez à votre espace KAPEX en quelques secondes.</p>
          </div>

          {resetSuccess && (
            <div role="status" className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center">
              Mot de passe mis à jour. Connectez-vous avec votre nouveau mot de passe.
            </div>
          )}
          {accountDeleted && (
            <div role="status" className="mb-4 p-3 bg-[#F4F5F7] border border-[#E4E7EC] rounded-lg text-[#575249] text-sm text-center">
              Votre compte a bien été supprimé. À bientôt.
            </div>
          )}
          {error && (
            <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          {!emailMode ? (
            <div className="space-y-3">
              <button type="button" onClick={() => oauth("google")} disabled={!!oauthLoading} className={SOCIAL}>
                <GoogleIcon /> Continuer avec Google
              </button>
              <button type="button" onClick={() => oauth("apple")} disabled={!!oauthLoading} className={SOCIAL}>
                <AppleIcon /> Continuer avec Apple
              </button>
              <button type="button" onClick={() => oauth("azure")} disabled={!!oauthLoading} className={SOCIAL}>
                <MicrosoftIcon /> Continuer avec Microsoft
              </button>
              <button type="button" onClick={() => { setError(""); setEmailMode(true); }}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-[#0C1F36] text-white font-semibold text-[15px] hover:bg-[#1B3E63] transition-colors">
                <MailIcon /> Continuer avec email
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="form-label">Adresse email</label>
                <input id="email" name="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="form-input" placeholder="vous@example.com" autoComplete="email" autoFocus />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="form-label mb-0">Mot de passe</label>
                  <Link href="/auth/forgot-password" className="text-[#0C1F36] hover:text-[#1B3E63] text-xs font-medium transition-colors">Mot de passe oublié ?</Link>
                </div>
                <div className="relative">
                  <input id="password" name="password" type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                    className="form-input pr-11" placeholder="••••••••" autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Masquer" : "Afficher"}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-[#918A7C] hover:text-[#575249] transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      {showPassword
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.22A10.48 10.48 0 001.93 12c1.29 4.34 5.31 7.5 10.07 7.5.99 0 1.95-.14 2.86-.39M6.23 6.23A10.45 10.45 0 0112 4.5c4.76 0 8.77 3.16 10.07 7.5a10.52 10.52 0 01-4.3 5.77M6.23 6.23L3 3m3.23 3.23l3.65 3.65m7.89 7.89L21 21m-3.23-3.23l-3.65-3.65m0 0a3 3 0 10-4.24-4.24m4.24 4.24L9.88 9.88"/>
                        : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.04 12.32a1 1 0 010-.64C3.42 7.51 7.36 4.5 12 4.5c4.64 0 8.57 3.01 9.96 7.18.07.21.07.43 0 .64C20.58 16.49 16.64 19.5 12 19.5c-4.64 0-8.57-3.01-9.96-7.18z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></>}
                    </svg>
                  </button>
                </div>
              </div>
              <Turnstile key={captchaKey} onToken={handleCaptcha} />
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-60">
                {loading ? "Connexion..." : "Se connecter"}
              </button>
              <button type="button" onClick={() => { setError(""); setEmailMode(false); }}
                className="w-full text-center text-sm text-[#918A7C] hover:text-[#575249] transition-colors">
                ← Autres options de connexion
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-1.5 mt-6 text-[#918A7C] text-xs">
            <LockIcon /> Vos données sont sécurisées et strictement confidentielles.
          </div>

          <p className="text-[#918A7C] text-xs text-center mt-4 leading-relaxed">
            En continuant, vous acceptez nos{" "}
            <Link href="/legal/cgu" className="text-[#0C1F36] hover:underline">Conditions d&apos;utilisation</Link>{" "}et notre{" "}
            <Link href="/legal/privacy" className="text-[#0C1F36] hover:underline">Politique de confidentialité</Link>.
          </p>

          <div className="mt-6 pt-5 border-t border-[#E4E7EC] text-center text-sm text-[#575249]">
            Pas encore de compte ?{" "}
            <Link href="/auth/signup" className="text-[#0C1F36] hover:text-[#1B3E63] font-semibold transition-colors">Créer un compte gratuit</Link>
          </div>
          <div className="text-center mt-5">
            <Link href="/" className="text-[#918A7C] hover:text-[#575249] text-sm transition-colors">← Retour à l&apos;accueil</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
