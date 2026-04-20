"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LogoBadge } from "@/components/ui/logo";

function ForgotPasswordForm() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#06080E] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="flex flex-col items-center gap-3 mb-10">
            <LogoBadge height={36}/>
            <div>
              <div className="font-bold text-white text-sm tracking-wide">CEO Summit IO</div>
              <div className="text-[#B8913A] text-xs tracking-[0.15em] uppercase mt-0.5">Investment Hub · Cluster Capital &amp; Finance</div>
            </div>
          </Link>
          <div className="glass-card rounded-2xl p-10 border border-white/8">
            <div className="w-16 h-16 bg-[#B8913A]/10 border border-[#B8913A]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#B8913A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
              </svg>
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-2">Email envoyé</h1>
            <p className="text-white/40 text-sm leading-relaxed mb-2">
              Un lien de réinitialisation a été envoyé à
            </p>
            <p className="text-[#B8913A] font-medium mb-6">{email}</p>
            <p className="text-white/30 text-xs leading-relaxed mb-8">
              Cliquez sur le lien dans l&apos;email pour définir votre nouveau mot de passe.
              Le lien est valable 1 heure.
            </p>
            <Link href="/auth/login" className="btn-primary w-full justify-center py-3">
              Retour à la connexion
            </Link>
          </div>
          <p className="text-white/15 text-xs mt-4">
            Pas reçu ?{" "}
            <button onClick={() => setSent(false)} className="text-white/30 hover:text-white/50 underline transition-colors">
              Réessayer
            </button>
            {" "}ou vérifiez vos spams.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080E] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="flex flex-col items-center gap-3 mb-10">
          <LogoBadge height={36}/>
          <div className="text-center">
            <div className="font-bold text-white text-sm tracking-wide">CEO Summit IO</div>
            <div className="text-[#B8913A] text-xs tracking-[0.15em] uppercase mt-0.5">Investment Hub · Cluster Capital &amp; Finance</div>
          </div>
        </Link>

        <div className="glass-card rounded-2xl p-8 border border-white/8">
          <h1 className="font-display text-2xl font-bold text-white mb-1.5">Mot de passe oublié ?</h1>
          <p className="text-white/40 text-sm mb-7">
            Entrez votre adresse email — nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>

          {error && (
            <div className="mb-5 p-3 bg-red-500/8 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Adresse email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="form-input" placeholder="vous@example.com" autoComplete="email"/>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3.5 mt-1 disabled:opacity-60">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Envoi en cours...
                </span>
              ) : "Envoyer le lien de réinitialisation"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 text-center text-sm text-white/30">
            <Link href="/auth/login" className="text-[#B8913A] hover:text-[#C8992A] font-medium transition-colors">
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return <Suspense><ForgotPasswordForm/></Suspense>;
}
