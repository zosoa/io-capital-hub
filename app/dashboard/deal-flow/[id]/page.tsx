"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, SECTOR_LABELS, STAGE_LABELS, FUNDING_TYPE_LABELS } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import type { Project } from "@/types";
import SaveToggle from "../SaveToggle";

// ─── Helpers ──────────────────────────────────────────────────
function Badge({ label, gold = false }: { label: string; gold?: boolean }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
      gold
        ? "bg-[#B8913A]/15 text-[#B8913A] border border-[#B8913A]/25"
        : "bg-white/6 text-white/40 border border-white/10"
    }`}>
      {label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-3 border-b border-white/6 last:border-0">
      <span className="text-white/35 text-sm">{label}</span>
      <span className="text-white text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

// ─── Interest button (client-side interaction) ────────────────
function InterestButton({ projectId }: { projectId: string }) {
  const [status,   setStatus]   = useState<"idle"|"already"|"submitting"|"done"|"error">("idle");
  const [message,  setMessage]  = useState("");
  const [showForm, setShowForm] = useState(false);
  const [msgText,  setMsgText]  = useState("");

  useEffect(() => {
    async function checkExisting() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("deal_interests")
        .select("id, status")
        .eq("project_id", projectId)
        .eq("investor_user_id", user.id)
        .maybeSingle();
      if (data) setStatus("already");
    }
    checkExisting();
  }, [projectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    // Server action — handles the insert AND triggers the email dispatch
    // (owner + investor + admin notifications).
    const { expressInterest } = await import("@/app/actions/project");
    const res = await expressInterest(projectId, msgText || null);
    if (res.ok) {
      setStatus("done");
    } else if (res.code === "DUPLICATE") {
      setStatus("already");
    } else {
      setStatus("error");
      setMessage(res.error);
    }
  }

  if (status === "already" || status === "done") {
    return (
      <div className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-[#B8913A]/10 border border-[#B8913A]/30 text-[#B8913A] text-sm font-medium">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
        </svg>
        {status === "done" ? "Intérêt transmis à notre équipe" : "Vous avez déjà exprimé votre intérêt"}
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-[#B8913A] hover:bg-[#9A7B3A] text-white text-sm font-semibold transition-all duration-200">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.25"/>
        </svg>
        Exprimer mon intérêt
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {status === "error" && (
        <p className="text-red-400 text-xs">{message}</p>
      )}
      <div>
        <label className="form-label text-white/40">
          Message pour notre équipe <span className="text-white/20 font-normal normal-case">(optionnel)</span>
        </label>
        <textarea
          value={msgText}
          onChange={e => setMsgText(e.target.value)}
          rows={3}
          className="form-input resize-none"
          placeholder="Précisez vos intentions, critères ou questions sur ce projet..."/>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setShowForm(false)}
          className="btn-secondary flex-none px-4 py-2.5 text-sm">
          Annuler
        </button>
        <button type="submit" disabled={status === "submitting"}
          className="btn-primary flex-1 justify-center py-2.5 text-sm disabled:opacity-60">
          {status === "submitting" ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              Envoi...
            </span>
          ) : "Confirmer mon intérêt"}
        </button>
      </div>
      <p className="text-white/45 text-xs leading-relaxed">
        Notre équipe vous contactera pour organiser une introduction avec le porteur de projet.
        Aucune information confidentielle ne sera partagée sans votre accord.
      </p>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function DealFlowDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const projectId = params.id as string;

  const [project,     setProject]     = useState<Project | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [notFound,    setNotFound]    = useState(false);
  const [initialSaved, setInitialSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data }, { data: { user } }] = await Promise.all([
        supabase
          .from("projects")
          .select("id,title,tagline,description,sector,sub_sector,stage,funding_type,amount_requested,currency,country,city,use_of_funds,years_in_operation,team_size,has_existing_revenue,job_creation_expected,impact_description,investor_type_sought,boost_score,funding_duration_range,has_collateral")
          .eq("id", projectId)
          .eq("status", "approved")
          .single(),
        supabase.auth.getUser(),
      ]);

      if (!data) { setNotFound(true); setLoading(false); return; }
      setProject(data as unknown as Project);

      if (user) {
        // Record the view (upserts via SECURITY DEFINER RPC — skips if viewer is the owner).
        supabase.rpc("record_project_view", { p_project_id: projectId });

        // Load existing save state for the header toggle.
        const { data: save } = await supabase
          .from("deal_saves")
          .select("id")
          .eq("project_id", projectId)
          .eq("user_id", user.id)
          .maybeSingle();
        if (save) setInitialSaved(true);
      }

      setLoading(false);
    }
    load();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090F] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#B8913A]/30 border-t-[#B8913A] rounded-full animate-spin"/>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="p-6 md:p-8 pt-[68px] md:pt-8 max-w-3xl mx-auto text-center">
        <h1 className="text-white font-display text-xl font-bold mb-3">Projet introuvable</h1>
        <p className="text-white/35 text-sm mb-6">Ce projet n&apos;existe pas ou n&apos;est plus disponible.</p>
        <Link href="/dashboard/deal-flow" className="btn-secondary inline-flex">← Retour au Deal Flow</Link>
      </div>
    );
  }

  const DURATION_LABELS: Record<string, string> = {
    short: "Court terme (< 2 ans)", medium: "Moyen terme (2–5 ans)",
    long: "Long terme (5–10 ans)", very_long: "Très long terme (10 ans+)",
  };

  return (
    <div className="p-6 md:p-8 pt-[68px] md:pt-8 max-w-4xl mx-auto">

      <Breadcrumb crumbs={[
        { label: "Tableau de bord", href: "/dashboard" },
        { label: "Deal Flow",       href: "/dashboard/deal-flow" },
        { label: project.title },
      ]}/>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Main content ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Header card */}
          <div className="rounded-2xl border border-white/8 bg-white/2 p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge label={SECTOR_LABELS[project.sector || ""] || project.sector || "—"} gold/>
              {project.stage && <Badge label={STAGE_LABELS[project.stage] || project.stage}/>}
              {project.funding_type && <Badge label={FUNDING_TYPE_LABELS[project.funding_type] || project.funding_type}/>}
              {project.boost_score > 0 && (
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-[#B8913A]"
                      style={{ width: `${Math.min(project.boost_score, 100)}%` }}/>
                  </div>
                  <span className="text-[10px] text-white/30 font-mono">{project.boost_score}pts</span>
                </div>
              )}
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold text-white leading-snug mb-2 break-words">
              {project.title}
            </h1>
            {project.tagline && (
              <p className="text-white/55 text-base leading-relaxed break-words">{project.tagline}</p>
            )}
          </div>

          {/* Description */}
          {project.description && (
            <div className="rounded-xl border border-white/8 bg-white/2 p-6">
              <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Description du projet</h2>
              <p className="text-white/65 text-sm leading-relaxed whitespace-pre-line">{project.description}</p>
            </div>
          )}

          {/* Use of funds */}
          {project.use_of_funds && (
            <div className="rounded-xl border border-white/8 bg-white/2 p-6">
              <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Utilisation des fonds</h2>
              <p className="text-white/65 text-sm leading-relaxed whitespace-pre-line">{project.use_of_funds}</p>
            </div>
          )}

          {/* Impact */}
          {project.impact_description && (
            <div className="rounded-xl border border-white/8 bg-white/2 p-6">
              <h2 className="text-xs font-bold text-[#B8913A]/50 uppercase tracking-widest mb-3">Impact</h2>
              <p className="text-white/65 text-sm leading-relaxed">{project.impact_description}</p>
              {project.job_creation_expected && (
                <div className="mt-3 inline-flex items-center gap-2 bg-[#B8913A]/8 border border-[#B8913A]/15 rounded-lg px-3 py-1.5 text-xs text-[#B8913A]/70">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                  </svg>
                  {project.job_creation_expected} emplois créés estimés
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">

          {/* Key figures */}
          <div className="rounded-xl border border-white/8 bg-white/2 p-5">
            <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Fiche synthèse</h2>
            <div className="divide-y divide-white/6">
              <InfoRow label="Montant recherché"
                value={project.amount_requested
                  ? <span className="text-[#C8992A] font-semibold">{formatCurrency(project.amount_requested, project.currency)}</span>
                  : null}/>
              <InfoRow label="Localisation"
                value={[project.city, project.country].filter(Boolean).join(", ")}/>
              <InfoRow label="Stade"
                value={project.stage ? STAGE_LABELS[project.stage] || project.stage : null}/>
              <InfoRow label="Type de financement"
                value={project.funding_type ? FUNDING_TYPE_LABELS[project.funding_type] || project.funding_type : null}/>
              <InfoRow label="Horizon"
                value={project.funding_duration_range ? DURATION_LABELS[project.funding_duration_range] : null}/>
              <InfoRow label="Années d'activité"
                value={project.years_in_operation ? `${project.years_in_operation} an${project.years_in_operation > 1 ? "s" : ""}` : null}/>
              <InfoRow label="Taille d'équipe"
                value={project.team_size ? `${project.team_size} personne${project.team_size > 1 ? "s" : ""}` : null}/>
              <InfoRow label="Revenus existants"
                value={project.has_existing_revenue ? "Oui" : "Non"}/>
              <InfoRow label="Garanties"
                value={project.has_collateral ? "Oui — détails sur demande" : null}/>
            </div>
          </div>

          {/* Investor types sought */}
          {project.investor_type_sought && project.investor_type_sought.length > 0 && (
            <div className="rounded-xl border border-white/8 bg-white/2 p-5">
              <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Profils recherchés</h2>
              <div className="flex flex-wrap gap-1.5">
                {project.investor_type_sought.map((t: string) => (
                  <Badge key={t} label={t}/>
                ))}
              </div>
            </div>
          )}

          {/* Interest CTA */}
          <div className="rounded-xl border border-[#B8913A]/20 bg-[#B8913A]/4 p-5">
            <h2 className="text-xs font-bold text-[#B8913A]/60 uppercase tracking-widest mb-1">Intéressé par ce projet ?</h2>
            <p className="text-white/35 text-xs leading-relaxed mb-4">
              Signalez votre intérêt à notre équipe. Nous faciliterons une introduction confidentielle.
            </p>
            <InterestButton projectId={project.id}/>
            <div className="mt-3">
              <SaveToggle projectId={project.id} initialSaved={initialSaved} variant="detail"/>
            </div>
          </div>

          {/* Confidentiality note */}
          <div className="rounded-xl border border-white/6 bg-white/2 p-4 flex items-start gap-3">
            <svg className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
            </svg>
            <p className="text-white/45 text-xs leading-relaxed">
              Les informations financières détaillées et les coordonnées du porteur ne sont partagées
              qu&apos;après validation de votre profil et accord mutuel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
