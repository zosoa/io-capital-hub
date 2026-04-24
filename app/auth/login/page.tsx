"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoBadge } from "@/components/ui/logo";
import { friendlyError } from "@/lib/friendlyError";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get("redirect") || "/dashboard";
  const resetSuccess  = searchParams.get("reset")   === "1";
  const accountDeleted = searchParams.get("deleted") === "1";
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(friendlyError(err));
      setLoading(false);
      return;
    }
    router.push(redirect);
  }

  return (
    <div className="min-h-screen bg-[#06080E] flex items-center justify-center px-4 py-16">

      <div className="w-full max-w-md">

        {/* Logo block */}
        <div className="flex flex-col items-center mb-10">
          <LogoBadge height={38} className="mb-4"/>
          <div className="text-center">
            <div className="text-white font-bold text-base tracking-wide">CEO Summit IO</div>
            <div className="text-[#B8913A] text-xs tracking-[0.15em] uppercase font-medium mt-0.5">
              Investment Hub · Cluster Capital &amp; Finance
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0D0F1C] border border-white/8 rounded-2xl p-8">
          <h1 className="font-display text-2xl font-bold text-white mb-1">Connexion</h1>
          <p className="text-white/35 text-sm mb-7">Accédez à votre espace porteur de projet</p>

          {resetSuccess && (
            <div className="mb-5 p-3 bg-green-500/8 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Mot de passe mis à jour. Connectez-vous avec votre nouveau mot de passe.
            </div>
          )}

          {accountDeleted && (
            <div className="mb-5 p-3 bg-white/5 border border-white/10 rounded-lg text-white/50 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Votre compte a bien été supprimé. À bientôt.
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 bg-red-500/8 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="form-label">Adresse email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="form-input" placeholder="vous@example.com" autoComplete="email"/>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0">Mot de passe</label>
                <Link href="/auth/forgot-password"
                  className="text-[#B8913A]/60 hover:text-[#B8913A] text-xs transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="form-input" placeholder="••••••••" autoComplete="current-password"/>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 mt-1 disabled:opacity-60">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Connexion...
                </span>
              ) : "Se connecter"}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-white/5 text-center text-sm text-white/30">
            Pas encore de compte ?{" "}
            <Link href="/auth/signup" className="text-[#B8913A] hover:text-[#C8992A] font-medium transition-colors">
              Créer un compte gratuit
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-white/20 hover:text-white/45 text-sm transition-colors flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
