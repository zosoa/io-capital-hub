"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LogoBadge, LogoMark } from "@/components/ui/logo";

// ─── SVG Icon Library — thin-stroke, institutional ───────────────────────────
function IconLock({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
    </svg>
  );
}

function IconTarget({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  );
}

function IconGlobe({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  );
}

function IconUser({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
    </svg>
  );
}

function IconFileText({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>
  );
}

function IconSearch({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </svg>
  );
}

function IconSend({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
  );
}

function IconUpload({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
    </svg>
  );
}

function IconShield({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
    </svg>
  );
}

function IconHandshake({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  );
}

function IconBolt({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>
  );
}

function IconLeaf({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3s14 1.343 14 10c0 5.523-4.477 10-10 10"/>
      <path d="M5 21L19 7"/>
    </svg>
  );
}

function IconMonitor({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>
  );
}

function IconBuilding({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0H5m-2 0h2M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
    </svg>
  );
}

function IconSun({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  );
}

function IconPlus({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v16m-8-8h16"/>
    </svg>
  );
}

function IconBook({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
    </svg>
  );
}

function IconCog({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function IconCheck({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7"/>
    </svg>
  );
}

function IconArrowDown({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 9l-7 7-7-7"/>
    </svg>
  );
}

function IconArrowRight({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5l7 7-7 7"/>
    </svg>
  );
}

// ─── HERO VIDEO ───────────────────────────────────────────────────────────────
// Starts invisible over a solid dark bg — no frozen first-frame on load. The
// moment the first video frame actually renders (`playing` event), we snap it
// to visible. Plays once, freezes on the last frame. When the hero leaves the
// viewport we pause + hide it; when it scrolls back in we reset to 0 and play
// again. No poster, no fade — just black → video → frozen last frame.
function HeroVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onPlaying = () => setVisible(true);
    v.addEventListener("playing", onPlaying);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.currentTime = 0;
          void v.play().catch(() => { /* autoplay blocked — stays on dark bg */ });
        } else {
          v.pause();
          setVisible(false);
        }
      },
      { threshold: 0.15 },
    );
    io.observe(v);

    return () => {
      io.disconnect();
      v.removeEventListener("playing", onPlaying);
    };
  }, []);

  return (
    <video
      ref={ref}
      muted
      playsInline
      preload="auto"
      className="absolute inset-0 w-full h-full object-cover"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      <source src={src} type="video/mp4"/>
    </video>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? "bg-[#07090F]/98 backdrop-blur-xl border-b border-white/5 shadow-sm"
        : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-18 md:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <LogoBadge height={30}/>
            <div>
              <div className="text-white font-bold text-sm leading-tight tracking-wide">CEO Summit IO</div>
              <div className="text-[#B8913A] font-medium text-[10px] tracking-widest uppercase leading-tight mt-0.5">Investment Hub · Cluster Finance</div>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              ["#pourquoi", "Pourquoi nous ?"],
              ["#comment", "Comment ça marche"],
              ["#secteurs", "Secteurs"],
              ["#about", "À propos"],
            ].map(([href, label]) => (
              <a key={href} href={href}
                className="text-white/50 hover:text-white transition-colors duration-200 text-sm font-medium nav-link">
                {label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/investisseurs"
              className="text-white/40 hover:text-white/70 text-sm px-4 py-2 transition-colors font-medium">
              Je suis investisseur
            </Link>
            <Link href="/auth/login"
              className="text-white/50 hover:text-white text-sm px-4 py-2 transition-colors font-medium">
              Connexion
            </Link>
            <Link href="/auth/signup"
              className="border border-[#B8913A] text-[#B8913A] hover:bg-[#B8913A]/10 text-sm font-semibold px-5 py-2 rounded transition-all duration-200">
              Déposer un dossier
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white p-3" aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#07090F] border-t border-white/5 px-6 py-5 space-y-1">
          {[["#pourquoi","Pourquoi nous ?"],["#comment","Comment ça marche"],["#secteurs","Secteurs"],["#about","À propos"]].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMobileOpen(false)}
              className="block text-white/50 hover:text-white py-2.5 text-sm font-medium transition-colors">{label}</a>
          ))}
          <div className="pt-4 border-t border-white/8 flex flex-col gap-3">
            <Link href="/investisseurs" className="text-center text-white/40 py-2 text-sm font-medium">Je suis investisseur</Link>
            <Link href="/auth/login" className="text-center text-white/50 py-2 text-sm font-medium">Connexion</Link>
            <Link href="/auth/signup"
              className="text-center border border-[#B8913A] text-[#B8913A] text-sm font-semibold py-3 rounded">
              Déposer un dossier
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── COUNT-UP HOOK ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setCount(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, active]);
  return count;
}

