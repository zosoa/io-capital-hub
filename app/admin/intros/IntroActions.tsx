"use client";

import { useState, useTransition } from "react";
import { updateInterestStatus, facilitateIntro } from "@/app/actions/admin";

export default function IntroActions({ interestId, status }: { interestId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function run(fn: () => Promise<void>, okMsg: string) {
    setMsg(null);
    startTransition(async () => {
      try { await fn(); setMsg(okMsg); }
      catch (e) { setMsg("Erreur : " + (e as Error).message); }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap justify-end gap-1.5">
        {status !== "closed" && (
          <button
            onClick={() => run(() => facilitateIntro(interestId), "Parties notifiées ✓")}
            disabled={pending}
            className="px-3 py-1.5 rounded-lg bg-brand-gold hover:bg-[#9A7B3A] text-white text-xs font-medium transition-all disabled:opacity-50 whitespace-nowrap">
            {pending ? "…" : "Faciliter l'intro"}
          </button>
        )}
        {status === "pending" && (
          <button
            onClick={() => run(() => updateInterestStatus(interestId, "acknowledged"), "Marqué en cours ✓")}
            disabled={pending}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs transition-all disabled:opacity-50 whitespace-nowrap">
            En cours
          </button>
        )}
        {status !== "closed" && (
          <button
            onClick={() => run(() => updateInterestStatus(interestId, "closed"), "Clôturé ✓")}
            disabled={pending}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-xs transition-all disabled:opacity-50 whitespace-nowrap">
            Clôturer
          </button>
        )}
        {status === "closed" && (
          <button
            onClick={() => run(() => updateInterestStatus(interestId, "acknowledged"), "Ré-ouvert ✓")}
            disabled={pending}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-xs transition-all disabled:opacity-50 whitespace-nowrap">
            Ré-ouvrir
          </button>
        )}
      </div>
      {msg && <span className={`text-[10px] ${msg.startsWith("Erreur") ? "text-red-400" : "text-green-400"}`}>{msg}</span>}
    </div>
  );
}
