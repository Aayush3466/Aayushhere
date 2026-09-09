import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

/**
 * PROXY (what Next 15 and earlier called middleware)
 * --------------------------------------------------
 * Two jobs, both cheap:
 *   1. keep the Supabase auth cookie fresh, so Server Components downstream see
 *      a valid session rather than an expired one;
 *   2. bounce a logged-out visitor away from the Studio before it renders.
 *
 * This is an OPTIMISTIC check only — it reads a cookie and redirects. It is not
 * the authorization boundary. The real check lives next to the data, in
 * `src/lib/auth/dal.ts`, and is repeated inside every server action; Postgres
 * RLS then refuses the write independently even if both were somehow bypassed.
 *
 * The matcher deliberately scopes this to /studio, so the public map never pays
 * for an auth round-trip.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // No backend configured yet: the Studio falls back to local-only editing.
  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() revalidates the token with the auth server and rotates the cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isLogin = path === "/studio/login";

  if (!user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/studio/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/studio";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/studio", "/studio/:path*"],
};
