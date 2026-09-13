import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { cache } from "react";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (all) => {
          try {
            all.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from a server component — middleware refreshes instead
          }
        },
      },
    }
  );
}

export type SessionUser = {
  id: string;
  email: string | null;
  name: string | null;
  firstName: string | null;
  avatarUrl: string | null;
};

// Verifies the JWT locally (asymmetric keys) — no auth-server round trip.
const getClaims = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims ?? null;
});

// Nullable variant for chrome (nav, greetings) — never redirects.
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const claims = await getClaims();
  if (!claims) return null;
  const meta = (claims.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    (meta.full_name as string) || (meta.name as string) || null;
  return {
    id: claims.sub,
    email: (claims.email as string) ?? null,
    name,
    firstName: name ? name.split(" ")[0] : null,
    avatarUrl: (meta.avatar_url as string) || (meta.picture as string) || null,
  };
});

// Per-request cached user id; redirects to /login when signed out.
export const getUserId = cache(async (): Promise<string> => {
  const claims = await getClaims();
  if (!claims) redirect("/login");
  return claims.sub;
});
