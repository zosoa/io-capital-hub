import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center text-center px-4">
      <div>
        <div className="text-8xl font-black gradient-text mb-4">404</div>
        <h1 className="text-2xl font-black text-white mb-2">Page introuvable</h1>
        <p className="text-gray-400 mb-6">Cette page n&apos;existe pas ou a été déplacée.</p>
        <Link href="/" className="btn-primary inline-flex">← Retour à l&apos;accueil</Link>
      </div>
    </div>
  );
}
