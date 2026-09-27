import { sql } from "@/lib/pg";

export const dynamic = "force-dynamic";

// Pinged daily by Vercel Cron (see vercel.json) so the free-tier Supabase
// project registers activity and never auto-pauses again.
export async function GET() {
  await sql`SELECT 1`;
  return Response.json({ ok: true, at: new Date().toISOString() });
}
