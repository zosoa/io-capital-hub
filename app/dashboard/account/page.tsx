"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { deleteAccount, exportAccountData } from "@/app/actions/account";

// ─── Password strength indicator ─────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const len = password.length;
  const strength = len === 0 ? 0 : len < 6 ? 1 : len < 8 ? 2 : len < 12 ? 3 : 4;
  const colors = ["bg-white/8", "bg-red-400", "bg-yellow-400", "bg-[#B8913A]", "bg-green-400"];
  const labels = ["", "Trop court", "Faible", "Bon", "Fort"];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : "bg-white/8"}`}/>
        ))}
      </div>
      {len > 0 && (
        <p className={`text-xs ${strength < 2 ? "text-red-400" : strength < 3 ? "text-yellow-400" : "text-white/40"}`}>
          {labels[strength]}
        </p>
      )}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────
function Section({ title, icon, children }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#B8913A]/10 text-[#B8913A] flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <h2 className="text-white font-semibold text-sm">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function AccountPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");

  // Email change
  const [newEmail, setNewEmail]         = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Password change
  const [newPassword, setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading]       = useState(false);

  // Account deletion
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput]     = useState("");
  const [isPendingDelete, startDeleteTransition] = useTransition();

  // Data export
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email);
    });
  }, []);

  // ── Email change ─────────────────────────────────────────────
  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim() || newEmail === userEmail) return;
    setEmailLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setEmailLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Un e-mail de confirmation a été envoyé à " + newEmail);
      setNewEmail("");
    }
  }

  // ── Password change ──────────────────────────────────────────
  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("Les mots de passe ne correspondent pas."); return; }
    if (newPassword.length < 8) { toast.error("Le mot de passe doit contenir au moins 8 caractères."); return; }
    setPwdLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwdLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Mot de passe mis à jour avec succès.");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  // ── Data export ──────────────────────────────────────────────
  async function handleExport() {
    setExportLoading(true);
    try {
      const data = await exportAccountData();
      if (data.error) { toast.error(data.error); return; }
      const blob = new Blob(
        [JSON.stringify({ exported_at: new Date().toISOString(), ...data }, null, 2)],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `ceosummit-io-mes-donnees-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export téléchargé.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setExportLoading(false);
    }
  }

  // ── Account deletion ─────────────────────────────────────────
  function handleDeleteClick() {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    if (deleteInput.trim().toLowerCase() !== "supprimer") {
      toast.error("Veuillez saisir « supprimer » pour confirmer.");
      return;
    }
    startDeleteTransition(async () => {
      const result = await deleteAccount();
      if (result?.error) {
        toast.error(result.error);
        setDeleteConfirm(false);
        setDeleteInput("");
      }
      // On success, server action redirects
    });
  }

  return (
    <div className="p-6 md:p-8 pt-[68px] md:pt-8 max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1.5">Mon compte</h1>
        <p className="text-white/40 text-sm">Gérez votre e-mail, mot de passe, données et sécurité.</p>
      </div>

      <div className="space-y-5">

        {/* ── E-mail ── */}
        <Section
          title="Adresse e-mail"
          icon={
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
            </svg>
          }
        >
          <div className="mb-4">
            <p className="text-xs text-white/30 mb-1">E-mail actuel</p>
            <p className="text-white/70 text-sm font-medium">{userEmail || "—"}</p>
          </div>
          <form onSubmit={handleEmailChange} className="space-y-3">
            <div>
              <label className="form-label">Nouvel e-mail</label>
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="form-input"
                placeholder="nouveau@exemple.com"
                required
              />
              <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                Un e-mail de confirmation sera envoyé à la nouvelle adresse avant que le changement soit appliqué.
              </p>
            </div>
            <button
              type="submit"
              disabled={emailLoading || !newEmail.trim() || newEmail === userEmail}
              className="btn-primary py-2 px-5 text-sm disabled:opacity-50">
              {emailLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Envoi en cours…
                </span>
              ) : "Changer l'e-mail"}
            </button>
          </form>
        </Section>

        {/* ── Password ── */}
        <Section
          title="Mot de passe"
          icon={
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
            </svg>
          }
        >
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="form-label">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="form-input"
                placeholder="Minimum 8 caractères"
                autoComplete="new-password"
                required
              />
              <PasswordStrength password={newPassword}/>
            </div>
            <div>
              <label className="form-label">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-400 text-xs mt-1.5">Les mots de passe ne correspondent pas</p>
              )}
            </div>
            <button
              type="submit"
              disabled={pwdLoading || !newPassword || !confirmPassword}
              className="btn-primary py-2 px-5 text-sm disabled:opacity-50">
              {pwdLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Mise à jour…
                </span>
              ) : "Changer le mot de passe"}
            </button>
          </form>
        </Section>

        {/* ── Data export ── */}
        <Section
          title="Mes données"
          icon={
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
            </svg>
          }
        >
          <p className="text-white/40 text-sm leading-relaxed mb-4">
            Téléchargez une copie de toutes vos données — profil, dossiers et profil investisseur — au format JSON.
            Conformément au RGPD, vous avez le droit d&apos;accéder à vos données à tout moment.
          </p>
          <button
            type="button"
            onClick={handleExport}
            disabled={exportLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-white/60 text-sm hover:border-white/20 hover:text-white/80 transition-all disabled:opacity-50">
            {exportLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"/>
                Génération…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
                </svg>
                Exporter mes données (.json)
              </>
            )}
          </button>
        </Section>

        {/* ── Account deletion ── */}
        <Section
          title="Supprimer mon compte"
          icon={
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
            </svg>
          }
        >
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-5">
            <p className="text-red-400/80 text-xs leading-relaxed">
              <strong className="text-red-400">Attention :</strong> Cette action est irréversible. La suppression de votre compte entraîne la perte définitive de votre profil, de vos dossiers soumis et de toutes vos données.
            </p>
          </div>

          {!deleteConfirm ? (
            <button
              type="button"
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-red-400/70 text-sm hover:border-red-500/40 hover:text-red-400 transition-all">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
              </svg>
              Demander la suppression du compte
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="form-label">
                  Saisissez <span className="text-red-400 font-mono font-semibold">supprimer</span> pour confirmer
                </label>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  className="form-input border-red-500/20 focus:border-red-500/40"
                  placeholder="supprimer"
                  autoComplete="off"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={isPendingDelete || deleteInput.trim().toLowerCase() !== "supprimer"}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 disabled:opacity-40 transition-all">
                  {isPendingDelete ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"/>
                      Suppression…
                    </>
                  ) : "Confirmer la suppression"}
                </button>
                <button
                  type="button"
                  onClick={() => { setDeleteConfirm(false); setDeleteInput(""); }}
                  disabled={isPendingDelete}
                  className="px-4 py-2 rounded-lg border border-white/8 text-white/30 text-sm hover:text-white/50 hover:border-white/15 transition-all">
                  Annuler
                </button>
              </div>
            </div>
          )}
        </Section>

      </div>

      {/* Back link */}
      <div className="mt-8">
        <Link href="/dashboard" className="text-white/30 hover:text-white/60 text-sm transition-colors flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
