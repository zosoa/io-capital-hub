import Link from "next/link";

// Shared layout for /legal/* pages — clean editorial reading surface.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ed min-h-screen bg-white text-[#22201B]">
      <header className="bg-white border-b border-[#E4E7EC] px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-3">
          <img src="/landing/ceo-logo.png" alt="CEO Summit" className="h-8 w-auto"/>
          <div>
            <div className="font-display text-[#22201B] font-semibold text-base leading-tight tracking-wide">CEO Summit IO</div>
            <div className="text-[#1F4E79] font-semibold text-[10px] tracking-widest uppercase leading-tight mt-0.5">
              Investment Hub · Cluster Capital &amp; Finance
            </div>
          </div>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 lg:px-10 py-16">
        {children}
      </main>

      <footer className="max-w-3xl mx-auto px-6 lg:px-10 pb-16">
        <nav className="flex flex-wrap gap-6 pt-8 border-t border-[#E4E7EC] text-sm text-[#918A7C]">
          <Link href="/" className="hover:text-[#22201B] transition-colors">← Retour à l&apos;accueil</Link>
          <Link href="/legal/cgu"     className="hover:text-[#22201B] transition-colors">CGU</Link>
          <Link href="/legal/privacy" className="hover:text-[#22201B] transition-colors">Politique de confidentialité</Link>
        </nav>
      </footer>
    </div>
  );
}
