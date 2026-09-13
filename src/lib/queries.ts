import { sql } from "./pg";
import { getUserId } from "./supabase/server";

// All reads filter by the session's user_id (RLS on the tables guards the
// public Data API; these direct queries enforce ownership themselves).
// Aggregates are cast ::int — pg returns bigint sums as strings otherwise.

export type Account = {
  id: number;
  name: string;
  type: "bank" | "ewallet" | "cash" | "credit_card";
  archived: boolean;
  sort: number;
  balance: number;
};

export type Category = {
  id: number;
  name: string;
  icon: string;
  archived: boolean;
  is_system: boolean;
  sort: number;
  group_id: number | null;
  payday_target: number;
  payday_account_id: number | null;
  payday_account_name: string | null;
  balance: number;
};

export type Group = {
  id: number;
  name: string;
  archived: boolean;
  sort: number;
  balance: number;
};

export async function getAccounts(includeArchived = false): Promise<Account[]> {
  const uid = await getUserId();
  return (await sql`
    SELECT a.id, a.name, a.type, a.archived, a.sort,
      COALESCE(SUM(l.amount), 0)::int AS balance
    FROM accounts a
    LEFT JOIN lines l ON l.account_id = a.id
    WHERE a.user_id = ${uid}
      AND (${includeArchived} OR a.archived = false)
    GROUP BY a.id ORDER BY a.sort, a.id`) as unknown as Account[];
}

export async function getCategories(
  includeArchived = false
): Promise<Category[]> {
  const uid = await getUserId();
  return (await sql`
    SELECT c.id, c.name, c.icon, c.archived, c.is_system, c.sort, c.group_id,
      c.payday_target, c.payday_account_id,
      a.name AS payday_account_name,
      COALESCE(SUM(l.amount), 0)::int AS balance
    FROM categories c
    LEFT JOIN accounts a ON a.id = c.payday_account_id
    LEFT JOIN lines l ON l.category_id = c.id
    WHERE c.user_id = ${uid}
      AND (${includeArchived} OR c.archived = false)
    GROUP BY c.id, a.name ORDER BY c.sort, c.id`) as unknown as Category[];
}

export async function getGroups(): Promise<Group[]> {
  const uid = await getUserId();
  return (await sql`
    SELECT g.id, g.name, g.archived, g.sort,
      COALESCE((
        SELECT SUM(l.amount) FROM lines l
        JOIN categories c ON c.id = l.category_id
        WHERE c.group_id = g.id AND c.archived = false
      ), 0)::int AS balance
    FROM groups g
    WHERE g.user_id = ${uid} AND g.archived = false
    ORDER BY g.sort, g.id`) as unknown as Group[];
}

export async function getGroupById(id: number) {
  const uid = await getUserId();
  const rows = await sql`
    SELECT id, name FROM groups WHERE id = ${id} AND user_id = ${uid}`;
  return rows[0] as { id: number; name: string } | undefined;
}

export async function getAccountById(id: number) {
  const uid = await getUserId();
  const rows = await sql`
    SELECT id, name, type FROM accounts WHERE id = ${id} AND user_id = ${uid}`;
  return rows[0] as { id: number; name: string; type: string } | undefined;
}

export async function getGroupOutflows(groupId: number, limit = 50) {
  const uid = await getUserId();
  return (await sql`
    SELECT t.id, t.type, t.date::text AS date, t.note,
      SUM(l.amount)::int AS amount,
      string_agg(DISTINCT c.name, ',') AS category_names,
      string_agg(DISTINCT a.name, ',') AS account_names
    FROM transactions t
    JOIN lines l ON l.transaction_id = t.id
    JOIN categories c ON c.id = l.category_id AND c.group_id = ${groupId}
    JOIN accounts a ON a.id = l.account_id
    WHERE t.user_id = ${uid}
    GROUP BY t.id HAVING SUM(l.amount) < 0
    ORDER BY t.date DESC, t.id DESC LIMIT ${limit}`) as unknown as {
    id: number;
    type: string;
    date: string;
    note: string;
    amount: number;
    category_names: string;
    account_names: string;
  }[];
}

export async function getAccountEnvelopes(accountId: number) {
  const uid = await getUserId();
  return (await sql`
    SELECT c.id AS category_id, c.name, SUM(l.amount)::int AS amount
    FROM lines l JOIN categories c ON c.id = l.category_id
    WHERE l.account_id = ${accountId} AND l.user_id = ${uid}
    GROUP BY c.id HAVING SUM(l.amount) != 0
    ORDER BY SUM(l.amount) DESC`) as unknown as {
    category_id: number;
    name: string;
    amount: number;
  }[];
}

