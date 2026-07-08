import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import IntroActions from "./IntroActions";

type IntroRow = {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  project_id: string;
  investor_user_id: string;
  projects: { title: string; status: string } | null;
  investor: { full_name: string | null; organization: string | null; email: string | null } | null;
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending:      { label: "À traiter",  cls: "text-yellow-400 bg-yellow-400/10" },
  acknowledged: { label: "En cours",   cls: "text-blue-400 bg-blue-400/10" },
  closed:       { label: "Clôturé",    cls: "text-gray-400 bg-white/5" },
};

export default async function AdminIntrosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.status && ["pending", "acknowledged", "closed"].includes(sp.status) ? sp.status : "all";

  const supabase = await createClient();

  // deal_interests → project (title/status) + investor profile (name/org/email).
  // Two-step: fetch interests with project join, then batch-load investor profiles.
  const { data: raw } = await supabase
    .from("deal_interests")
    .select("id, status, message, created_at, project_id, investor_user_id, projects(title, status)")
    .order("created_at", { ascending: false }) as { data: Omit<IntroRow, "investor">[] | null };

  const interests = raw ?? [];
  const investorIds = Array.from(new Set(interests.map(i => i.investor_user_id)));
  const { data: profiles } = investorIds.length
    ? await supabase.from("profiles").select("id, full_name, organization, email").in("id", investorIds)
    : { data: [] as { id: string; full_name: string | null; organization: string | null; email: string | null }[] };
  const profileById = new Map((profiles ?? []).map(p => [p.id, p]));

  const rows: IntroRow[] = interests.map(i => ({
    ...i,
    investor: profileById.get(i.investor_user_id) ?? null,
  }));

  const counts = {
    all:          rows.length,
    pending:      rows.filter(r => r.status === "pending").length,
    acknowledged: rows.filter(r => r.status === "acknowledged").length,
    closed:       rows.filter(r => r.status === "closed").length,
  };

  const visible = filter === "all" ? rows : rows.filter(r => r.status === filter);

  const tabs = [
    { v: "all",          l: "Toutes",     n: counts.all },
    { v: "pending",      l: "À traiter",  n: counts.pending },
    { v: "acknowledged", l: "En cours",   n: counts.acknowledged },
    { v: "closed",       l: "Clôturées",  n: counts.closed },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Introductions</h1>
        <p className="text-gray-400 text-sm mt-1">
          Expressions d&apos;intérêt des investisseurs — facilitez les mises en relation.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(t => (
          <Link key={t.v} href={`/admin/intros${t.v !== "all" ? `?status=${t.v}` : ""}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filter === t.v ? "bg-brand-gold text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}>
            {t.l}
            {t.n > 0 && <span className="bg-white/20 rounded-full px-1.5 text-xs">{t.n}</span>}
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center border border-white/8">
          <div className="text-gray-400 font-medium mb-1">
            {counts.all === 0 ? "Aucune expression d'intérêt pour le moment" : "Aucune intro dans cette catégorie"}
          </div>
          <div className="text-gray-600 text-sm">
            {counts.all === 0
              ? "Dès qu'un investisseur exprime son intérêt pour un dossier, il apparaîtra ici."
              : <Link href="/admin/intros" className="text-brand-gold hover:underline">Voir toutes les intros</Link>}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(r => {
            const meta = STATUS_META[r.status] || STATUS_META.pending;
            return (
              <div key={r.id} className="glass-card rounded-xl border border-white/8 p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[240px]">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${meta.cls}`}>{meta.label}</span>
                      <span className="text-gray-500 text-xs">{formatDate(r.created_at)}</span>
                    </div>
                    {/* Investor → Project */}
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <span className="text-white font-medium">{r.investor?.full_name || "Investisseur"}</span>
                      {r.investor?.organization && <span className="text-gray-500 text-xs">· {r.investor.organization}</span>}
                      <svg className="w-4 h-4 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                      </svg>
                      <Link href={`/admin/projects/${r.project_id}`} className="text-brand-gold hover:underline font-medium">
                        {r.projects?.title || "Projet"}
                      </Link>
                    </div>
                    {r.investor?.email && (
                      <a href={`mailto:${r.investor.email}`} className="text-gray-500 text-xs hover:text-gray-300 transition-colors">
                        {r.investor.email}
                      </a>
                    )}
                    {r.message && (
                      <div className="mt-2 bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-gray-300 text-xs leading-relaxed">
                        « {r.message} »
                      </div>
                    )}
                  </div>
                  <IntroActions interestId={r.id} status={r.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
