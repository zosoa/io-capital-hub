import Link from "next/link";
export default function NotFound() {
  return (
    <div className="ed min-h-screen bg-[#F7F5F1] flex items-center justify-center text-center px-4">
      <div>
        <div className="font-display text-8xl font-bold text-[#BC5A34] mb-4">404</div>
        <h1 className="font-display text-2xl font-semibold text-[#22201B] mb-2">Page introuvable</h1>
        <p className="text-[#918A7C] mb-6">Cette page n&apos;existe pas ou a été déplacée.</p>
        <Link href="/" className="btn-primary inline-flex">← Retour à l&apos;accueil</Link>
      </div>
    </div>
  );
}
