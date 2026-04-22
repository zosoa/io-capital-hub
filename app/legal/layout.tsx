import Link from "next/link";
import { LogoBadge } from "@/components/ui/logo";

// Shared layout for /legal/* pages — clean reading surface, dark brand.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07090F] text-white">
      <header className="border-b border-white/5 px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-3">
          <LogoBadge height={28}/>
          <div>
            <div className="text-white font-bold text-sm leading-tight tracking-wide">CEO Summit IO</div>
            <div className="text-[#B8913A] font-medium text-[10px] tracking-widest uppercase leading-tight mt-0.5">
              Investment Hub · Cluster Capital &amp; Finance
            </div>
          </div>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 lg:px-10 py-16">
        {children}
      </main>

      <footer className="max-w-3xl mx-auto px-6 lg:px-10 pb-16">
        <nav className="flex flex-wrap gap-6 pt-8 border-t border-white/6 text-sm text-white/40">
          <Link href="/" className="hover:text-white/70 transition-colors">← Retour à l&apos;accueil</Link>
          <Link href="/legal/cgu"     className="hover:text-white/70 transition-colors">CGU</Link>
          <Link href="/legal/privacy" className="hover:text-white/70 transition-colors">Politique de confidentialité</Link>
        </nav>
      </footer>
    </div>
  );
}
