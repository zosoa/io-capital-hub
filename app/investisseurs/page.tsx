"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LogoBadge, LogoMark } from "@/components/ui/logo";

// ─── Icons ────────────────────────────────────────────────────
const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7"/>
  </svg>
);
const IconArrow = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5l7 7-7 7"/>
  </svg>
);
const IconArrowDown = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 9l-7 7-7-7"/>
  </svg>
);

// ─── Investor types shown on the page ────────────────────────
const INVESTOR_PROFILES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"/>
      </svg>
    ),
    label: "Banques & Institutions",
    desc:  "Banques commerciales, banques d'investissement, institutions de microfinance régionales",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5"/>
      </svg>
    ),
    label: "Fonds PE / Impact",
    desc:  "Private equity, venture capital, fonds d'impact à impact social, ESG ou climatique",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253"/>
      </svg>
    ),
    label: "DFI & Bilatéraux",
    desc:  "Institutions de développement (AFD, Proparco, DEG, IFC), agences bilatérales",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75"/>
      </svg>
    ),
    label: "Family Offices & Privés",
    desc:  "Gestionnaires de fortune, investisseurs HNWI, diaspora Océan Indien & Afrique",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"/>
      </svg>
    ),
    label: "Advisors & Structurateurs",
    desc:  "Conseil en financement, banquiers d'affaires, avocats corporate — accompagnement de deals",
  },
];

// ─── Steps ────────────────────────────────────────────────────
const HOW_STEPS = [
  {
    n:     "01",
    title: "Créez votre compte & définissez votre mandat",
    desc:  "Renseignez votre profil en 3 minutes : rôle, secteurs prioritaires, ticket d'intervention, zones géographiques. Vos critères guident le matching — vous ne recevez que ce qui correspond.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
      </svg>
    ),
  },
  {
    n:     "02",
    title: "Notre équipe qualifie les dossiers entrants",
    desc:  "Chaque projet soumis est examiné par notre équipe du Cluster Capital & Finance. Seuls les dossiers structurés, cohérents et correspondant à votre mandat vous sont transmis.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
  {
    n:     "03",
    title: "Vous recevez des introductions ciblées",
    desc:  "Pas de liste de projets à parcourir. Notre équipe vous introduit directement aux porteurs de projets retenus — avec un résumé exécutif confidentiel pour chaque opportunité.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
      </svg>
    ),
  },
];

