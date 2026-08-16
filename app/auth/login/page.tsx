"use client";

import { useState, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/friendlyError";
import Turnstile from "@/components/auth/Turnstile";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get("redirect") || "/dashboard";
  const resetSuccess  = searchParams.get("reset")   === "1";
  const accountDeleted = searchParams.get("deleted") === "1";
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // Bump this to force the widget to re-render & issue a fresh token after a
  // failed attempt (Turnstile tokens are single-use — a wrong-password retry
  // would otherwise trip a "captcha already used" 500 from Supabase).
  const [captchaKey, setCaptchaKey] = useState(0);
  const handleCaptcha = useCallback((token: string) => setCaptchaToken(token), []);
  const captchaConfigured = typeof process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY === "string"
    && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY.length > 0;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (captchaConfigured && !captchaToken) {
      setError("Veuillez compléter la vérification anti-bot ci-dessous.");
      return;
    }
    setLoading(true); setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: captchaToken ? { captchaToken } : undefined,
    });
    if (err) {
      setError(friendlyError(err));
      setLoading(false);
      // Consumed captcha token can't be reused — remount the widget.
      setCaptchaToken(null);
      setCaptchaKey(k => k + 1);
      return;
    }
    router.push(redirect);
  }

  return (
    <div className="min-h-screen ed bg-white flex items-center justify-center px-4 py-16">

      <div className="w-full max-w-md">

        {/* Logo block */}
        <div className="flex flex-col items-center mb-10">
          <img src="/landing/ceo-logo.png" alt="CEO Summit" className="h-10 w-auto mb-4"/>
          <div className="text-center">
            <div className="font-display text-[#22201B] font-semibold text-lg tracking-wide">CEO Summit IO</div>
            <div className="text-[#BC5A34] text-xs tracking-[0.15em] uppercase font-semibold mt-0.5">
              Investment Hub · Cluster Capital &amp; Finance
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E4E7EC] rounded-2xl p-8 shadow-[0_30px_60px_-40px_rgba(34,32,27,0.28)]">
          <h1 className="font-display text-2xl font-semibold text-[#22201B] mb-1">Connexion</h1>
          <p className="text-[#918A7C] text-sm mb-7">Accédez à votre espace porteur de projet</p>

          {resetSuccess && (
            <div role="status" aria-live="polite" className="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
              <svg aria-hidden="true" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Mot de passe mis à jour. Connectez-vous avec votre nouveau mot de passe.
            </div>
          )}

          {accountDeleted && (
            <div role="status" aria-live="polite" className="mb-5 p-3 bg-white border border-[#E4E7EC] rounded-lg text-[#575249] text-sm flex items-center gap-2">
              <svg aria-hidden="true" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Votre compte a bien été supprimé. À bientôt.
            </div>
          )}

          {error && (
            <div role="alert" className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <svg aria-hidden="true" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="form-label">Adresse email</label>
              <input id="email" name="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="form-input" placeholder="vous@example.com" autoComplete="email"/>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="form-label mb-0">Mot de passe</label>
                <Link href="/auth/forgot-password"
                  className="text-[#BC5A34]/80 hover:text-[#BC5A34] text-xs transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  className="form-input pr-11" placeholder="••••••••" autoComplete="current-password"/>
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-[#918A7C] hover:text-[#575249] transition-colors focus-visible:outline-none focus-visible:text-[#BC5A34]">
                  {showPassword ? (
                    <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88"/>
                    </svg>
                  ) : (
                    <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <Turnstile key={captchaKey} onToken={handleCaptcha}/>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 mt-1 disabled:opacity-60">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Connexion...
                </span>
              ) : "Se connecter"}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-[#E4E7EC] text-center text-sm text-[#918A7C]">
            Pas encore de compte ?{" "}
            <Link href="/auth/signup" className="text-[#BC5A34] hover:text-[#A44B29] font-semibold transition-colors">
              Créer un compte gratuit
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-[#918A7C] hover:text-[#575249] text-sm transition-colors flex items-center justify-center gap-1.5">
            <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm/></Suspense>;
}
