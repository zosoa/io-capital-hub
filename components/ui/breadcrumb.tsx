import Link from "next/link";

interface Crumb { label: string; href?: string; }

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 mb-6 text-sm flex-wrap" aria-label="Breadcrumb">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-[#B3AA9C]">/</span>}
          {c.href ? (
            <Link href={c.href} className="text-[#918A7C] hover:text-[#1F4E79] transition-colors">
              {c.label}
            </Link>
          ) : (
            <span className="text-[#575249] font-medium">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
