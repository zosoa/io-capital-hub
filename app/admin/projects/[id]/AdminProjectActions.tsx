"use client";

import { useState, useTransition } from "react";
import { updateProjectStatus, saveAdminNotes } from "@/app/actions/admin";
import type { Project } from "@/types";

// `confirm` = requires a second click before firing (irreversible / notifies owner).
type ActionDef = { label: string; status: string; color: string; confirm?: boolean };

const STATUS_ACTIONS: Record<string, ActionDef[]> = {
  submitted:    [
    { label: "Mettre en revue",       status: "under_review", color: "bg-yellow-500 hover:bg-yellow-600" },
    { label: "Approuver",             status: "approved",     color: "bg-green-600 hover:bg-green-700", confirm: true },
    { label: "Refuser",               status: "rejected",     color: "bg-red-600 hover:bg-red-700",     confirm: true },
  ],
  under_review: [
    { label: "Approuver",             status: "approved",     color: "bg-green-600 hover:bg-green-700", confirm: true },
    { label: "Refuser",               status: "rejected",     color: "bg-red-600 hover:bg-red-700",     confirm: true },
  ],
  approved: [
    { label: "Marquer Financé",       status: "funded",       color: "bg-[#B8913A] hover:bg-[#9A7B3A]", confirm: true },
    { label: "Annuler approbation",   status: "under_review", color: "bg-gray-600 hover:bg-gray-700",   confirm: true },
  ],
  rejected: [
    { label: "Réexaminer",            status: "under_review", color: "bg-yellow-500 hover:bg-yellow-600" },
  ],
  // Drafts were never submitted by the owner — an admin approving one would be
  // surprising and premature. Only allow reject (to clear a stuck draft).
  draft: [
    { label: "Refuser",               status: "rejected",     color: "bg-red-600 hover:bg-red-700",     confirm: true },
  ],
};

export default function AdminProjectActions({ project }: { project: Project }) {
  const [isPending,     startTransition]  = useTransition();
  // Public note — visible to project owner as feedback
  const [notesPublic,   setNotesPublic]   = useState((project as unknown as Record<string, string>).admin_notes_public || project.admin_notes || "");
  // Internal note — confidential due-diligence, never shown to owner
  const [notesInternal, setNotesInternal] = useState((project as unknown as Record<string, string>).admin_notes_internal || "");
  const [rejection,     setRejection]     = useState(project.rejection_reason || "");
  const [msg,           setMsg]           = useState<{ text: string; ok: boolean } | null>(null);
  // Which action is awaiting a confirmation click (status key), or null.
  const [confirming,    setConfirming]    = useState<string | null>(null);

  const actions = STATUS_ACTIONS[project.status] || [];

  function handleUpdateStatus(newStatus: string, needsConfirm: boolean) {
    setMsg(null);

    // Rejecting requires a reason — surface it before the confirm step.
    if (newStatus === "rejected" && !rejection.trim()) {
      setMsg({ text: "Indiquez un motif de refus avant de refuser.", ok: false });
      return;
    }

    // Two-step confirm for irreversible / owner-notifying transitions.
    if (needsConfirm && confirming !== newStatus) {
      setConfirming(newStatus);
      return;
    }

    setConfirming(null);
    startTransition(async () => {
      try {
        await updateProjectStatus(project.id, newStatus, notesPublic, rejection || null, notesInternal);
        setMsg({ text: "Statut mis à jour ✓", ok: true });
      } catch (e) {
        setMsg({ text: "Erreur : " + (e as Error).message, ok: false });
      }
    });
  }

  function handleSaveNotes() {
    setMsg(null);
    startTransition(async () => {
      try {
        await saveAdminNotes(project.id, notesPublic, notesInternal);
        setMsg({ text: "Notes sauvegardées ✓", ok: true });
      } catch (e) {
        setMsg({ text: "Erreur : " + (e as Error).message, ok: false });
      }
    });
  }

  return (
    <div className="glass-card rounded-xl p-5 border border-brand-gold/20 bg-brand-gold/3">
      <h2 className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-4">Actions Admin</h2>

      {msg && (
        <div className={`mb-3 p-2 rounded-lg text-xs ${
          msg.ok ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
        }`}>
          {msg.text}
        </div>
      )}

      {/* Rejection reason — must be filled before "Refuser" is allowed. Shown
          whenever a reject action is available (submitted/under_review/draft)
          or the project is already rejected. */}
      {(actions.some(a => a.status === "rejected") || project.status === "rejected") && (
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1.5 block">
            Motif du refus {actions.some(a => a.status === "rejected") && <span className="text-red-400">(requis pour refuser)</span>}
          </label>
          <textarea
            value={rejection}
            onChange={e => setRejection(e.target.value)}
            className="w-full bg-brand-navyMid border border-red-500/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500/40 resize-none"
            rows={2}
            placeholder="Expliquez pourquoi le projet n'est pas retenu (visible du porteur)..."/>
        </div>
      )}

      {/* Status actions */}
      {actions.length > 0 && (
        <div className="space-y-2 mb-4">
          {actions.map(a => {
            const isConfirming = confirming === a.status;
            return (
              <button key={a.status}
                onClick={() => handleUpdateStatus(a.status, !!a.confirm)}
                onBlur={() => isConfirming && setConfirming(null)}
                disabled={isPending}
                className={`w-full py-2 px-4 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50 ${
                  isConfirming ? "bg-white/10 border border-white/25 ring-1 ring-white/20" : a.color
                }`}>
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    En cours...
                  </span>
                ) : isConfirming ? (
                  <span className="flex items-center justify-center gap-1.5">
                    Confirmer : {a.label} ?
                  </span>
                ) : a.label}
              </button>
            );
          })}
          {confirming && (
            <button
              onClick={() => setConfirming(null)}
              className="w-full py-1.5 text-gray-500 hover:text-gray-300 text-xs transition-colors">
              Annuler
            </button>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="border-t border-white/10 pt-4 space-y-3">

        {/* Public feedback — owner can see this */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block flex items-center gap-1.5">
            <svg className="w-3 h-3 text-[#B8913A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Feedback porteur <span className="text-white/25 font-normal">(visible du porteur)</span>
          </label>
          <textarea
            value={notesPublic}
            onChange={e => setNotesPublic(e.target.value)}
            className="w-full bg-brand-navyMid border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-brand-gold/40 resize-none"
            rows={3}
            placeholder="Commentaire envoyé au porteur de projet..."/>
        </div>

        {/* Internal notes — admin only */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block flex items-center gap-1.5">
            <svg className="w-3 h-3 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
            </svg>
            Notes internes <span className="text-white/25 font-normal">(confidentiel — jamais visible du porteur)</span>
          </label>
          <textarea
            value={notesInternal}
            onChange={e => setNotesInternal(e.target.value)}
            className="w-full bg-brand-navyMid border border-yellow-500/15 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-yellow-500/30 resize-none"
            rows={3}
            placeholder="Due diligence, risques, contacts investisseurs, commentaires confidentiels..."/>
        </div>

        <button
          onClick={handleSaveNotes}
          disabled={isPending}
          className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
          </svg>
          Sauvegarder les notes
        </button>
      </div>
    </div>
  );
}
