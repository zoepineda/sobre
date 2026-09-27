import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Refreshes the Supabase session cookie and walls off the app for
// signed-out visitors (everything except /login and static assets).
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (all) => {
          all.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          all.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;

  const path = request.nextUrl.pathname;
  const isLogin = path.startsWith("/login") || path.startsWith("/auth/callback");
  const isPublic = isLogin || path.startsWith("/welcome");
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    // fresh visitors get the landing page; deep links still go to login
    url.pathname = path === "/" ? "/welcome" : "/login";
    return NextResponse.redirect(url);
  }
  if (user && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|brands/|tutorial.mp4|api/keepalive|icon.svg|favicon.ico).*)",
  ],
};
