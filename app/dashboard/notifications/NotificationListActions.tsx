"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Header actions for the notifications list page.
 * Split into its own client component so the main page can stay a server
 * component (for the initial SSR'd list).
 */
export default function NotificationListActions({ hasUnread }: { hasUnread: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function markAllRead() {
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient", user.id)
      .is("read_at", null);
    setBusy(false);
    startTransition(() => router.refresh());
  }

  if (!hasUnread) return null;

  return (
    <button
      onClick={markAllRead}
      disabled={busy || pending}
      className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-[#B8913A]/40 text-[#B8913A] text-xs font-medium hover:bg-[#B8913A]/10 hover:border-[#B8913A]/70 transition-all disabled:opacity-50">
      {busy || pending ? "…" : "Tout marquer lu"}
    </button>
  );
}