export async function getAccountTransactions(accountId: number, limit = 50) {
  const uid = await getUserId();
  return (await sql`
    SELECT t.id, t.type, t.date::text AS date, t.note,
      SUM(l.amount)::int AS amount,
      string_agg(DISTINCT c.name, ',') AS category_names
    FROM transactions t
    JOIN lines l ON l.transaction_id = t.id AND l.account_id = ${accountId}
    JOIN categories c ON c.id = l.category_id
    WHERE t.user_id = ${uid}
    GROUP BY t.id
    ORDER BY t.date DESC, t.id DESC LIMIT ${limit}`) as unknown as {
    id: number;
    type: string;
    date: string;
    note: string;
    amount: number;
    category_names: string;
  }[];
}

export type Bill = {
  id: number;
  name: string;
  expected_amount: number;
  account_id: number;
  category_id: number;
  account_name: string;
  category_name: string;
  paid_transaction_id: number | null;
};

export async function getBills(month: string): Promise<Bill[]> {
  const uid = await getUserId();
  return (await sql`
    SELECT b.id, b.name, b.expected_amount, b.account_id, b.category_id,
      a.name AS account_name, c.name AS category_name,
      (SELECT bp.transaction_id FROM bill_payments bp
        WHERE bp.bill_id = b.id AND bp.month = ${month}) AS paid_transaction_id
    FROM bills b
    JOIN accounts a ON a.id = b.account_id
    JOIN categories c ON c.id = b.category_id
    WHERE b.user_id = ${uid} AND b.archived = false
    ORDER BY b.sort, b.id`) as unknown as Bill[];
}

export async function getCardDebts(cardAccountId: number) {
  const uid = await getUserId();
  return (await sql`
    SELECT c.id AS category_id, c.name, -SUM(l.amount)::int AS owed
    FROM lines l JOIN categories c ON c.id = l.category_id
    WHERE l.account_id = ${cardAccountId} AND l.user_id = ${uid}
    GROUP BY c.id HAVING SUM(l.amount) < 0
    ORDER BY SUM(l.amount) ASC`) as unknown as {
    category_id: number;
    name: string;
    owed: number;
  }[];
}

export async function getCategoryHoldings(categoryId: number) {
  const uid = await getUserId();
  return (await sql`
    SELECT a.id AS account_id, a.name, SUM(l.amount)::int AS amount
    FROM lines l JOIN accounts a ON a.id = l.account_id
    WHERE l.category_id = ${categoryId} AND l.user_id = ${uid}
      AND a.type != 'credit_card'
    GROUP BY a.id HAVING SUM(l.amount) != 0
    ORDER BY SUM(l.amount) DESC`) as unknown as {
    account_id: number;
    name: string;
    amount: number;
  }[];
}

export async function getAllCategoryHoldings() {
  const uid = await getUserId();
  const rows = (await sql`
    SELECT l.category_id, a.name, SUM(l.amount)::int AS amount
    FROM lines l JOIN accounts a ON a.id = l.account_id
    WHERE l.user_id = ${uid} AND a.type != 'credit_card'
    GROUP BY l.category_id, a.id HAVING SUM(l.amount) != 0
    ORDER BY SUM(l.amount) DESC`) as unknown as {
    category_id: number;
    name: string;
    amount: number;
  }[];
  const map = new Map<number, { name: string; amount: number }[]>();
  for (const r of rows) {
    const list = map.get(r.category_id) ?? [];
    list.push({ name: r.name, amount: r.amount });
    map.set(r.category_id, list);
  }
  return map;
}

export async function getStatementBalance(
  cardAccountId: number,
  cutoffISO: string
) {
  const uid = await getUserId();
  const [{ owed: total }] = (await sql`
    SELECT COALESCE(-SUM(amount), 0)::int AS owed FROM lines
    WHERE account_id = ${cardAccountId} AND user_id = ${uid}`) as unknown as {
    owed: number;
  }[];
  const [{ owed: upTo }] = (await sql`
    SELECT COALESCE(-SUM(l.amount), 0)::int AS owed
    FROM lines l JOIN transactions t ON t.id = l.transaction_id
    WHERE l.account_id = ${cardAccountId} AND l.user_id = ${uid}
      AND t.date <= ${cutoffISO}`) as unknown as { owed: number }[];
  return {
    total: Math.max(0, total),
    statement: Math.min(Math.max(0, upTo), Math.max(0, total)),
  };
}

export async function getMonthSpend(monthPrefix: string) {
  const uid = await getUserId();
  return (await sql`
    SELECT c.id AS category_id, c.name, -SUM(l.amount)::int AS spent
    FROM lines l
    JOIN transactions t ON t.id = l.transaction_id
    JOIN categories c ON c.id = l.category_id
    WHERE t.user_id = ${uid} AND t.type = 'expense'
      AND to_char(t.date, 'YYYY-MM') = ${monthPrefix}
    GROUP BY c.id HAVING SUM(l.amount) < 0
    ORDER BY SUM(l.amount) ASC`) as unknown as {
    category_id: number;
    name: string;
    spent: number;
  }[];
}

