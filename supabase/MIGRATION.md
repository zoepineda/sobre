# Sobre → Supabase migration plan (option 2: hosted + RLS)

## Decision record
- Hosted Postgres on Supabase; **not** end-to-end encrypted (the server
  computes envelope/card aggregates in SQL — see PRD discussion).
- Privacy model: RLS on every table (`user_id = auth.uid()`), composite
  FKs so rows can't reference another user's parents, signups disabled
  after the owner's account exists, no bank credentials ever stored.

## Steps
1. **(Owner, one-time)** Create a Supabase organization at supabase.com
   (free tier). Everything below is automated from the session.
2. Create project (region: `ap-southeast-1` Singapore — closest to PH),
   apply `migrations/0001_init.sql`.
3. Auth: email + password. Owner signs up once; then disable new signups
   (Dashboard → Auth → Sign In / Up → toggle off "Allow new users").
4. Port the data layer: `src/lib/db.ts` (better-sqlite3, sync) →
   Postgres. Queries keep their raw-SQL shape with dialect changes:
   `GROUP_CONCAT` → `string_agg`, `?` → `$n`, month prefix `LIKE` →
   `date_trunc`, integer PKs unchanged in meaning. All server actions
   run server-side with the user's session; RLS is defense-in-depth.
5. One-time data import: read `data/finance.db` locally, insert rows
   with the owner's `user_id`, preserving ids/order (verify: account,
   envelope, and card-debt totals must match SQLite exactly).
6. Deploy (Vercel), point the phone at the real URL, retire the LAN
   dev-server setup and self-signed certs.
