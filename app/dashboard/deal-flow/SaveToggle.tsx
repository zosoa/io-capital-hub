"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Small star/bookmark icon used on both card and detail variants.
function BookmarkIcon({ filled, className = "w-4 h-4" }: { filled: boolean; className?: string }) {
  return (
    <svg className={className} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24"
         stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"/>
    </svg>
  );
}

/**
 * Toggles a deal_saves row for the current investor.
 *
 * `variant="card"` renders a compact icon-only button (for the deal-flow grid).
 * `variant="detail"` renders a labelled button for the project detail sidebar.
 */
export default function SaveToggle({
  projectId,
  initialSaved,
  variant = "card",
}: {
  projectId: string;
  initialSaved: boolean;
  variant?: "card" | "detail";
}) {
  const [saved,   setSaved]   = useState(initialSaved);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function toggle() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const next = !saved;
    setSaved(next);

    if (next) {
      const { error } = await supabase.from("deal_saves").insert({ user_id: user.id, project_id: projectId });
      if (error && error.code !== "23505") { setSaved(false); return; }
    } else {
      const { error } = await supabase.from("deal_saves").delete()
        .eq("user_id", user.id).eq("project_id", projectId);
      if (error) { setSaved(true); return; }
    }
    // Refresh the server component so counts update.
    startTransition(() => router.refresh());
  }

  if (variant === "detail") {
    return (
      <button
        onClick={toggle}
        disabled={pending}
        aria-pressed={saved}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          saved
            ? "bg-[#B8913A]/15 border border-[#B8913A]/40 text-[#B8913A]"
            : "border border-white/10 text-white/60 hover:text-white/90 hover:border-white/25"
        }`}>
        <BookmarkIcon filled={saved} className="w-4 h-4"/>
        {saved ? "Projet sauvegardé" : "Sauvegarder ce projet"}
      </button>
    );
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? "Retirer des sauvegardés" : "Sauvegarder ce projet"}
      title={saved ? "Retirer des sauvegardés" : "Sauvegarder"}
      className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
        saved
          ? "text-[#B8913A] bg-[#B8913A]/15 hover:bg-[#B8913A]/25"
          : "text-white/30 hover:text-white/70 hover:bg-white/5"
      }`}>
      <BookmarkIcon filled={saved} className="w-4 h-4"/>
    </button>
  );
}
