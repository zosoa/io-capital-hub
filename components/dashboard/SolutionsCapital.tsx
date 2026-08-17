"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Svc = {
  key: string;
  title: string;
  pitch: string;
  status: "available" | "soon";
  icon: React.ReactNode;
  what: string;
  why: string;
  receive: string[];
  who: string;
};

const I = (d: string) => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const SERVICES: Svc[] = [
  {
    key: "investment_readiness", title: "Investment Readiness Review", status: "available",
    pitch: "Comprenez ce qu'un investisseur verra avant d'aller plus loin.",
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 14l2 2 3.5-4"/></svg>,
    what: "Une revue indépendante de votre projet sur les critères clés d'un investisseur, avant toute prise de contact.",
    why: "Un dossier prêt reçoit sensiblement plus de retours. La revue identifie ce qui bloque avant que l'investisseur ne le voie.",
    receive: ["Score de Capital Readiness détaillé", "Rapport de préparation", "Plan d'action priorisé"],
    who: "Porteurs qui préparent une levée et veulent maximiser leurs retours investisseurs.",
  },
  {
    key: "capital_story", title: "Capital Story", status: "available",
    pitch: "Transformez votre entreprise en récit destiné aux investisseurs.",
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H4z"/><path d="M8 20h8M12 16v4"/></svg>,
    what: "Un entretien éditorial et un profil d'opportunité d'investissement, diffusés via la newsletter et les canaux du CEO Summit IO.",
    why: "La visibilité et un récit clair augmentent la confiance et l'intérêt des investisseurs.",
    receive: ["Entretien fondateur", "Profil d'opportunité (thèse, besoin, usage des fonds)", "Feature newsletter", "Distribution éditoriale KAPEX"],
    who: "Porteurs prêts à gagner en visibilité auprès d'un réseau d'investisseurs qualifiés.",
  },
  {
    key: "kapex_verified", title: "KAPEX Verified", status: "soon",
    pitch: "Renforcez la confiance des investisseurs dans les informations présentées.",
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>,
    what: "Une revue structurée d'informations société, projet et financières — au périmètre défini et déclaré.",
    why: "Les investisseurs ont besoin de confiance dans les informations avant d'avancer.",
    receive: ["Statut et périmètre de vérification", "Profil investisseur vérifié", "Rapport de vérification"],
    who: "Porteurs dont le dossier est complet et qui veulent lever le niveau de confiance.",
  },
  {
    key: "investor_matching", title: "Investor Matching", status: "soon",
    pitch: "Trouvez jusqu'à 5 investisseurs dont le mandat correspond à votre projet.",
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
    what: "Nous identifions les investisseurs dont le mandat s'aligne avec votre secteur, ticket et géographie — et expliquons pourquoi.",
    why: "Un ciblage précis vaut mieux qu'une diffusion large. Vous parlez aux bonnes personnes.",
    receive: ["Jusqu'à 5 profils d'investisseurs", "Mandat · ticket · géographie · secteur", "Pourquoi chacun correspond"],
    who: "Porteurs prêts pour une approche investisseurs ciblée.",
  },
  {
    key: "investor_introductions", title: "Investor Introductions", status: "soon",
    pitch: "Ouvrez la conversation avec les investisseurs sélectionnés.",
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="9" r="2.4"/><circle cx="16" cy="9" r="2.4"/><path d="M4 18a4 4 0 018 0M12 18a4 4 0 018 0"/></svg>,
    what: "Nous facilitons des conversations qualifiées avec les investisseurs retenus, sous réserve d'éligibilité et d'intérêt de l'investisseur.",
    why: "Une introduction chaleureuse ouvre des portes qu'un contact froid n'ouvre pas.",
    receive: ["Mise en relation qualifiée", "Coordination des échanges", "Suivi des réponses"],
    who: "Porteurs disposant de correspondances investisseurs validées. Aucune garantie de financement.",
  },
];

