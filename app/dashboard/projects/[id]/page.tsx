import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate, STATUS_CONFIG, SECTOR_LABELS, FUNDING_TYPE_LABELS, STAGE_LABELS } from "@/lib/utils";
import type { Project } from "@/types";
import WithdrawButton from "./WithdrawButton";

function getDealRef(id: string): string {
  return `CSIH-${id.replace(/-/g, "").substring(0, 6).toUpperCase()}`;
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-start py-3 border-b border-[#EDE7DE] last:border-0">
      <span className="text-[#8A8FA8] text-sm">{label}</span>
      <span className="text-[#0F1320] text-sm font-semibold text-right max-w-[60%]">{value}</span>
    </div>
  );
}

// ─── Status pipeline ──────────────────────────────────────────
const PIPELINE_STEPS = [
  { key: "draft",        label: "Brouillon" },
  { key: "submitted",    label: "Soumis" },
  { key: "under_review", label: "En revue" },
  { key: "approved",     label: "Qualifié" },
  { key: "funded",       label: "Financé" },
];

function StatusPipeline({ status }: { status: string }) {
  const activeIdx  = PIPELINE_STEPS.findIndex(s => s.key === status);
  const isRejected = status === "rejected";
  if (isRejected) return null;

  return (
    <div className="flex items-center gap-0 mb-6 overflow-x-auto pb-1">
      {PIPELINE_STEPS.map((s, i) => {
        const done    = activeIdx > i;
        const current = activeIdx === i;
        return (
          <div key={s.key} className="flex items-center flex-shrink-0">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              current ? "bg-[#B8913A]/10 border border-[#B8913A]/25 text-[#B8913A]" :
              done    ? "text-[#7A8098]" :
                        "text-[#C0BAB2]"
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-semibold ${
                done    ? "bg-[#B8913A]/15 text-[#B8913A]" :
                current ? "bg-[#B8913A] text-white" :
                          "bg-[#EDE7DE] text-[#C0BAB2]"
              }`}>
                {done ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  </svg>
                ) : i + 1}
              </span>
              <span className="hidden sm:block">{s.label}</span>
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <div className={`w-6 h-px flex-shrink-0 transition-all ${done ? "bg-[#B8913A]/30" : "bg-[#DDD8D0]"}`}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Status banner colours ────────────────────────────────────
function getBannerStyle(status: string) {
  if (status === "approved" || status === "funded")
    return { wrap: "bg-green-50 border-green-200",  icon: "text-green-600", title: "text-green-800",  desc: "text-green-700" };
  if (status === "rejected")
    return { wrap: "bg-red-50 border-red-200",      icon: "text-red-500",   title: "text-red-800",   desc: "text-red-600" };
  return   { wrap: "bg-[#FBF8F3] border-[#E8D9B5]", icon: "text-[#B8913A]", title: "text-[#0F1320]", desc: "text-[#7A8098]" };
}

// ─── Status icons ─────────────────────────────────────────────
const StatusIcons: Record<string, React.ReactNode> = {
  draft: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>
    </svg>
  ),
  submitted: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
    </svg>
  ),
  under_review: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
    </svg>
  ),
  approved: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  rejected: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  funded: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"/>
    </svg>
  ),
};

// ─── Activité card — engagement + status history (B6) ────────
const STATUS_LABELS_FR: Record<string, string> = {
  draft: "Brouillon", submitted: "Soumis", under_review: "En revue",
  approved: "Qualifié", rejected: "Non retenu", funded: "Financé",
  withdrawn: "Retiré", closed: "Clôturé",
};

function ActivityMetric({ label, value, tone = "neutral" }: {
  label: string; value: number;
  tone?: "neutral" | "gold" | "emerald";
}) {
  const toneCls = tone === "gold"
    ? "text-[#B8913A]"
    : tone === "emerald" ? "text-emerald-600" : "text-[#0F1320]";
  return (
    <div className="flex-1 min-w-0 text-center sm:text-left">
      <div className={`font-display text-2xl font-bold tabular-nums ${toneCls}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-[#9A9FAF] font-semibold mt-0.5">{label}</div>
    </div>
  );
}

function ActivityCard({
  status, views, saves, interests, history,
}: {
  status: string; views: number; saves: number; interests: number;
  history: { id: string; action: string; created_at: string; metadata: { admin_notes_public?: string | null } | null }[];
}) {
  const isApproved = status === "approved" || status === "funded";
  // Nothing to show before a project is ever touched by admin
  if (history.length === 0 && !isApproved) return null;

  return (
    <div className="rounded-xl border border-[#E8E2D9] bg-white p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] font-bold text-[#B8A898] uppercase tracking-widest">Activité</div>
          <div className="text-[#7A8098] text-xs mt-0.5">
            {isApproved
              ? "Engagement des investisseurs et historique de votre dossier."
              : "Historique de traitement de votre dossier."}
          </div>
        </div>
      </div>

      {/* Engagement metrics — only meaningful once the project is live */}
      {isApproved && (
        <div className="flex flex-wrap gap-4 sm:gap-6 pb-4 mb-4 border-b border-[#EDE7DE]">
          <ActivityMetric label="Vues investisseurs"   value={views}     tone="neutral"/>
          <ActivityMetric label="Sauvegardes"          value={saves}     tone="gold"/>
          <ActivityMetric label="Intérêts exprimés"    value={interests} tone="emerald"/>
        </div>
      )}

      {/* Status history */}
      {history.length > 0 ? (
        <div className="space-y-2.5">
          <div className="text-[10px] font-bold text-[#B8A898] uppercase tracking-widest mb-2">
            Historique des statuts
          </div>
          {history.map(evt => {
            const newStatus = evt.action.replace("status_changed_to_", "");
            const label = STATUS_LABELS_FR[newStatus] || newStatus;
            const note  = evt.metadata?.admin_notes_public;
            return (
              <div key={evt.id} className="flex items-start gap-3 text-sm">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#B8913A] mt-1.5"/>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[#0F1320] font-medium">{label}</span>
                    <span className="text-[#9A9FAF] text-xs">{formatDate(evt.created_at)}</span>
                  </div>
                  {note && <p className="text-[#7A8098] text-xs mt-0.5 leading-relaxed">{note}</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : isApproved && (
        <p className="text-[#9A9FAF] text-xs italic">Aucun événement enregistré pour le moment.</p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
type ActivityEvent = {
  id: string;
  action: string;
  created_at: string;
  metadata: { admin_notes_public?: string | null; rejection_reason?: string | null } | null;
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: project } = await supabase
    .from("projects").select("*").eq("id", id).eq("user_id", user!.id).single() as { data: Project | null };

  if (!project) notFound();

  // ── B6 — engagement metrics + status history for the Activité block ──
  const [viewsRes, savesRes, interestsRes, historyRes] = await Promise.all([
    supabase.from("project_views").select("viewer_id", { count: "exact", head: true }).eq("project_id", project.id),
    supabase.from("deal_saves").select("id", { count: "exact", head: true }).eq("project_id", project.id),
    supabase.from("deal_interests").select("id", { count: "exact", head: true }).eq("project_id", project.id),
    supabase.from("activity_log")
      .select("id, action, created_at, metadata")
      .eq("target_type", "project")
      .eq("target_id", project.id)
      .like("action", "status_changed_to_%")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  const viewsCount     = viewsRes.count ?? 0;
  const savesCount     = savesRes.count ?? 0;
  const interestsCount = interestsRes.count ?? 0;
  const history        = (historyRes.data ?? []) as ActivityEvent[];

  const cfg     = STATUS_CONFIG[project.status] || { label: project.status, color: "text-[#8A8FA8]", bg: "bg-[#F0EEE9]" };
  const banner  = getBannerStyle(project.status);
  const dealRef = getDealRef(project.id);

  const statusMessages: Record<string, { title: string; desc: string }> = {
    draft:        { title: "Brouillon",          desc: "Votre dossier est en cours de rédaction. Soumettez-le pour qu'il soit examiné par notre équipe." },
    submitted:    { title: "Soumis",             desc: "Votre dossier a été soumis avec succès. Notre équipe va l'examiner dans les 48 heures ouvrables." },
    under_review: { title: "En cours d'examen",  desc: "Notre équipe examine votre dossier. Nous vous contacterons si nous avons besoin d'informations supplémentaires." },
    approved:     { title: "Dossier qualifié",   desc: "Félicitations — votre dossier a été validé et est maintenant présenté à notre réseau d'investisseurs." },
    rejected:     { title: "Non retenu",         desc: "Votre dossier n'a pas été retenu pour cette session. Consultez les retours de notre équipe pour améliorer votre présentation." },
    funded:       { title: "Financement obtenu", desc: "Félicitations — votre projet a trouvé son financement via CEO Summit IO — Investment Hub." },
  };
  const sm = statusMessages[project.status];

  return (
    <div className="p-6 md:p-8 pt-[68px] md:pt-8 max-w-4xl mx-auto">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/dashboard/projects"
          className="text-[#9A9FAF] hover:text-[#B8913A] transition-colors flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Mes dossiers
        </Link>
        <span className="text-[#C8C0B5]">/</span>
        <span className="text-[#0F1320] font-medium truncate">{project.title}</span>
      </div>

      {/* ── Status pipeline ── */}
      <StatusPipeline status={project.status}/>

      {/* ── Status banner ── */}
      {sm && (
        <div className={`rounded-xl p-5 mb-6 border ${banner.wrap}`}>
          <div className="flex items-start gap-3">
            <span className={`flex-shrink-0 mt-0.5 ${banner.icon}`}>
              {StatusIcons[project.status]}
            </span>
            <div className="flex-1">
              <div className={`font-semibold mb-0.5 ${banner.title}`}>{sm.title}</div>
              <p className={`text-sm ${banner.desc}`}>{sm.desc}</p>
              {(project.admin_notes_public || project.admin_notes) && (
                <div className="mt-3 p-3 bg-white/60 rounded-lg border border-[#E8E2D9]">
                  <div className="text-xs text-[#8A8FA8] mb-1 font-semibold uppercase tracking-wider">Note de l&apos;équipe</div>
                  <p className="text-[#0F1320] text-sm">{project.admin_notes_public || project.admin_notes}</p>
                </div>
              )}
              {project.status === "rejected" && (
                <div className="mt-4 flex gap-2">
                  <Link href={`/dashboard/projects/${project.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/>
                    </svg>
                    Réviser et resubmettre
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── B6 — Activité / engagement metrics ── */}
      <ActivityCard
        status={project.status}
        views={viewsCount}
        saves={savesCount}
        interests={interestsCount}
        history={history}
      />

      {/* ── Project header ── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Logo badge */}
          <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden border-2 border-[#E8D9B5] bg-[#B8913A]/10 flex items-center justify-center">
            {project.project_logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.project_logo_url} alt={project.title} className="w-full h-full object-cover"/>
            ) : (
              <span className="text-[#B8913A] font-bold text-xl">{project.title.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-[#B8A898] text-xs font-mono tracking-wide">{dealRef}</span>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold tracking-wide ${cfg.color} ${cfg.bg}`}>
                {cfg.label}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-[#0F1320]">{project.title}</h1>
            {project.tagline && <p className="text-[#7A8098] mt-1">{project.tagline}</p>}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {project.status === "approved" && (
            <Link href={`/dashboard/projects/${project.id}/apercu`}
              className="btn-outline-gold text-sm py-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Aperçu investisseur
            </Link>
          )}
          {project.status !== "approved" && project.status !== "funded" && (
            <Link href={`/dashboard/projects/${project.id}/edit`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 text-sm transition-all">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/>
              </svg>
              Modifier
            </Link>
          )}
        </div>
      </div>

      {/* ── Content grid ── */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Main column */}
        <div className="md:col-span-2 space-y-4">

          {project.description && (
            <div className="card p-5">
              <h2 className="text-[10px] font-bold text-[#B8A898] uppercase tracking-widest mb-3">Description</h2>
              <p className="text-[#3A3F52] text-sm leading-relaxed whitespace-pre-line">{project.description}</p>
            </div>
          )}

          <div className="card p-5">
            <h2 className="text-[10px] font-bold text-[#B8A898] uppercase tracking-widest mb-1">Projet</h2>
            <InfoRow label="Secteur"             value={SECTOR_LABELS[project.sector || ""] || project.sector}/>
            <InfoRow label="Stade"               value={STAGE_LABELS[project.stage || ""] || project.stage}/>
            <InfoRow label="Localisation"        value={project.city ? `${project.city}, ${project.country}` : project.country}/>
            <InfoRow label="Structure juridique" value={project.legal_structure}/>
            <InfoRow label="Années d'existence"  value={project.years_in_operation ? `${project.years_in_operation} an(s)` : null}/>
            <InfoRow label="Équipe"              value={project.team_size ? `${project.team_size} personne(s)` : null}/>
          </div>

          <div className="card p-5">
            <h2 className="text-[10px] font-bold text-[#B8A898] uppercase tracking-widest mb-1">Financement recherché</h2>
            <InfoRow label="Type"    value={FUNDING_TYPE_LABELS[project.funding_type || ""] || project.funding_type}/>
            <InfoRow label="Montant" value={formatCurrency(project.amount_requested, project.currency)}/>
            <InfoRow label="Durée"   value={project.funding_term_months ? `${project.funding_term_months} mois` : null}/>
            {project.use_of_funds && (
              <div className="pt-3">
                <div className="text-[10px] font-bold text-[#B8A898] uppercase tracking-widest mb-1.5">Utilisation des fonds</div>
                <p className="text-[#3A3F52] text-sm leading-relaxed">{project.use_of_funds}</p>
              </div>
            )}
          </div>

          {(project.has_collateral || project.collateral_description) && (
            <div className="card p-5">
              <h2 className="text-[10px] font-bold text-[#B8A898] uppercase tracking-widest mb-1">Atouts & Garanties</h2>
              <InfoRow label="Type"           value={project.collateral_type?.split(", ").map((t: string) => t).join(" · ")}/>
              <InfoRow label="Valeur estimée" value={project.collateral_value ? formatCurrency(project.collateral_value, project.currency) : null}/>
              {project.collateral_description && (
                <div className="pt-2 mt-1">
                  <p className="text-[#3A3F52] text-sm leading-relaxed">{project.collateral_description}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Amount summary */}
          <div className="card p-5">
            <h2 className="text-[10px] font-bold text-[#B8A898] uppercase tracking-widest mb-3">Récapitulatif</h2>
            {project.amount_requested && (
              <div className="text-center py-3 border-b border-[#EDE7DE] mb-3">
                <div className="text-2xl font-bold text-[#B8913A]">{formatCurrency(project.amount_requested, project.currency)}</div>
                <div className="text-[#9A9FAF] text-xs mt-1">Financement recherché</div>
              </div>
            )}
            <InfoRow label="Soumis le"  value={formatDate(project.submitted_at)}/>
            <InfoRow label="Mis à jour" value={formatDate(project.updated_at)}/>
          </div>

          {/* Draft CTA */}
          {project.status === "draft" && (
            <div className="card p-5 border-[#E8D9B5] bg-[#FBF8F3]">
              <h3 className="text-[#B8913A] font-semibold text-sm mb-2">Prochaine étape</h3>
              <p className="text-[#7A8098] text-xs mb-3 leading-relaxed">
                Finalisez votre dossier et soumettez-le pour examen par notre équipe sous 48h.
              </p>
              <Link href={`/dashboard/projects/${project.id}/edit`} className="btn-primary w-full justify-center text-sm py-2.5">
                Continuer le dossier
              </Link>
            </div>
          )}

          {/* Boost CTA — shown once submitted */}
          {(project.status === "submitted" || project.status === "under_review" || project.status === "approved") && (
            <Link href={`/dashboard/projects/${project.id}/boost`}
              className="card p-5 border-[#E8D9B5] bg-[#FBF8F3] hover:border-[#B8913A]/40 hover:shadow-sm transition-all group block">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-[#B8913A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
                    </svg>
                    <h3 className="text-[#B8913A] font-semibold text-sm">Boostez votre visibilité</h3>
                  </div>
                  <p className="text-[#7A8098] text-xs leading-relaxed">
                    Complétez votre profil pour maximiser vos chances d&apos;être mis en relation avec les bons investisseurs.
                  </p>
                </div>
                {/* Score ring */}
                <div className="flex-shrink-0 relative w-14 h-14">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#EDE7DE" strokeWidth="4"/>
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#B8913A" strokeWidth="4"
                      strokeDasharray={`${((project.boost_score ?? 0) / 100) * 113} 113`}
                      strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-[#B8913A] font-bold text-sm leading-none">{project.boost_score ?? 0}</div>
                    <div className="text-[#C0BAB2] text-[8px] leading-none mt-0.5">/ 100</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-[#B8913A]/70 font-medium group-hover:text-[#B8913A] transition-colors">
                Compléter mon dossier
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                </svg>
              </div>
            </Link>
          )}

          {/* Impact */}
          {(project.job_creation_expected || project.impact_description) && (
            <div className="card p-5">
              <h2 className="text-[10px] font-bold text-[#B8A898] uppercase tracking-widest mb-3">Impact</h2>
              {project.job_creation_expected && (
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-[#B8913A]">{project.job_creation_expected}</span>
                  <span className="text-[#9A9FAF] text-xs">emplois créés estimés</span>
                </div>
              )}
              {project.impact_description && (
                <p className="text-[#7A8098] text-xs leading-relaxed">{project.impact_description}</p>
              )}
            </div>
          )}

          {/* Investor view link */}
          {project.status === "approved" && (
            <Link href={`/dashboard/projects/${project.id}/apercu`}
              className="card p-5 border-[#E8D9B5] hover:border-[#B8913A]/40 hover:shadow-sm transition-all group flex items-center justify-between">
              <div>
                <div className="text-[#B8913A] font-semibold text-sm mb-0.5">Aperçu investisseur</div>
                <div className="text-[#9A9FAF] text-xs">Vue telle que présentée</div>
              </div>
              <svg className="w-4 h-4 text-[#C8C0B5] group-hover:text-[#B8913A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
              </svg>
            </Link>
          )}

          {/* F8 — Withdraw option for non-terminal, non-approved statuses */}
          {["draft","submitted","under_review","rejected"].includes(project.status) && (
            <div className="card p-4">
              <WithdrawButton projectId={project.id}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