// ─── Navbar ───────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? "bg-[#07090F]/98 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-18 md:h-20">
          <Link href="/" className="flex items-center gap-3">
            <LogoBadge height={28}/>
            <div>
              <div className="text-white font-bold text-sm leading-tight">CEO Summit IO</div>
              <div className="text-[#B8913A] text-[10px] tracking-widest uppercase leading-tight mt-0.5">Investment Hub</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors hidden md:block font-medium">
              ← Porteurs de projets
            </Link>
            <Link href="/auth/login" className="text-white/40 hover:text-white text-sm px-4 py-2 transition-colors font-medium hidden md:block">
              Connexion
            </Link>
            <Link href="/auth/signup?intent=investor"
              className="bg-[#B8913A] hover:bg-[#9A7B3A] text-white font-semibold text-sm px-5 py-2.5 rounded transition-all duration-200">
              Rejoindre le réseau
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function InvestisseursPage() {
  return (
    <div className="bg-[#07090F] overflow-x-hidden">
      <Navbar/>

      {/* ══ HERO ════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Background glow — warmer, deeper gold */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 60% 45% at 50% 40%, rgba(184,145,58,0.09) 0%, transparent 65%)" }}/>
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 120% 120% at 50% 50%, transparent 55%, rgba(7,9,15,0.8) 100%)" }}/>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-10 pt-36 pb-20 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-3 bg-white/4 border border-white/8 rounded-full px-5 py-2 mb-12">
            <LogoMark size={16} variant="light"/>
            <span className="text-white/50 text-sm">Réseau investisseurs — CEO Summit Indian Ocean</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-[3.4rem] font-bold text-white leading-[1.1] tracking-tight">
            Accédez au deal flow qualifié<br/>
            <span className="text-[#C8992A]">de l&apos;Océan Indien.</span>
          </h1>

          <p className="text-white/50 text-lg mt-8 max-w-2xl mx-auto leading-relaxed font-light">
            Rejoignez le registre investisseurs du CEO Summit IO — Investment Hub et recevez
            des introductions ciblées aux projets de financement les mieux structurés
            de la région, sélectionnés selon votre mandat.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link href="/auth/signup?intent=investor"
              className="bg-[#B8913A] hover:bg-[#9A7B3A] text-white font-semibold text-base px-8 py-4 rounded transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
              </svg>
              Créer mon profil investisseur
            </Link>
            <a href="#comment-ca-marche"
              className="bg-white/4 hover:bg-white/7 border border-white/10 text-white/55 hover:text-white font-medium text-base px-8 py-4 rounded transition-all duration-200 inline-flex items-center justify-center gap-2">
              <IconArrowDown/>
              Comment ça marche
            </a>
          </div>

          {/* Key points */}
          <div className="flex flex-wrap justify-center gap-8 mt-14">
            {[
              "Deal flow pré-qualifié — pas de bruit",
              "Matching selon votre mandat exact",
              "Réseau CEO Summit — acteurs réels",
              "Inscription gratuite",
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-white/35 text-sm">
                <span className="text-[#B8913A]/70">
                  <IconCheck/>
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <IconArrowDown/>
        </div>
      </section>

      {/* ══ WHO IS THIS FOR ════════════════════════════════════ */}
      <section className="py-24 bg-[#F6F4EF]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <span className="text-[#B8913A] text-xs font-semibold uppercase tracking-widest">Profils du réseau</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0F1320] mt-4">
              Un réseau pour tous les acteurs du capital
            </h2>
            <p className="text-[#5A6280] mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              Banques, fonds, DFI, family offices ou advisors — tout acteur impliqué dans
              le financement de projets en Océan Indien et Afrique peut rejoindre le registre.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INVESTOR_PROFILES.map(p => (
              <div key={p.label}
                className="bg-white border border-[#E8E2D9] rounded-xl p-6 hover:border-[#B8913A]/35 hover:shadow-sm transition-all duration-300 group">
                <div className="w-10 h-10 border border-[#E8E2D9] rounded-lg flex items-center justify-center text-[#B8913A] mb-5 group-hover:border-[#B8913A]/30 transition-colors">
                  {p.icon}
                </div>
                <h3 className="font-display text-[#0F1320] font-semibold text-base mb-2">{p.label}</h3>
                <p className="text-[#5A6280] text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
            {/* Also for advisors — 6th card fills the grid */}
            <div className="bg-[#B8913A]/5 border border-[#B8913A]/20 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="text-[#B8913A] text-xs font-semibold uppercase tracking-widest mb-4">Pas dans cette liste ?</div>
                <p className="text-[#5A6280] text-sm leading-relaxed mb-4">
                  Si vous êtes impliqué dans l&apos;écosystème capital, financement ou structuration
                  de deals dans la région — vous avez votre place ici.
                </p>
              </div>
              <Link href="/auth/signup?intent=investor"
                className="inline-flex items-center gap-2 text-[#B8913A] font-semibold text-sm hover:text-[#9A7B3A] transition-colors">
                Rejoindre quand même <IconArrow/>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═══════════════════════════════════════ */}
      <section id="comment-ca-marche" className="py-24 bg-[#07090F]">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <span className="text-[#B8913A] text-xs font-semibold uppercase tracking-widest">Processus</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-4">
              Simple, ciblé, confidentiel
            </h2>
            <p className="text-white/45 mt-4 max-w-xl mx-auto text-sm leading-relaxed font-light">
              Vous ne recevez que ce qui correspond à votre mandat.
              Notre équipe fait la curation — vous gérez les conversations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_STEPS.map(s => (
              <div key={s.n} className="relative">
                {/* Step number */}
                <div className="text-[#B8913A]/15 font-display font-black text-7xl leading-none select-none mb-4">
                  {s.n}
                </div>
                <div className="flex items-center gap-3 mb-4 -mt-3">
                  <div className="w-9 h-9 bg-[#B8913A]/10 border border-[#B8913A]/20 rounded-lg flex items-center justify-center text-[#B8913A] flex-shrink-0">
                    {s.icon}
                  </div>
                </div>
                <h3 className="text-white font-semibold text-base leading-snug mb-3">{s.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed font-light">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHAT YOU GET ════════════════════════════════════════ */}
      <section className="py-24 bg-[#0A0D18]">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#B8913A] text-xs font-semibold uppercase tracking-widest">Ce que vous recevez</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-4 leading-snug">
                Un accès privilégié aux<br/>meilleures opportunités de la région
              </h2>
              <p className="text-white/45 mt-5 leading-relaxed text-sm font-light">
                Chaque introduction inclut un résumé exécutif structuré — secteur,
                stade, montant, équipe, données financières clés — pour vous permettre
                de décider rapidement si l&apos;opportunité mérite un premier entretien.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { title: "Dossiers pré-qualifiés",     desc: "Chaque projet est examiné par notre équipe avant d'être transmis. Pas de projets incomplets ou non sérieux." },
                  { title: "Matching sur mesure",         desc: "Votre profil définit vos critères — secteurs, ticket, durée, zone géo. Vous ne recevez que ce qui correspond." },
                  { title: "Introductions personnalisées",desc: "Pas de liste. Une introduction directe, avec contexte, pour chaque opportunité retenue pour vous." },
                  { title: "Réseau CEO Summit",           desc: "Les porteurs de projets sont les mêmes que vous croisez dans les panels et clusters du sommet." },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3">
                    <span className="text-[#B8913A] mt-0.5 flex-shrink-0"><IconCheck/></span>
                    <div>
                      <div className="text-white font-medium text-sm">{item.title}</div>
                      <div className="text-white/38 text-xs leading-relaxed mt-0.5 font-light">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile card mock-up */}
            <div className="bg-[#0E1020] border border-white/8 rounded-xl overflow-hidden shadow-card-lg">
              <div className="bg-[#0A0D18] border-b border-white/5 px-6 py-4 flex items-center gap-3">
                <LogoBadge height={20}/>
                <span className="text-white/60 text-sm font-medium">Profil Investisseur</span>
              </div>
              <div className="p-6 space-y-5">
                {/* Role */}
                <div>
                  <div className="text-white/25 text-[10px] uppercase tracking-wider mb-2.5 font-semibold">Rôle</div>
                  <span className="text-xs bg-[#B8913A]/12 border border-[#B8913A]/25 text-[#B8913A] px-3 py-1.5 rounded-full font-medium">
                    Fonds PE / Capital-risque
                  </span>
                </div>
                {/* Sectors */}
                <div>
                  <div className="text-white/25 text-[10px] uppercase tracking-wider mb-2.5 font-semibold">Secteurs prioritaires</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Énergie","Agritech","Infrastructure","Technologie"].map(s => (
                      <span key={s} className="text-xs bg-white/5 border border-white/10 text-white/50 px-2.5 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
                {/* Ticket */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0A0D18] border border-white/8 rounded-lg p-3">
                    <div className="text-white/25 text-[9px] uppercase tracking-wider mb-1">Ticket min</div>
                    <div className="text-white text-sm font-semibold font-mono tabular-nums">500k USD</div>
                  </div>
                  <div className="bg-[#0A0D18] border border-white/8 rounded-lg p-3">
                    <div className="text-white/25 text-[9px] uppercase tracking-wider mb-1">Ticket max</div>
                    <div className="text-white text-sm font-semibold font-mono tabular-nums">5M USD</div>
                  </div>
                </div>
                {/* Zones */}
                <div>
                  <div className="text-white/25 text-[10px] uppercase tracking-wider mb-2.5 font-semibold">Zones géographiques</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Madagascar","Maurice","Océan Indien","Afrique subsaharienne"].map(z => (
                      <span key={z} className="text-xs bg-white/5 border border-white/10 text-white/45 px-2.5 py-1 rounded-full">{z}</span>
                    ))}
                  </div>
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-2 text-green-400 text-xs font-medium">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
                    Ouvert à recevoir du deal flow
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#07090F] border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-10">
            <LogoBadge height={48}/>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
            Rejoignez le registre.<br/>
            <span className="text-[#C8992A]">Accédez aux meilleures opportunités de la région.</span>
          </h2>
          <p className="text-white/40 text-base mt-6 max-w-xl mx-auto leading-relaxed font-light">
            Inscription gratuite · 3 minutes · Profil modifiable à tout moment
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link href="/auth/signup?intent=investor"
              className="bg-[#B8913A] hover:bg-[#9A7B3A] text-white font-semibold text-base px-10 py-4 rounded transition-all duration-200 inline-flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
              </svg>
              Créer mon profil investisseur
            </Link>
            <Link href="/auth/login"
              className="bg-white/4 hover:bg-white/7 border border-white/10 text-white/55 hover:text-white font-medium text-base px-10 py-4 rounded transition-all duration-200 inline-flex items-center justify-center gap-2">
              Déjà inscrit ? Se connecter
            </Link>
          </div>
          <p className="text-white/20 text-xs mt-6">
            Vous cherchez un financement ?{" "}
            <Link href="/" className="text-[#B8913A]/60 hover:text-[#B8913A] transition-colors">
              Déposer un dossier →
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#040608] border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/22 text-xs font-light">
          <div className="flex items-center gap-3">
            <LogoMark size={16} variant="light"/>
            <span>© 2026 CEO Summit IO · Investment Hub</span>
          </div>
          <div className="flex gap-5">
            <Link href="/" className="hover:text-white/50 transition-colors">Porteurs de projets</Link>
            <Link href="/auth/login" className="hover:text-white/50 transition-colors">Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
