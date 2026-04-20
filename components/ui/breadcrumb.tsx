import Link from "next/link";

interface Crumb { label: string; href?: string; }

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 mb-6 text-sm flex-wrap" aria-label="Breadcrumb">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-white/20">/</span>}
          {c.href ? (
            <Link href={c.href} className="text-white/35 hover:text-[#B8913A] transition-colors">
              {c.label}
            </Link>
          ) : (
            <span className="text-white/70 font-medium">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