// ─── STAT BLOCK ───────────────────────────────────────────────────────────────
function StatBlock({
  value, suffix, label, icon, highlight = false, delay = 0, active,
}: {
  value: number; suffix: string; label: string;
  icon: React.ReactNode; highlight?: boolean; delay?: number; active: boolean;
}) {
  const [started, setStarted] = useState(false);
  const count = useCountUp(value, 1500, started);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);

  return (
    <div className={`relative flex flex-col items-center text-center px-5 py-10 transition-colors duration-300 group ${
      highlight ? "bg-[#B8913A]/7" : "bg-[#07090F] hover:bg-white/2"
    }`}>
      {highlight && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B8913A]/70 to-transparent"/>
      )}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-4 transition-colors ${
        highlight
          ? "bg-[#B8913A]/15 text-[#B8913A]"
          : "bg-white/5 text-white/30 group-hover:bg-white/8 group-hover:text-white/50"
      }`}>
        {icon}
      </div>
      <div className={`text-3xl lg:text-4xl font-bold tracking-tight tabular-nums leading-none ${
        highlight ? "text-[#C8992A]" : "text-white"
      }`}>
        {count.toLocaleString()}
        <span className={`text-xl lg:text-2xl font-semibold ml-0.5 ${highlight ? "text-[#B8913A]" : "text-white/60"}`}>
          {suffix}
        </span>
      </div>
      <div className={`text-[10px] uppercase tracking-[0.15em] mt-3 font-semibold leading-relaxed max-w-[130px] ${
        highlight ? "text-[#B8913A]/70" : "text-white/45"
      }`}>
        {label}
      </div>
    </div>
  );
}

// ─── STATS DATA ───────────────────────────────────────────────────────────────
const STAT_ITEMS = [
  { value: 650,  suffix: "+",   label: "Participants CEO Summit",           icon: <IconUser className="w-4 h-4"/>,      delay: 0   },
  { value: 18,   suffix: "+",   label: "Pays représentés",                  icon: <IconGlobe className="w-4 h-4"/>,     delay: 100 },
  { value: 237,  suffix: "+",   label: "Investisseurs qualifiés en réseau", icon: <IconHandshake className="w-4 h-4"/>, delay: 200, highlight: true },
  { value: 40,   suffix: "+",   label: "Sessions & Clusters",               icon: <IconMonitor className="w-4 h-4"/>,   delay: 300 },
  { value: 2,    suffix: "ème", label: "Édition · Antananarivo 2026",       icon: <IconBolt className="w-4 h-4"/>,      delay: 400 },
];

// ─── STATS SECTION ────────────────────────────────────────────────────────────
function StatsSection() {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative bg-[#07090F] overflow-hidden">
      {/* Top gold gradient rule */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B8913A]/40 to-transparent"/>
      {/* Bottom subtle rule */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#B8913A]/15 to-transparent"/>
      {/* Radial gold glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 140% at 50% 50%, rgba(184,145,58,0.04) 0%, transparent 70%)" }}/>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-14">
        {/* Eyebrow */}
        <div className="text-center mb-10">
          <span className="text-[#B8913A]/45 text-[10px] font-semibold uppercase tracking-[0.22em]">
            CEO Summit Indian Ocean · En chiffres
          </span>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-white/6 rounded-2xl overflow-hidden border border-white/6">
          {STAT_ITEMS.map(stat => (
            <StatBlock key={stat.label} {...stat} active={active}/>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SOCIAL PROOF — trusted-by + testimonials ────────────────────────────────
// Logos are the actual partner marks provided by the user, stored in
// /public/partners/*. Testimonials remain placeholder paraphrases.
const PARTNER_LOGOS: { src: string; alt: string }[] = [
  { src: "/partners/union-europeenne.png", alt: "Union Européenne" },
  { src: "/partners/undp.png",             alt: "UNDP" },
  { src: "/partners/sadc.png",             alt: "SADC" },
  { src: "/partners/mauritius-finance.png", alt: "Mauritius Finance" },
  { src: "/partners/afd.png",              alt: "AFD" },
  { src: "/partners/edbm.png",             alt: "EDBM" },
  { src: "/partners/mef.png",              alt: "MEF" },
];

const TESTIMONIALS = [
  {
    quote: "L'équipe a su identifier en quelques jours les trois fonds régionaux les plus alignés avec notre thèse d'investissement énergie. Un gain de temps considérable.",
    author: "Directrice d'investissement",
    role: "Fonds PE — Maurice",
  },
  {
    quote: "Nous avons obtenu une introduction qualifiée auprès d'une DFI deux semaines après le dépôt de notre dossier. Le filtre éditorial de CEO Summit fait la différence.",
    author: "CEO & fondateur",
    role: "Agri-industrie — Madagascar",
  },
  {
    quote: "La qualité du deal flow est nettement au-dessus des plateformes publiques. Confidentialité respectée, dossiers préqualifiés, géographie ciblée.",
    author: "Responsable crédit",
    role: "Banque d'investissement régionale",
  },
];

function SocialProofSection() {
  return (
    <>
      {/* ── Trusted-by strip — white banner because the partner logos ship on
          transparent / white backgrounds and don't render well on dark. ── */}
      <section className="bg-white border-y border-[#E8E2D9]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
          <div className="text-center mb-8">
            <span className="text-[#8A7A4E] text-[10px] font-semibold uppercase tracking-[0.22em]">
              Soutenu par l&apos;écosystème · Partenaires du CEO Summit
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:gap-x-12">
            {PARTNER_LOGOS.map(({ src, alt }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt={alt}
                loading="lazy"
                className="h-10 md:h-14 w-auto object-contain opacity-85 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial cards — back on dark ── */}
      <section className="bg-[#07090F]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20">
          <div className="text-center mb-10">
            <span className="text-[#B8913A] text-[10px] font-semibold uppercase tracking-[0.22em]">
              Ils en parlent
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mt-3 leading-snug">
              Porteurs de projets &amp; investisseurs<br className="hidden md:block"/>témoignent de leur expérience.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <figure key={t.author}
                className="rounded-2xl border border-white/8 bg-white/3 p-7 hover:border-[#B8913A]/30 hover:bg-[#B8913A]/5 transition-all flex flex-col">
                <svg className="w-6 h-6 text-[#B8913A]/70 mb-4" fill="currentColor" viewBox="0 0 32 32" aria-hidden>
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36 1 24.832 4.304 28 8.704 28c3.808 0 6.512-2.928 6.512-6.384 0-3.136-2.192-5.408-5.12-5.408-.592 0-1.392.112-1.568.224.48-3.264 3.52-7.104 6.56-9.024L9.352 4zm18.56 0c-4.832 3.456-8.288 9.12-8.288 15.36C19.624 24.832 22.928 28 27.328 28c3.744 0 6.448-2.928 6.448-6.384 0-3.136-2.128-5.408-5.056-5.408-.592 0-1.456.112-1.632.224.48-3.264 3.584-7.104 6.624-9.024L27.912 4z"/>
                </svg>
                <blockquote className="text-white/70 text-sm leading-relaxed font-light flex-1">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 pt-5 border-t border-white/6">
                  <div className="text-white text-sm font-semibold">{t.author}</div>
                  <div className="text-[#B8913A]/75 text-xs mt-0.5">{t.role}</div>
                </figcaption>
              </figure>
            ))}
          </div>

          <p className="text-center text-white/25 text-xs mt-8 max-w-xl mx-auto leading-relaxed">
            Les témoignages sont anonymisés à la demande des auteurs — partage nominatif disponible sur demande auprès de notre équipe.
          </p>
        </div>
      </section>
    </>
  );
}

// ─── STEP CARD ────────────────────────────────────────────────────────────────
function StepCard({ n, icon, title, desc }: {
  n: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-5">
      <div className="flex-shrink-0 w-11 h-11 bg-[#B8913A]/10 border border-[#B8913A]/20 rounded-lg flex items-center justify-center text-[#B8913A]">
        {icon}
      </div>
      <div>
        <div className="text-[#B8913A] text-xs font-semibold uppercase tracking-widest mb-1.5">{n}</div>
        <h3 className="text-white font-semibold text-base leading-snug">{title}</h3>
        <p className="text-white/45 text-sm mt-2 leading-relaxed font-light">{desc}</p>
      </div>
    </div>
  );
}

// ─── PILLAR CARD (light section) ──────────────────────────────────────────────
function PillarCard({ icon, title, desc }: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white border border-[#E8E2D9] rounded-lg p-8 hover:border-[#B8913A]/40 hover:shadow-sm transition-all duration-300 group">
      <div className="w-11 h-11 border border-[#E8E2D9] rounded-lg flex items-center justify-center text-[#B8913A] mb-6 group-hover:border-[#B8913A]/35 transition-colors">
        {icon}
      </div>
      <h3 className="font-display text-[#0F1320] font-semibold text-lg mb-3">{title}</h3>
      <p className="text-[#5A6280] text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="bg-[#07090F] overflow-x-hidden">
      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#07090F]">

        {/* ── Video background — plays once on view, fades out smoothly when it ends,
            replays from the start when scrolled back in. No poster / bg-image — the
            dark section bg shows for the ~200 ms while the video buffers, which is
            way less noticeable than a frozen still. */}
        <HeroVideo src="/hero-loop-short.mp4"/>

        {/* ── Overlay stack (bottom → top) ── */}
        <div className="absolute inset-0 pointer-events-none">
          {/* 1 — base darkening layer (text safety net) */}
          <div className="absolute inset-0 bg-[#07090F]/52"/>
          {/* 2 — warm gold glow at center-top */}
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 65% 50% at 50% 35%, rgba(184,145,58,0.09) 0%, transparent 65%)" }}/>
          {/* 3 — edge vignette */}
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 120% 120% at 50% 50%, transparent 40%, rgba(7,9,15,0.82) 100%)" }}/>
          {/* 4 — bottom fade into stats section */}
          <div className="absolute bottom-0 inset-x-0 h-48"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(7,9,15,0.95))" }}/>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 pt-36 pb-24 text-center">

          {/* Institutional badge */}
          <div className="inline-flex items-center gap-3 bg-white/4 border border-white/8 rounded-full px-5 py-2 mb-12 animate-fade-up">
            <LogoMark size={18} variant="light"/>
            <span className="text-white/50 text-sm tracking-wide">Extension officielle du CEO Summit Indian Ocean</span>
            <span className="hidden sm:inline text-white/15">·</span>
            <span className="hidden sm:inline text-[#B8913A] text-sm font-medium">Antananarivo, Avril 2026</span>
          </div>

          {/* Main heading — Playfair Display */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.12] tracking-tight animate-fade-up-delay-1">
            Votre projet mérite<br/>
            <span className="text-[#C8992A]">les bons partenaires financiers.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-white/50 text-lg mt-8 max-w-2xl mx-auto leading-relaxed font-light animate-fade-up-delay-2">
            CEO Summit IO — Investment Hub connecte en toute confidentialité les porteurs de projets
            de l&apos;Océan Indien avec les investisseurs, fonds et institutions financières
            du Cluster Capital &amp; Finance.
          </p>

          {/* Dual CTAs — equal prominence for both audiences */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-12 animate-fade-up-delay-3">
            <Link href="/auth/signup"
              className="bg-[#B8913A] hover:bg-[#9A7B3A] text-white font-semibold text-base px-7 py-3.5 rounded transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-sm">
              <IconFileText className="w-4 h-4"/>
              Déposer un dossier
            </Link>
            <Link href="/auth/signup?intent=investor"
              className="bg-white/8 hover:bg-white/12 border border-[#B8913A]/50 hover:border-[#B8913A] text-white font-semibold text-base px-7 py-3.5 rounded transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-sm">
              <IconGlobe className="w-4 h-4 text-[#B8913A]"/>
              Je suis investisseur
            </Link>
          </div>

          {/* Secondary actions — "how it works" + learn more for investors */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-6 animate-fade-up-delay-3 text-sm">
            <a href="#comment" className="text-white/55 hover:text-white transition-colors inline-flex items-center gap-1.5">
              <IconArrowDown className="w-3.5 h-3.5"/>
              Comment ça marche
            </a>
            <span className="text-white/15 hidden sm:inline">·</span>
            <Link href="/investisseurs" className="text-[#B8913A]/75 hover:text-[#B8913A] transition-colors font-medium inline-flex items-center gap-1">
              En savoir plus sur le réseau investisseur
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </Link>
          </div>

          {/* Trust signals — SVG icons, no emojis */}
          <div className="flex flex-wrap justify-center gap-8 mt-14 animate-fade-up-delay-3">
            {[
              { icon: <IconLock className="w-4 h-4"/>, label: "Dossiers confidentiels" },
              { icon: <IconTarget className="w-4 h-4"/>, label: "Matching ciblé par notre équipe" },
              { icon: <IconGlobe className="w-4 h-4"/>, label: "Réseau Océan Indien & Afrique" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-white/35 text-sm">
                <span className="text-[#B8913A]/60">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator — slow pulse, no bounce */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-scroll-hint">
          <IconArrowDown className="w-4 h-4 text-white/20"/>
        </div>
      </section>

      {/* ══ STATS BAND ═══════════════════════════════════════════════════════ */}
      <StatsSection />

      {/* ══ SOCIAL PROOF — trusted-by + testimonials ═════════════════════════ */}
      <SocialProofSection />

      {/* ══ WHY — cream section ═══════════════════════════════════════════════ */}
      <section id="pourquoi" className="py-28 bg-[#F6F4EF]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">

          <div className="text-center mb-16">
            <span className="text-[#B8913A] text-xs font-semibold uppercase tracking-widest">Notre valeur ajoutée</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0F1320] mt-4 leading-snug">
              Une plateforme pensée pour les porteurs<br className="hidden md:block"/> de projets, pas pour les places de marché.
            </h2>
            <p className="text-[#5A6280] mt-5 max-w-2xl mx-auto leading-relaxed text-sm">
              Nous ne sommes pas une bourse de projets publique. Votre dossier reste confidentiel —
              notre équipe fait le travail de sélection et de mise en relation avec les bons interlocuteurs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <PillarCard
              icon={<IconUpload className="w-5 h-5"/>}
              title="Vous soumettez"
              desc="Remplissez notre formulaire structuré en quelques étapes. Notre équipe vous guide pour présenter votre projet sous le meilleur angle : secteur, montant, maturité, besoins."
            />
            <PillarCard
              icon={<IconShield className="w-5 h-5"/>}
              title="Nous qualifions en privé"
              desc="Votre dossier n'est pas accessible publiquement. Notre équipe le revoit, le valide, et le soumet uniquement aux investisseurs de notre réseau dont le mandat correspond."
            />
            <PillarCard
              icon={<IconHandshake className="w-5 h-5"/>}
              title="Nous vous introduisons"
              desc="Vous recevez une introduction ciblée aux fonds, banques ou investisseurs identifiés. C'est vous qui décidez ensuite de la suite à donner aux conversations."
            />
          </div>

          {/* Privacy callout */}
          <div className="mt-10 bg-white border border-[#E8E2D9] rounded-lg p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-[#B8913A]/8 border border-[#B8913A]/20 rounded-lg flex items-center justify-center text-[#B8913A]">
              <IconShield className="w-6 h-6"/>
            </div>
            <div>
              <h3 className="text-[#0F1320] font-semibold text-base mb-1">Vos données restent privées</h3>
              <p className="text-[#5A6280] text-sm leading-relaxed">
                Aucun projet n&apos;est listé publiquement sur cette plateforme. Vos informations financières,
                vos projections et vos données sensibles ne sont partagées qu&apos;avec les investisseurs
                que vous avez approuvés — et seulement après votre accord explicite.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════════════════ */}
      <section id="comment" className="py-28 bg-[#07090F]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">

          <div className="text-center mb-16">
            <span className="text-[#B8913A] text-xs font-semibold uppercase tracking-widest">Processus</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-4">
              De la soumission à l&apos;introduction en 4 étapes
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="space-y-10">
              <StepCard
                n="Étape 01"
                icon={<IconUser className="w-5 h-5"/>}
                title="Créez votre compte"
                desc="Inscription simple. Vous renseignez votre profil professionnel et les grandes lignes de votre projet ou de votre entreprise."
              />
              <StepCard
                n="Étape 02"
                icon={<IconFileText className="w-5 h-5"/>}
                title="Soumettez votre dossier de financement"
                desc="Notre formulaire intelligent vous guide selon votre secteur, votre stade de développement et le type de financement recherché. Pas de jargon. Des questions précises."
              />
              <StepCard
                n="Étape 03"
                icon={<IconSearch className="w-5 h-5"/>}
                title="Notre équipe analyse et qualifie"
                desc="Le cluster Capital & Funding du CEO Summit passe en revue votre dossier. Nous identifions les investisseurs les mieux placés parmi notre réseau actif."
              />
              <StepCard
                n="Étape 04"
                icon={<IconSend className="w-5 h-5"/>}
                title="Vous recevez une introduction ciblée"
                desc="Nous vous mettons en relation directement avec les interlocuteurs identifiés. Vous gardez le contrôle total sur la suite des discussions."
              />
            </div>

            {/* Form preview */}
            <div className="sticky top-28">
              <div className="bg-[#0E1020] border border-white/8 rounded-lg overflow-hidden shadow-card-lg">
                {/* Header */}
                <div className="bg-[#0A0D18] border-b border-white/5 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LogoBadge height={22}/>
                    <span className="text-white text-sm font-medium">Dossier de Financement</span>
                  </div>
                  <span className="text-[#B8913A] text-xs font-semibold bg-[#B8913A]/10 px-2.5 py-1 rounded">Étape 2 / 5</span>
                </div>
                {/* Progress bar — single gold line */}
                <div className="h-0.5 bg-white/5">
                  <div className="h-full bg-[#B8913A] w-2/5"/>
                </div>
                {/* Form content */}
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-white/35 uppercase tracking-wider mb-2.5">
                      Type de financement recherché
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        ["Dette bancaire",   "border-white/10 text-white/35"],
                        ["Capital / Equity", "border-[#B8913A] bg-[#B8913A]/10 text-[#C8992A]"],
                        ["Impact / ESG",     "border-white/10 text-white/35"],
                        ["Mixte",            "border-white/10 text-white/35"],
                      ].map(([t, cls]) => (
                        <span key={t} className={`text-xs px-3 py-1.5 rounded border cursor-pointer font-medium ${cls}`}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/35 uppercase tracking-wider mb-2.5">Secteur</label>
                    <div className="bg-[#0A0D18] border border-white/8 rounded px-4 py-3 text-white/40 text-sm font-light">
                      Énergie & Infrastructure
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/35 uppercase tracking-wider mb-2.5">Montant recherché</label>
                    <div className="flex gap-3">
                      <div className="flex-1 bg-[#0A0D18] border border-white/8 rounded px-4 py-3 text-white text-sm font-light">2 500 000</div>
                      <div className="w-20 bg-[#0A0D18] border border-white/8 rounded px-4 py-3 text-white/35 text-sm">USD</div>
                    </div>
                  </div>
                  <div className="bg-[#B8913A]/5 border border-[#B8913A]/15 rounded px-4 py-3 flex items-start gap-3">
                    <IconLock className="w-4 h-4 text-[#B8913A] mt-0.5 flex-shrink-0"/>
                    <p className="text-white/40 text-xs leading-relaxed font-light">
                      Votre dossier sera examiné par notre équipe avant toute mise en relation.
                      Vos données ne seront jamais publiées sans votre accord.
                    </p>
                  </div>
                  <button className="w-full bg-[#B8913A] hover:bg-[#9A7B3A] text-white text-sm font-semibold py-3 rounded transition-colors inline-flex items-center justify-center gap-2">
                    Continuer
                    <IconArrowRight className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTORS — cream section ═══════════════════════════════════════════ */}
      <section id="secteurs" className="py-28 bg-[#F6F4EF]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <span className="text-[#B8913A] text-xs font-semibold uppercase tracking-widest">Secteurs prioritaires</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0F1320] mt-4">
              Tous les secteurs de l&apos;économie régionale
            </h2>
            <p className="text-[#5A6280] mt-4 max-w-xl mx-auto text-sm">
              Notre réseau couvre l&apos;ensemble des secteurs porteurs de l&apos;Océan Indien et d&apos;Afrique francophone.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#E8E2D9] border border-[#E8E2D9] rounded-lg overflow-hidden">
            {[
              { icon: <IconBolt    className="w-5 h-5"/>, label: "Énergie & Environnement",    sub: "Solaire, hydro, transition" },
              { icon: <IconLeaf    className="w-5 h-5"/>, label: "Agriculture & Agro-industrie",sub: "Production, transformation" },
              { icon: <IconMonitor className="w-5 h-5"/>, label: "Technologies & Numérique",   sub: "Fintech, SaaS, IA" },
              { icon: <IconBuilding className="w-5 h-5"/>, label: "Infrastructure",             sub: "Ports, routes, bâtiment" },
              { icon: <IconSun     className="w-5 h-5"/>, label: "Tourisme",                    sub: "Hôtellerie, éco-tourisme" },
              { icon: <IconPlus    className="w-5 h-5"/>, label: "Santé",                       sub: "Cliniques, pharma, biotech" },
              { icon: <IconBook    className="w-5 h-5"/>, label: "Éducation & Formation",       sub: "Edtech, enseignement" },
              { icon: <IconCog     className="w-5 h-5"/>, label: "Industrie",                   sub: "Manufacture, transformation" },
            ].map(({ icon, label, sub }) => (
              <div key={label}
                className="bg-white px-6 py-7 hover:bg-[#F6F4EF] transition-colors duration-200 group cursor-default">
                <div className="text-[#B8913A] opacity-60 group-hover:opacity-100 transition-opacity duration-200 mb-3">{icon}</div>
                <div className="text-[#0F1320] font-semibold text-sm">{label}</div>
                <div className="text-[#8A8FA8] text-xs mt-1 font-light">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CEO SUMMIT BACKING ══════════════════════════════════════════════ */}
      <section id="about" className="py-28 bg-[#0A0D18]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#B8913A] text-xs font-semibold uppercase tracking-widest">Notre ancrage institutionnel</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-4 leading-snug">
                La force du réseau<br/>CEO Summit Indian Ocean
              </h2>
              <p className="text-white/50 mt-5 leading-relaxed text-sm font-light">
                CEO Summit IO — Investment Hub est une initiative du Cluster Capital &amp; Finance du
                CEO Summit Indian Ocean — le plus grand rendez-vous des leaders visionnaires
                de l&apos;Océan Indien. Nous ne sommes pas une startup. Nous sommes l&apos;infrastructure
                de financement du sommet.
              </p>
              <p className="text-white/50 mt-4 leading-relaxed text-sm font-light">
                Les investisseurs qui constituent notre réseau sont les mêmes qui participent
                aux panels, tables rondes et clusters du CEO Summit — des acteurs réels,
                engagés et disponibles.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  "Réseau d'investisseurs préqualifiés et actifs dans la région",
                  "Processus de matching confidentiel et personnalisé",
                  "Suivi par l'équipe du Cluster Capital & Funding",
                  "Lien direct avec l'écosystème CEO Summit",
                ].map(item => (
                  <div key={item} className="flex items-start gap-3 text-white/55 text-sm font-light">
                    <IconCheck className="w-4 h-4 text-[#B8913A] mt-0.5 flex-shrink-0"/>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  type: "Fonds d'investissement à impact",
                  desc: "PE, VC, ESG — tickets 500K à 10M$, Afrique subsaharienne & Océan Indien",
                  accent: "border-[#B8913A]/25 bg-[#B8913A]/5",
                },
                {
                  type: "Banques d'investissement",
                  desc: "Structuration de deals, M&A, dette senior & mezzanine, introductions institutionnelles",
                  accent: "border-white/8 bg-white/2",
                },
                {
                  type: "Banques commerciales régionales",
                  desc: "Financement PME, dette bancaire, accompagnement Océan Indien & Afrique",
                  accent: "border-white/8 bg-white/2",
                },
                {
                  type: "Gestionnaires de patrimoine",
                  desc: "Family offices, investisseurs privés, financement patrimonial & fiscal outre-mer",
                  accent: "border-white/8 bg-white/2",
                },
              ].map(({ type, desc, accent }) => (
                <div key={type} className={`border ${accent} rounded-lg px-6 py-5`}>
                  <div className="text-white font-medium text-sm mb-1">{type}</div>
                  <div className="text-white/38 text-xs leading-relaxed font-light">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA BAND — dual audience ════════════════════════════════════════ */}
      <section className="py-28 bg-[#07090F] border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-10">
            <LogoBadge height={52}/>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
            Une place de marché curée, <span className="text-[#C8992A]">pas un simple formulaire</span>.
          </h2>
          <p className="text-white/55 text-base mt-6 max-w-2xl mx-auto leading-relaxed font-light">
            Les projets qualifiés par notre équipe sont mis en relation avec les investisseurs
            selon leurs secteurs prioritaires, ticket et zones géographiques.
          </p>

          {/* Dual-audience card pair */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 max-w-3xl mx-auto text-left">
            {/* Project owner card */}
            <div className="rounded-2xl border border-white/10 bg-white/3 p-6 hover:border-[#B8913A]/40 transition-all">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-8 h-8 rounded-lg bg-[#B8913A]/15 border border-[#B8913A]/25 flex items-center justify-center text-[#B8913A]">
                  <IconFileText className="w-4 h-4"/>
                </span>
                <h3 className="font-display text-lg font-bold text-white">Porteurs de projets</h3>
              </div>
              <p className="text-white/55 text-sm leading-relaxed mb-5">
                Déposez votre dossier, notre équipe qualifie et présente votre projet aux investisseurs
                dont le mandat correspond à vos besoins.
              </p>
              <Link href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 w-full bg-[#B8913A] hover:bg-[#9A7B3A] text-white font-semibold text-sm px-5 py-3 rounded transition-all shadow-sm">
                Déposer un dossier
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                </svg>
              </Link>
            </div>

            {/* Investor card */}
            <div className="rounded-2xl border border-[#B8913A]/25 bg-[#B8913A]/5 p-6 hover:border-[#B8913A]/50 transition-all">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-8 h-8 rounded-lg bg-[#B8913A]/20 border border-[#B8913A]/40 flex items-center justify-center text-[#B8913A]">
                  <IconGlobe className="w-4 h-4"/>
                </span>
                <h3 className="font-display text-lg font-bold text-white">Investisseurs, fonds, DFIs</h3>
              </div>
              <p className="text-white/55 text-sm leading-relaxed mb-5">
                Accédez à un deal flow curé et filtré selon votre mandat — secteurs, ticket, géographie.
                Des dossiers qualifiés, pas du bruit.
              </p>
              <Link href="/auth/signup?intent=investor"
                className="inline-flex items-center justify-center gap-2 w-full bg-white/8 hover:bg-white/12 border border-[#B8913A]/60 hover:border-[#B8913A] text-white font-semibold text-sm px-5 py-3 rounded transition-all shadow-sm">
                Rejoindre le réseau
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Existing user link */}
          <div className="mt-8 pt-6 border-t border-white/5 max-w-xl mx-auto">
            <Link href="/auth/login" className="text-white/55 hover:text-white text-sm transition-colors inline-flex items-center gap-1.5">
              Déjà un compte ?
              <span className="text-[#B8913A] font-medium">Accéder à mon espace →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer className="bg-[#040608] border-t border-white/5 pt-16 pb-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">

          {/* Logo row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/5">
            <div className="flex items-center gap-4">
              <LogoBadge height={40}/>
              <div>
                <div className="text-white font-bold text-base tracking-wide">CEO Summit IO</div>
                <div className="text-[#B8913A] font-medium text-xs tracking-widest uppercase mt-0.5">Investment Hub</div>
                <div className="text-white/22 text-xs mt-1 font-light">Cluster Capital &amp; Finance · Indian Ocean</div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-white/22 text-xs uppercase tracking-widest mb-2 font-medium">Organisateur</div>
                <div className="flex items-center gap-2 bg-white/4 border border-white/8 rounded px-4 py-2">
                  <LogoMark size={18} variant="light"/>
                  <span className="text-white/55 text-xs font-medium tracking-wide">CEO SUMMIT IO</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-white/22 text-xs uppercase tracking-widest mb-2 font-medium">Partenaires</div>
                <div className="flex items-center gap-2">
                  <div className="bg-white/6 border border-white/8 rounded w-8 h-8 flex items-center justify-center">
                    <span className="text-white/50 text-xs font-bold">b</span>
                  </div>
                  <div className="bg-white/6 border border-white/8 rounded w-8 h-8 flex items-center justify-center">
                    <span className="text-white/50 text-xs font-bold">S</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="grid md:grid-cols-4 gap-8 py-10">
            <div className="md:col-span-2">
              <p className="text-white/30 text-sm leading-relaxed max-w-sm font-light">
                La plateforme de financement privée du CEO Summit Indian Ocean.
                Nous connectons les porteurs de projets aux investisseurs actifs de la région
                en toute confidentialité.
              </p>
              <div className="mt-5 text-[#B8913A] text-sm font-medium">
                capital@ceo-summit.mg
              </div>
            </div>
            <div>
              <div className="text-white/40 font-medium text-xs uppercase tracking-widest mb-4">Plateforme</div>
              <div className="space-y-2.5 text-white/30 text-sm font-light">
                {["Déposer un dossier","Comment ça marche","Secteurs couverts","Accéder à mon espace"].map(l => (
                  <div key={l} className="hover:text-white/60 cursor-pointer transition-colors">{l}</div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-white/40 font-medium text-xs uppercase tracking-widest mb-4">CEO Summit 2026</div>
              <div className="space-y-2.5 text-white/30 text-sm font-light">
                <div>Antananarivo, Madagascar</div>
                <div>9–10 Avril 2026</div>
                <div className="mt-3">
                  <a href="https://www.ceo-summit.mg" target="_blank" rel="noopener noreferrer"
                    className="text-[#B8913A] hover:text-[#C8992A] transition-colors">
                    www.ceo-summit.mg
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-white/22 text-xs font-light">
            <div>© 2026 CEO Summit IO · Investment Hub · Cluster Capital &amp; Finance. Tous droits réservés.</div>
            <div className="flex gap-5">
              <span className="hover:text-white/45 cursor-pointer transition-colors">Confidentialité</span>
              <span className="hover:text-white/45 cursor-pointer transition-colors">Conditions d&apos;utilisation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
