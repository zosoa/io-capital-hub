"use client";

import { useTransition, useState } from "react";
import { withdrawProject } from "@/app/actions/project";

export default function WithdrawButton({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming]  = useState(false);
  const [error, setError]            = useState("");

  function handleClick() {
    if (!confirming) { setConfirming(true); return; }
    setError("");
    startTransition(async () => {
      try {
        await withdrawProject(projectId);
      } catch (e) {
        setError((e as Error).message);
        setConfirming(false);
      }
    });
  }

  return (
    <div>
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      {confirming && !isPending && (
        <p className="text-[#9A9FAF] text-xs mb-2 leading-relaxed">
          Confirmer le retrait ? Cette action est réversible via notre équipe.
        </p>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleClick}
          disabled={isPending}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all disabled:opacity-50 border ${
            confirming
              ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
              : "border-white/10 text-white/35 hover:text-white/55 hover:border-white/20"
          }`}>
          {isPending ? "Retrait en cours…" : confirming ? "Confirmer le retrait" : "Retirer le dossier"}
        </button>
        {confirming && !isPending && (
          <button onClick={() => setConfirming(false)}
            className="py-2 px-3 rounded-lg text-xs border border-white/8 text-white/30 hover:text-white/50 transition-all">
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}
