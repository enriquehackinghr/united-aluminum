import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import { getSupabasePublishableKey, getSupabaseUrl } from "./env";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
  return to;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith("/admin") || path.startsWith("/api/admin");

  if (isAdminRoute && !isAdminEmail(email)) {
    if (path.startsWith("/api/")) {
      return copyCookies(
        supabaseResponse,
        NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      );
    }

    const url = request.nextUrl.clone();
    url.search = "";
    if (!data?.claims) {
      url.pathname = "/login";
      url.searchParams.set("next", "/admin");
    } else {
      url.pathname = "/account";
    }

    return copyCookies(supabaseResponse, NextResponse.redirect(url));
  }

  return supabaseResponse;
}