export default function SolutionsCapital({ userId, projectId }: { userId: string; projectId: string | null }) {
  const [open, setOpen] = useState<Svc | null>(null);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);

  async function request(svc: Svc) {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("service_interest").insert({
      user_id: userId, project_id: projectId, service_key: svc.key,
    });
    setBusy(false);
    if (!error) { setSent(s => ({ ...s, [svc.key]: true })); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-[#0F1320] uppercase tracking-wider">Solutions Capital</h2>
        <span className="text-[#918A7C] text-xs">Comprendre avant d&apos;activer</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SERVICES.map(svc => (
          <button key={svc.key} onClick={() => setOpen(svc)}
            className="text-left card p-4 hover:border-[#1F4E79]/40 transition-colors flex flex-col gap-2 group">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-lg bg-[#1F4E79]/10 border border-[#1F4E79]/20 flex items-center justify-center text-[#1F4E79]">{svc.icon}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${svc.status === "available" ? "bg-[#1F4E79]/12 text-[#1F4E79]" : "bg-[#F0EEE9] text-[#8A8FA8]"}`}>
                {svc.status === "available" ? "Disponible" : "Bientôt"}
              </span>
            </div>
            <h3 className="text-[#0F1320] font-semibold text-sm">{svc.title}</h3>
            <p className="text-[#575249] text-xs leading-relaxed">{svc.pitch}</p>
            <span className="mt-auto text-[#1F4E79] text-xs font-medium group-hover:underline">En savoir plus →</span>
          </button>
        ))}
      </div>

      {/* Learn drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(null)} />
          <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl ed">
            <div className="p-6 border-b border-[#E4E7EC] flex items-start gap-3">
              <span className="w-10 h-10 rounded-lg bg-[#1F4E79]/10 border border-[#1F4E79]/20 flex items-center justify-center text-[#1F4E79] flex-shrink-0">{open.icon}</span>
              <div className="flex-1">
                <h3 className="font-bold text-[#0F1320]">{open.title}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wide ${open.status === "available" ? "text-[#1F4E79]" : "text-[#8A8FA8]"}`}>
                  {open.status === "available" ? "Disponible" : "Bientôt disponible"}
                </span>
              </div>
              <button onClick={() => setOpen(null)} aria-label="Fermer" className="text-[#918A7C] hover:text-[#575249] p-1">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <Field k="Ce que c'est" v={open.what} />
              <Field k="Pourquoi ça compte" v={open.why} />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#918A7C] mb-2">Ce que vous recevez</div>
                <ul className="space-y-1.5">
                  {open.receive.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#575249]">
                      <svg className="w-4 h-4 text-[#1F4E79] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
              <Field k="Pour qui" v={open.who} />
            </div>
            <div className="p-6 border-t border-[#E4E7EC] bg-[#FAF9F7] sticky bottom-0">
              {open.status === "available" ? (
                sent[open.key] ? (
                  <div className="text-center text-sm text-[#1F4E79] font-medium py-2">
                    ✓ Demande enregistrée — notre équipe vous recontactera.
                  </div>
                ) : (
                  <button onClick={() => request(open)} disabled={busy}
                    className="btn-primary w-full justify-center py-3 disabled:opacity-60">
                    {busy ? "Envoi…" : "Demander ce service"}
                  </button>
                )
              ) : (
                sent[open.key] ? (
                  <div className="text-center text-sm text-[#575249] py-2">✓ Vous serez informé du lancement.</div>
                ) : (
                  <button onClick={() => request(open)} disabled={busy}
                    className="btn-secondary w-full justify-center py-3 disabled:opacity-60">
                    {busy ? "Envoi…" : "M'informer du lancement"}
                  </button>
                )
              )}
              <p className="text-[10px] text-[#918A7C] text-center mt-2 leading-relaxed">
                Sans engagement. Le tarif est communiqué après un premier échange. Une mise en relation ne constitue ni une garantie de financement ni un conseil en investissement.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#918A7C] mb-1">{k}</div>
      <p className="text-sm text-[#575249] leading-relaxed">{v}</p>
    </div>
  );
}
