import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Record<string, unknown>)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const protectedPaths = ["/dashboard", "/admin"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // S4 — Require confirmed email before accessing protected routes
  if (user && isProtected && !user.email_confirmed_at) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/verify-email";
    return NextResponse.redirect(url);
  }

  if (user && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user!.id).single();
    if (!profile || profile.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Enforce investor profile completion: redirect to /dashboard/investor-profile
  // if the investor hasn't created their profile yet (skip if already on that page
  // or if they're browsing the deal flow — progressive disclosure).
  const INVESTOR_PROFILE_EXEMPT = [
    "/dashboard/investor-profile",
    "/dashboard/deal-flow",
    "/dashboard/profile",
  ];
  if (
    user &&
    pathname.startsWith("/dashboard") &&
    !INVESTOR_PROFILE_EXEMPT.some(p => pathname.startsWith(p))
  ) {
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();

    if (profile?.role === "investor") {
      const { data: investorProfile } = await supabase
        .from("investor_profiles").select("id").eq("user_id", user.id).maybeSingle();

      if (!investorProfile) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard/investor-profile";
        url.searchParams.set("onboarding", "1");
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
