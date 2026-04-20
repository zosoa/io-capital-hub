"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LogoBadge } from "@/components/ui/logo";

function PasswordStrength({ password }: { password: string }) {
  const len = password.length;
  const strength = len === 0 ? 0 : len < 6 ? 1 : len < 8 ? 2 : len < 12 ? 3 : 4;
  const colors = ["bg-white/10","bg-red-400","bg-yellow-400","bg-[#B8913A]","bg-green-400"];
  const labels = ["","Trop court","Faible","Bon","Fort"];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : "bg-white/10"}`}/>
        ))}
      </div>
      {len > 0 && <p className={`text-xs ${strength < 2 ? "text-red-400" : strength < 3 ? "text-yellow-400" : "text-white/40"}`}>{labels[strength]}</p>}
    </div>
  );
}

export default function UpdatePasswordPage() {
  const router  = useRouter();
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [checking, setChecking] = useState(true);
  const [error,    setError]    = useState("");
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    // After the user clicks the reset link, Supabase exchanges the token and
    // establishes a short-lived session.  We confirm that session is present.
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setChecking(false);
      if (session) {
        setReady(true);
      } else {
        setError("Lien de réinitialisation invalide ou expiré. Veuillez recommencer.");
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm)  { setError("Les mots de passe ne correspondent pas."); return; }
    if (password.length < 8)   { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    setLoading(true); setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    // Sign out so the user must log in with the new password
    await supabase.auth.signOut();
    router.push("/auth/login?reset=1");
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#06080E] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#B8913A]/30 border-t-[#B8913A] rounded-full animate-spin"/>
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
          <h1 className="font-display text-2xl font-bold text-white mb-1.5">Nouveau mot de passe</h1>
          <p className="text-white/40 text-sm mb-7">Choisissez un mot de passe fort pour sécuriser votre compte.</p>

          {error && (
            <div className="mb-5 p-3 bg-red-500/8 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
              {error}
              {!ready && (
                <Link href="/auth/forgot-password" className="ml-auto text-white/50 hover:text-white underline text-xs">
                  Recommencer
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Nouveau mot de passe *</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="form-input" placeholder="Minimum 8 caractères"
                autoComplete="new-password" disabled={!ready}/>
              <PasswordStrength password={password}/>
            </div>
            <div>
              <label className="form-label">Confirmer le mot de passe *</label>
              <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                className="form-input" placeholder="••••••••"
                autoComplete="new-password" disabled={!ready}/>
              {confirm && password !== confirm && (
                <p className="text-red-400 text-xs mt-1.5">Les mots de passe ne correspondent pas</p>
              )}
            </div>
            <button type="submit" disabled={loading || !ready}
              className="btn-primary w-full justify-center py-3.5 mt-1 disabled:opacity-60">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Mise à jour...
                </span>
              ) : "Mettre à jour mon mot de passe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
