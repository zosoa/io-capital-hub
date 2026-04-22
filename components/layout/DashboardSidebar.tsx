"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import type { Profile } from "@/types";
import { LogoBadge, LogoMark } from "@/components/ui/logo";
import NotificationBell from "@/components/notifications/NotificationBell";

// ─── Icons ────────────────────────────────────────────────────
const IconGrid = () => (
  <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
  </svg>
);
const IconFolder = () => (
  <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/>
  </svg>
);
const IconPlus = () => (
  <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
  </svg>
);
const IconUser = () => (
  <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
  </svg>
);
const IconCog = () => (
  <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);
const IconInvestor = () => (
  <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
  </svg>
);
const IconLogout = () => (
  <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/>
  </svg>
);
const IconShield = () => (
  <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
  </svg>
);

const navItems = [
  { href: "/dashboard",                       icon: <IconGrid/>,     label: "Tableau de bord" },
  { href: "/dashboard/projects",              icon: <IconFolder/>,   label: "Mes dossiers" },
  { href: "/dashboard/projects/new",          icon: <IconPlus/>,     label: "Nouveau dossier" },
  { href: "/dashboard/investor-profile",      icon: <IconInvestor/>, label: "Profil investisseur" },
  { href: "/dashboard/profile",               icon: <IconUser/>,     label: "Mon profil" },
  { href: "/dashboard/account",               icon: <IconShield/>,   label: "Compte & sécurité" },
];

const investorNavItems = [
  { href: "/dashboard",                          icon: <IconGrid/>,     label: "Tableau de bord" },
  { href: "/dashboard/deal-flow",                icon: <IconFolder/>,   label: "Deal Flow" },
  { href: "/dashboard/investor-profile",         icon: <IconInvestor/>, label: "Mon profil investisseur" },
  { href: "/dashboard/profile",                  icon: <IconUser/>,     label: "Mon profil" },
  { href: "/dashboard/account",                  icon: <IconShield/>,   label: "Compte & sécurité" },
];

export default function DashboardSidebar({ profile, isInvestor = false }: { profile: Profile | null; isInvestor?: boolean }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* ── Logo + bell ── */}
      <div className="px-5 pt-6 pb-5 border-b border-white/6">
        <div className="flex items-start justify-between gap-2">
          <Link href="/" className="block group flex-1 min-w-0">
            <LogoBadge height={30} className="mb-3"/>
            <div className="mt-2">
              <div className="text-white/90 font-semibold text-xs tracking-wide leading-none">Investment Hub</div>
              <div className="text-[#B8913A]/70 text-[10px] tracking-widest uppercase mt-1 leading-none font-medium">
                Cluster Capital &amp; Finance
              </div>
            </div>
          </Link>
          <NotificationBell/>
        </div>
      </div>

      {/* ── User mini-card ── */}
      <div className="mx-3 mt-4 mb-2 rounded-lg border border-white/6 bg-white/4 px-3 py-3">

        {/* Row 1: avatar + name */}
        <div className="flex items-center gap-2.5">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-white/10"
              alt={profile.full_name || ""}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#B8913A]/15 border border-[#B8913A]/25 flex items-center justify-center text-[#B8913A] font-semibold text-xs flex-shrink-0">
              {profile?.full_name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-white/85 text-xs font-medium truncate leading-none mb-0.5">
              {profile?.full_name || "Utilisateur"}
            </div>
            <div className="text-white/30 text-[10px] truncate leading-none">
              {profile?.email || ""}
            </div>
          </div>
        </div>

        {/* Row 2: company logo + org name */}
        {(profile?.company_logo_url || profile?.organization) && (
          <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-white/6">
            {profile.company_logo_url ? (
              <img
                src={profile.company_logo_url}
                className="w-5 h-5 rounded object-contain bg-white flex-shrink-0"
                alt={profile.organization || ""}
              />
            ) : (
              <div className="w-5 h-5 rounded bg-[#B8913A]/10 border border-[#B8913A]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[#B8913A] text-[8px] font-bold leading-none">
                  {profile.organization?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <div className="text-white/35 text-[10px] truncate leading-none">
              {profile.organization}
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">

        <div className="text-white/20 text-[9px] uppercase tracking-[0.15em] font-bold px-2 pt-2 pb-1.5">
          Navigation
        </div>

        {(isInvestor ? investorNavItems : navItems).map(item => {
          const active = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-all duration-150 ${
                active
                  ? "bg-[#B8913A]/12 text-[#C8992A]"
                  : "text-white/38 hover:text-white/75 hover:bg-white/5"
              }`}>
              <span className={`flex-shrink-0 ${active ? "text-[#B8913A]" : ""}`}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        {/* Admin section */}
        {profile?.role === "admin" && (
          <div className="pt-3 border-t border-white/5 mt-3">
            <div className="text-white/20 text-[9px] uppercase tracking-[0.15em] font-bold px-2 pb-1.5">Admin</div>
            <Link href="/admin"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-all duration-150 ${
                pathname.startsWith("/admin")
                  ? "bg-[#B8913A]/12 text-[#C8992A]"
                  : "text-white/38 hover:text-white/75 hover:bg-white/5"
              }`}>
              <span className="flex-shrink-0"><IconCog/></span>
              Administration
            </Link>
          </div>
        )}
      </nav>

      {/* ── Sign out ── */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3">
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] text-white/28 hover:text-white/55 hover:bg-white/5 transition-all duration-150">
          <span className="flex-shrink-0"><IconLogout/></span>
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-52 bg-[#080A12] border-r border-white/5 flex-shrink-0">
        <SidebarContent/>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#080A12] border-b border-white/5 h-13 flex items-center justify-between px-4"
           style={{ height: 52 }}>
        <div className="flex items-center gap-2.5">
          <LogoMark size={26} variant="light"/>
          <div>
            <div className="text-white font-semibold text-sm leading-none">CEO Summit IO</div>
            <div className="text-[#B8913A]/60 text-[9px] tracking-widest uppercase leading-none mt-0.5">Investment Hub</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell/>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white/40 hover:text-white p-3 transition-colors" aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>}
          </svg>
        </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-56 bg-[#080A12] border-r border-white/5 h-full overflow-y-auto" style={{ paddingTop: 52 }}>
            <SidebarContent/>
          </div>
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)}/>
        </div>
      )}
    </>
  );
}