export async function getPayeeSuggestions(limit = 40): Promise<string[]> {
  const uid = await getUserId();
  const rows = (await sql`
    SELECT payee FROM transactions
    WHERE user_id = ${uid} AND payee != ''
    GROUP BY payee ORDER BY COUNT(*) DESC, MAX(date) DESC
    LIMIT ${limit}`) as unknown as { payee: string }[];
  return rows.map((r) => r.payee);
}

export async function getTopPayees(monthPrefix: string, limit = 8) {
  const uid = await getUserId();
  return (await sql`
    SELECT t.payee, COUNT(*)::int AS times,
      -SUM((SELECT SUM(l.amount) FROM lines l WHERE l.transaction_id = t.id))::int AS spent
    FROM transactions t
    WHERE t.user_id = ${uid} AND t.type = 'expense' AND t.payee != ''
      AND to_char(t.date, 'YYYY-MM') = ${monthPrefix}
    GROUP BY t.payee ORDER BY spent DESC LIMIT ${limit}`) as unknown as {
    payee: string;
    times: number;
    spent: number;
  }[];
}

export async function getTopPayeesAllTime(limit = 30) {
  const uid = await getUserId();
  return (await sql`
    SELECT t.payee, COUNT(*)::int AS times,
      -SUM((SELECT SUM(l.amount) FROM lines l WHERE l.transaction_id = t.id))::int AS spent
    FROM transactions t
    WHERE t.user_id = ${uid} AND t.type = 'expense' AND t.payee != ''
    GROUP BY t.payee ORDER BY spent DESC LIMIT ${limit}`) as unknown as {
    payee: string;
    times: number;
    spent: number;
  }[];
}

export async function getPayeeTransactions(payee: string, limit = 100) {
  const uid = await getUserId();
  return (await sql`
    SELECT t.id, t.type, t.date::text AS date, t.note, t.payee,
      (SELECT SUM(l.amount) FROM lines l WHERE l.transaction_id = t.id)::int AS amount,
      (SELECT string_agg(DISTINCT c.name, ',') FROM lines l JOIN categories c ON c.id = l.category_id WHERE l.transaction_id = t.id) AS category_names,
      (SELECT string_agg(DISTINCT a.name, ',') FROM lines l JOIN accounts a ON a.id = l.account_id WHERE l.transaction_id = t.id) AS account_names,
      (SELECT string_agg(i.name, ', ') FROM items i WHERE i.transaction_id = t.id) AS item_names
    FROM transactions t
    WHERE t.user_id = ${uid} AND t.payee = ${payee} AND t.type = 'expense'
    ORDER BY t.date DESC, t.id DESC LIMIT ${limit}`) as unknown as {
    id: number;
    date: string;
    note: string;
    payee: string;
    amount: number;
    category_names: string;
    account_names: string;
    item_names: string | null;
  }[];
}

export type FeedItem = {
  id: number;
  type: string;
  date: string;
  note: string;
  payee: string;
  amount: number;
  account_names: string;
  category_names: string;
  item_names: string | null;
};

export async function getRecentTransactions(
  limit = 30,
  from?: string,
  to?: string
): Promise<FeedItem[]> {
  const uid = await getUserId();
  return (await sql`
    SELECT t.id, t.type, t.date::text AS date, t.note, t.payee,
      (SELECT string_agg(i.name, ', ') FROM items i WHERE i.transaction_id = t.id) AS item_names,
      (CASE t.type
        WHEN 'expense' THEN (SELECT SUM(l.amount) FROM lines l WHERE l.transaction_id = t.id)
        WHEN 'income' THEN (SELECT SUM(l.amount) FROM lines l WHERE l.transaction_id = t.id)
        WHEN 'card_payment' THEN (SELECT SUM(l.amount) FROM lines l JOIN accounts a ON a.id = l.account_id WHERE l.transaction_id = t.id AND a.type != 'credit_card')
        ELSE (SELECT SUM(CASE WHEN l.amount > 0 THEN l.amount ELSE 0 END) FROM lines l WHERE l.transaction_id = t.id)
      END)::int AS amount,
      (SELECT string_agg(DISTINCT a.name, ',') FROM lines l JOIN accounts a ON a.id = l.account_id WHERE l.transaction_id = t.id) AS account_names,
      (SELECT string_agg(DISTINCT c.name, ',') FROM lines l JOIN categories c ON c.id = l.category_id WHERE l.transaction_id = t.id) AS category_names
    FROM transactions t
    WHERE t.user_id = ${uid}
      AND (${from ?? null}::date IS NULL OR t.date >= ${from ?? null}::date)
      AND (${to ?? null}::date IS NULL OR t.date <= ${to ?? null}::date)
    ORDER BY t.date DESC, t.id DESC
    LIMIT ${limit}`) as unknown as FeedItem[];
}
