import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { NotificationRow } from "@/types";
import NotificationListActions from "./NotificationListActions";

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

function accent(type: string): { bg: string; dot: string; label: string } {
  if (type.startsWith("admin."))
    return { bg: "bg-amber-500/5 border-amber-500/20", dot: "bg-amber-400", label: "Admin" };
  if (type === "project.approved" || type === "project.funded")
    return { bg: "bg-emerald-500/5 border-emerald-500/20", dot: "bg-emerald-400", label: "Bonne nouvelle" };
  if (type === "project.rejected")
    return { bg: "bg-red-500/5 border-red-500/20", dot: "bg-red-400", label: "À revoir" };
  if (type === "project.interest_received" || type === "interest.submitted" || type === "digest.weekly")
    return { bg: "bg-[#B8913A]/5 border-[#B8913A]/20", dot: "bg-[#B8913A]", label: "Deal flow" };
  return { bg: "bg-white/3 border-white/8", dot: "bg-white/40", label: "Info" };
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: rows } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient", user.id)
    .order("created_at", { ascending: false })
    .limit(100) as { data: NotificationRow[] | null };

  const items    = rows ?? [];
  const unread   = items.filter(r => !r.read_at).length;

  return (
    <div className="p-6 md:p-8 pt-[68px] md:pt-8 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1.5">Notifications</h1>
          <p className="text-white/40 text-sm">
            {items.length === 0
              ? "Aucune notification pour le moment."
              : unread > 0
                ? <>{unread} non lue{unread > 1 ? "s" : ""} sur {items.length}</>
                : <>Tout est à jour · {items.length} notification{items.length > 1 ? "s" : ""}</>}
          </p>
        </div>
        <NotificationListActions hasUnread={unread > 0}/>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-white/8 bg-white/3 p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center mx-auto mb-4 text-white/40">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
            </svg>
          </div>
          <p className="text-white/45 text-sm">
            Vous recevrez ici les mises à jour sur vos dossiers, les expressions d&apos;intérêt et les messages de notre équipe.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(n => {
            const a = accent(n.type);
            const link = (n.data as { link?: string })?.link;
            const content = (
              <div className={`rounded-xl border p-4 transition-colors ${a.bg} ${!n.read_at ? "ring-1 ring-[#B8913A]/30" : ""} hover:border-white/20`}>
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${n.read_at ? "bg-white/15" : a.dot}`}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/45">{a.label}</span>
                      <span className="text-[10px] text-white/25">{formatDateTime(n.created_at)}</span>
                      {!n.read_at && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B8913A]">Non lu</span>
                      )}
                    </div>
                    <h2 className="text-white font-medium text-sm leading-snug mt-1">{n.title}</h2>
                    {n.body && (
                      <p className="text-white/50 text-xs leading-relaxed mt-1.5 whitespace-pre-line">{n.body}</p>
                    )}
                  </div>
                </div>
              </div>
            );
            return link
              ? <Link key={n.id} href={link} className="block">{content}</Link>
              : <div key={n.id}>{content}</div>;
          })}
        </div>
      )}

      <div className="mt-8">
        <Link href="/dashboard" className="text-white/30 hover:text-white/60 text-sm transition-colors inline-flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
