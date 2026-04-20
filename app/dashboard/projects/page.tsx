import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatCurrency, formatDate, STATUS_CONFIG, SECTOR_LABELS, FUNDING_TYPE_LABELS } from "@/lib/utils";
import type { Project } from "@/types";

function getDealRef(id: string): string {
  return `CSIH-${id.replace(/-/g, "").substring(0, 6).toUpperCase()}`;
}

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: projects } = await supabase
    .from("projects").select("*").eq("user_id", user!.id)
    .order("updated_at", { ascending: false }) as { data: Project[] | null };

  return (
    <div className="p-6 md:p-8 pt-[68px] md:pt-8 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F1320]">Mes dossiers</h1>
          <p className="text-[#7A8098] text-sm mt-1">
            {projects?.length || 0} dossier{(projects?.length || 0) !== 1 ? "s" : ""} au total
          </p>
        </div>
        <Link href="/dashboard/projects/new" className="btn-primary flex-shrink-0 text-sm py-2.5 px-5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
          </svg>
          Nouveau dossier
        </Link>
      </div>

      {/* ── Pipeline legend ── */}
      <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1">
        {["draft","submitted","under_review","approved","funded"].map((s, i) => {
          const cfg   = STATUS_CONFIG[s];
          const count = projects?.filter(p => p.status === s).length || 0;
          return (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-opacity ${
                count > 0
                  ? `${cfg.color} ${cfg.bg} border-current/20 opacity-100`
                  : "text-[#C0BAB2] border-[#DDD8D0] bg-transparent opacity-60"
              }`}>
                {count > 0 && <span>{count}</span>}
                {cfg.label}
              </div>
              {i < 4 && (
                <svg className="w-3 h-3 text-[#C8C0B5] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Empty state ── */}
      {(!projects || projects.length === 0) ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 bg-[#B8913A]/8 border border-[#B8913A]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[#B8913A]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z"/>
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-[#0F1320] mb-2">Aucun dossier pour le moment</h2>
          <p className="text-[#7A8098] text-sm mb-6">Soumettez votre premier dossier de financement en quelques minutes</p>
          <Link href="/dashboard/projects/new" className="btn-primary inline-flex">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            Créer un dossier
          </Link>
        </div>

      ) : (
        /* ── Project cards ── */
        <div className="space-y-3">
          {projects.map(p => {
            const cfg = STATUS_CONFIG[p.status] || { label: p.status, color: "text-[#5A6280]", bg: "bg-[#5A6280]/10" };
            return (
              <Link key={p.id} href={`/dashboard/projects/${p.id}`}
                className="block card hover:border-[#B8913A]/40 hover:shadow-sm transition-all duration-200 group overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Logo badge */}
                      <div className="w-11 h-11 rounded-xl border-2 border-[#E8D9B5] bg-[#B8913A]/8 flex items-center justify-center flex-shrink-0 overflow-hidden mt-0.5">
                        {p.project_logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.project_logo_url} alt={p.title} className="w-full h-full object-cover"/>
                        ) : (
                          <span className="text-[#B8913A] font-bold text-base">{p.title.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                      {/* Deal ref + status */}
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[#B8A898] text-xs font-mono tracking-wide">{getDealRef(p.id)}</span>
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold tracking-wide ${cfg.color} ${cfg.bg}`}>
                          {cfg.label}
                        </span>
                      </div>

                      <h3 className="text-[#0F1320] font-semibold group-hover:text-[#B8913A] transition-colors truncate">
                        {p.title}
                      </h3>
                      {p.tagline && (
                        <p className="text-[#8A8FA8] text-sm mt-0.5 truncate">{p.tagline}</p>
                      )}

                      {/* Meta tags */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[#9A9FAF]">
                        {p.sector && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/>
                            </svg>
                            {SECTOR_LABELS[p.sector] || p.sector}
                          </span>
                        )}
                        {p.funding_type && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            {FUNDING_TYPE_LABELS[p.funding_type] || p.funding_type}
                          </span>
                        )}
                        {p.country && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                            </svg>
                            {p.country}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          {formatDate(p.updated_at)}
                        </span>
                      </div>
                      </div>{/* close inner flex-1 */}
                    </div>{/* close logo + text flex */}

                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                      {p.amount_requested && (
                        <div className="text-[#0F1320] font-bold tabular-nums">
                          {formatCurrency(p.amount_requested, p.currency)}
                        </div>
                      )}
                      {(p.boost_score > 0) && (
                        <div className="flex items-center gap-1 text-[10px] text-[#B8913A] font-semibold">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
                          </svg>
                          {p.boost_score}/100
                        </div>
                      )}
                      <svg className="w-4 h-4 text-[#C8C0B5] group-hover:text-[#B8913A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Footer banners */}
                {p.status === "draft" && (
                  <div className="px-5 py-2 bg-amber-50 border-t border-amber-100 text-xs text-amber-600 flex items-center gap-1.5">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                    </svg>
                    Brouillon — complétez et soumettez pour mise en avant auprès des investisseurs
                  </div>
                )}
                {p.status === "rejected" && p.rejection_reason && (
                  <div className="px-5 py-2 bg-red-50 border-t border-red-100 text-xs text-red-600">
                    {p.rejection_reason}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
