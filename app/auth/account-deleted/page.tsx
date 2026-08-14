import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Terminal screen shown to any user whose profile.deleted_at is set.
 * The dashboard layout redirects here before allowing any further access.
 *
 * We also sign the user out at the Auth layer so subsequent tabs / reloads
 * won't re-enter the dashboard. Idempotent: already-signed-out users still
 * see the message.
 */
export default async function AccountDeletedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If someone lands here with a live session but an un-anonymized profile,
  // bounce them back to the dashboard — this screen is only for the
  // deleted_at set state.
  if (user) {
    const { data: profile } = await supabase
      .from("profiles").select("deleted_at").eq("id", user.id).maybeSingle();
    if (profile && !profile.deleted_at) redirect("/dashboard");
    // Session still open — sign out so next request is clean.
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen ed bg-[#F7F5F1] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="flex flex-col items-center gap-3 mb-10">
          <img src="/landing/ceo-logo.png" alt="CEO Summit" className="h-9 w-auto"/>
          <div>
            <div className="font-bold text-[#22201B] text-sm tracking-wide">CEO Summit IO</div>
            <div className="text-[#BC5A34] text-xs tracking-[0.15em] uppercase mt-0.5">
              Investment Hub · Cluster Capital &amp; Finance
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-2xl p-10 border border-[#EAE4D8]">
          <div className="w-16 h-16 bg-[#F7F5F1] border border-[#E2DACB] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#575249]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#22201B] mb-3">Compte supprimé</h1>
          <p className="text-[#575249] text-sm leading-relaxed mb-6">
            Votre compte a été anonymisé à votre demande. Vos données personnelles ont été supprimées
            de la plateforme, conformément à notre politique de confidentialité.
          </p>
          <p className="text-[#918A7C] text-xs leading-relaxed mb-8">
            Les dossiers et interactions historiques sont conservés de façon anonymisée pour
            l&apos;intégrité des audits. Vous n&apos;avez plus accès à cet espace.
          </p>
          <Link href="/" className="btn-primary w-full justify-center py-3">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
