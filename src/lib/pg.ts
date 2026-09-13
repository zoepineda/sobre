import postgres from "postgres";

// Server-side Postgres client (Supabase). Queries filter by user_id from the
// session; RLS on the tables is defense-in-depth for the public Data API.
declare global {
  // eslint-disable-next-line no-var
  var __sobreSql: ReturnType<typeof postgres> | undefined;
}

export const sql =
  globalThis.__sobreSql ??
  postgres(process.env.DATABASE_URL!, {
    max: 4,
    idle_timeout: 20,
    connect_timeout: 10,
    // Supabase transaction pooler (needed on Vercel) can't do prepared statements
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") globalThis.__sobreSql = sql;
