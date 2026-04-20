"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LogoBadge } from "@/components/ui/logo";

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [sent, setSent]           = useState(false);
  const [email, setEmail]         = useState("");

  async function resend() {
    if (!email.trim()) return;
    setResending(true);
    const supabase = createClient();
    await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-[#06080E] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="flex flex-col items-center gap-3 mb-10">
          <LogoBadge height={36}/>
          <div>
            <div className="font-bold text-white text-sm tracking-wide">CEO Summit IO</div>
            <div className="text-[#B8913A] text-xs tracking-[0.15em] uppercase mt-0.5">Investment Hub</div>
          </div>
        </Link>

        <div className="glass-card rounded-2xl p-8 border border-white/8 text-left">
          <div className="w-12 h-12 bg-[#B8913A]/10 border border-[#B8913A]/20 rounded-xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-6 h-6 text-[#B8913A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
            </svg>
          </div>

          <h1 className="font-display text-xl font-bold text-white mb-2 text-center">Vérifiez votre adresse e-mail</h1>
          <p className="text-white/40 text-sm mb-6 text-center leading-relaxed">
            Un lien de confirmation a été envoyé lors de votre inscription. Cliquez dessus pour activer votre compte.
          </p>

          {sent ? (
            <div className="p-3 bg-green-500/8 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              E-mail de confirmation renvoyé.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-white/30 text-xs">Vous n&apos;avez pas reçu l&apos;e-mail ? Renseignez votre adresse pour le renvoyer :</p>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-input"
                placeholder="votre@email.com"
              />
              <button
                onClick={resend}
                disabled={resending || !email.trim()}
                className="btn-primary w-full justify-center py-2.5 disabled:opacity-50">
                {resending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Envoi…
                  </span>
                ) : "Renvoyer le lien de confirmation"}
              </button>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-white/5 text-center">
            <Link href="/auth/login" className="text-white/30 hover:text-white/60 text-xs transition-colors">
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
