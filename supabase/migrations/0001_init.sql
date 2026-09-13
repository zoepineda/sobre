-- Sobre — initial Postgres schema (option 2: hosted + RLS)
--
-- Multi-tenant-ready single-tenant: every table carries user_id and is
-- locked down with row-level security keyed to auth.uid(). Parent FKs are
-- composite (id, user_id) so a row can never reference another user's
-- account/envelope even by guessing ids.
--
-- Amounts are integer centavos, same as the SQLite schema.

-- ── accounts ────────────────────────────────────────────────────────────
create table accounts (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  type text not null check (type in ('bank', 'ewallet', 'cash', 'credit_card')),
  archived boolean not null default false,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

-- ── envelope groups ─────────────────────────────────────────────────────
create table groups (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  archived boolean not null default false,
  sort integer not null default 0,
  unique (id, user_id)
);

-- ── categories (envelopes) ──────────────────────────────────────────────
create table categories (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  archived boolean not null default false,
  sort integer not null default 0,
  is_system boolean not null default false,
  group_id bigint,
  payday_target bigint not null default 0,
  payday_account_id bigint,
  unique (id, user_id),
  foreign key (group_id, user_id) references groups (id, user_id),
  foreign key (payday_account_id, user_id) references accounts (id, user_id)
);

-- ── transactions ────────────────────────────────────────────────────────
create table transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null check (type in ('expense', 'income', 'transfer', 'card_payment', 'opening')),
  date date not null,
  note text not null default '',
  payee text not null default '',
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

-- ── ledger lines: signed deltas on (account, envelope) pairs ────────────
create table lines (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  transaction_id bigint not null,
  account_id bigint not null,
  category_id bigint not null,
  amount bigint not null,
  foreign key (transaction_id, user_id) references transactions (id, user_id) on delete cascade,
  foreign key (account_id, user_id) references accounts (id, user_id),
  foreign key (category_id, user_id) references categories (id, user_id)
);

create index idx_lines_txn on lines (transaction_id);
create index idx_lines_account on lines (user_id, account_id);
create index idx_lines_category on lines (user_id, category_id);

-- ── recurring bills ─────────────────────────────────────────────────────
create table bills (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  expected_amount bigint not null,
  account_id bigint not null,
  category_id bigint not null,
  archived boolean not null default false,
  sort integer not null default 0,
  unique (id, user_id),
  foreign key (account_id, user_id) references accounts (id, user_id),
  foreign key (category_id, user_id) references categories (id, user_id)
);

create table bill_payments (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  bill_id bigint not null,
  month text not null,
  transaction_id bigint not null,
  unique (bill_id, month),
  foreign key (bill_id, user_id) references bills (id, user_id) on delete cascade,
  foreign key (transaction_id, user_id) references transactions (id, user_id) on delete cascade
);

-- ── receipt items ───────────────────────────────────────────────────────
create table items (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  transaction_id bigint not null,
  name text not null,
  amount bigint not null default 0,
  foreign key (transaction_id, user_id) references transactions (id, user_id) on delete cascade
);

create index idx_items_txn on items (transaction_id);

-- ── row-level security: you can only ever touch your own rows ───────────
do $$
declare t text;
begin
  foreach t in array array[
    'accounts','groups','categories','transactions','lines',
    'bills','bill_payments','items'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy "own rows" on %I for all to authenticated
         using (user_id = (select auth.uid()))
         with check (user_id = (select auth.uid()))', t);
  end loop;
end $$;
