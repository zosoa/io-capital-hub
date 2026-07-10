"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { NotificationRow } from "@/types";

const RELATIVE = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
function relTime(iso: string): string {
  const diffMs = Date.parse(iso) - Date.now();
  const absMin = Math.abs(diffMs) / 60000;
  if (absMin < 1)    return "à l'instant";
  if (absMin < 60)   return RELATIVE.format(Math.round(diffMs / 60000),    "minute");
  if (absMin < 1440) return RELATIVE.format(Math.round(diffMs / 3600000),  "hour");
  return RELATIVE.format(Math.round(diffMs / 86400000), "day");
}

/** Maps a notification type to a subtle color accent + small icon hint. */
function typeAccent(type: string): { dot: string; label: string } {
  if (type.startsWith("admin."))            return { dot: "bg-amber-400", label: "Admin" };
  if (type === "project.approved" || type === "project.funded")
                                            return { dot: "bg-emerald-400", label: "Bonne nouvelle" };
  if (type === "project.rejected")          return { dot: "bg-red-400",     label: "À revoir" };
  if (type === "project.interest_received" || type === "interest.submitted")
                                            return { dot: "bg-[#B8913A]",   label: "Deal flow" };
  if (type === "digest.weekly")             return { dot: "bg-[#B8913A]",   label: "Deal flow" };
  return { dot: "bg-white/40", label: "Info" };
}

export default function NotificationBell() {
  const [items,  setItems]  = useState<NotificationRow[]>([]);
  const [unread, setUnread] = useState(0);
  const [open,   setOpen]   = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Initial load + realtime subscription
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient", user.id)
        .order("created_at", { ascending: false })
        .limit(8) as { data: NotificationRow[] | null };

      const rows = data ?? [];
      setItems(rows);
      setUnread(rows.filter(r => !r.read_at).length);

      // Live updates — append new rows, bump unread counter.
      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `recipient=eq.${user.id}` },
          payload => {
            const row = payload.new as NotificationRow;
            setItems(prev => [row, ...prev].slice(0, 8));
            setUnread(n => n + 1);
          },
        )
        .subscribe();
    })();

    return () => { if (channel) void channel.unsubscribe(); };
  }, []);

  // Click-outside to close
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function markAllRead() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const now = new Date().toISOString();
    await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("recipient", user.id)
      .is("read_at", null);
    setItems(prev => prev.map(r => r.read_at ? r : { ...r, read_at: now }));
    setUnread(0);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={unread > 0 ? `${unread} notification${unread > 1 ? "s" : ""} non lue${unread > 1 ? "s" : ""}` : "Notifications"}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
        </svg>
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#B8913A] text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-[#07090F]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] bg-[#0E1020] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
            <div>
              <div className="text-white text-sm font-semibold">Notifications</div>
              <div className="text-white/35 text-xs mt-0.5">
                {unread > 0 ? `${unread} non lue${unread > 1 ? "s" : ""}` : "Tout est à jour"}
              </div>
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-[#B8913A] hover:text-[#C8992A] text-xs font-medium transition-colors">
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-[26rem] overflow-y-auto divide-y divide-white/5">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-white/35 text-xs">
                Aucune notification pour le moment.
              </div>
            ) : items.map(n => {
              const accent = typeAccent(n.type);
              const link   = (n.data as { link?: string })?.link;
              const Wrap: React.ElementType = link ? Link : "div";
              const wrapProps = link ? { href: link, onClick: () => setOpen(false) } : {};
              return (
                <Wrap key={n.id} {...wrapProps}
                  className={`block px-4 py-3 hover:bg-white/4 transition-colors ${!n.read_at ? "bg-[#B8913A]/5" : ""}`}>
                  <div className="flex items-start gap-2.5">
                    <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${n.read_at ? "bg-white/15" : accent.dot}`}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="text-white text-sm font-medium leading-snug truncate">{n.title}</div>
                        <div className="text-white/25 text-[10px] flex-shrink-0">{relTime(n.created_at)}</div>
                      </div>
                      {n.body && (
                        <p className="text-white/45 text-xs mt-1 leading-relaxed line-clamp-2">{n.body}</p>
                      )}
                    </div>
                  </div>
                </Wrap>
              );
            })}
          </div>

          <div className="border-t border-white/8 px-4 py-2.5 text-center">
            <Link href="/dashboard/notifications" onClick={() => setOpen(false)}
              className="text-white/50 hover:text-white text-xs font-medium transition-colors">
              Voir toutes les notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
