import db from "./db";

export type Account = {
  id: number;
  name: string;
  type: "bank" | "ewallet" | "cash" | "credit_card";
  archived: number;
  sort: number;
  balance: number;
};

export type Category = {
  id: number;
  name: string;
  archived: number;
  is_system: number;
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
  archived: number;
  sort: number;
  balance: number;
};

export function getGroups(): Group[] {
  return db
    .prepare(
      `SELECT g.*, COALESCE((
         SELECT SUM(l.amount) FROM lines l
         JOIN categories c ON c.id = l.category_id
         WHERE c.group_id = g.id AND c.archived = 0
       ), 0) AS balance
       FROM groups g WHERE g.archived = 0
       ORDER BY g.sort, g.id`
    )
    .all() as Group[];
}

// Money that left a group's envelopes: transactions whose net effect on the
// group is negative (expenses and transfers out; card payments net to zero
// because the spend was already recorded at swipe time).
export function getGroupOutflows(groupId: number, limit = 50) {
  return db
    .prepare(
      `SELECT t.id, t.type, t.date, t.note,
        SUM(l.amount) AS amount,
        GROUP_CONCAT(DISTINCT c.name) AS category_names,
        GROUP_CONCAT(DISTINCT a.name) AS account_names
       FROM transactions t
       JOIN lines l ON l.transaction_id = t.id
       JOIN categories c ON c.id = l.category_id AND c.group_id = ?
       JOIN accounts a ON a.id = l.account_id
       GROUP BY t.id HAVING SUM(l.amount) < 0
       ORDER BY t.date DESC, t.id DESC LIMIT ?`
    )
    .all(groupId, limit) as {
    id: number;
    type: string;
    date: string;
    note: string;
    amount: number;
    category_names: string;
    account_names: string;
  }[];
}

// Which envelopes' money sits in this account (the reverse of
// getCategoryHoldings). For credit cards, negative sums = envelope owes card.
export function getAccountEnvelopes(accountId: number) {
  return db
    .prepare(
      `SELECT c.id AS category_id, c.name, SUM(l.amount) AS amount
       FROM lines l JOIN categories c ON c.id = l.category_id
       WHERE l.account_id = ?
       GROUP BY c.id HAVING SUM(l.amount) != 0
       ORDER BY amount DESC`
    )
    .all(accountId) as { category_id: number; name: string; amount: number }[];
}

export function getAccountTransactions(accountId: number, limit = 50) {
  return db
    .prepare(
      `SELECT t.id, t.type, t.date, t.note,
        SUM(l.amount) AS amount,
        GROUP_CONCAT(DISTINCT c.name) AS category_names
       FROM transactions t
       JOIN lines l ON l.transaction_id = t.id AND l.account_id = ?
       JOIN categories c ON c.id = l.category_id
       GROUP BY t.id
       ORDER BY t.date DESC, t.id DESC LIMIT ?`
    )
    .all(accountId, limit) as {
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

export function getBills(month: string): Bill[] {
  return db
    .prepare(
      `SELECT b.*, a.name AS account_name, c.name AS category_name,
        (SELECT bp.transaction_id FROM bill_payments bp
          WHERE bp.bill_id = b.id AND bp.month = ?) AS paid_transaction_id
       FROM bills b
       JOIN accounts a ON a.id = b.account_id
       JOIN categories c ON c.id = b.category_id
       WHERE b.archived = 0
       ORDER BY b.sort, b.id`
    )
    .all(month) as Bill[];
}

export function getAccounts(includeArchived = false): Account[] {
  return db
    .prepare(
      `SELECT a.*, COALESCE(SUM(l.amount), 0) AS balance
       FROM accounts a LEFT JOIN lines l ON l.account_id = a.id
       ${includeArchived ? "" : "WHERE a.archived = 0"}
       GROUP BY a.id ORDER BY a.sort, a.id`
    )
    .all() as Account[];
}

export function getCategories(includeArchived = false): Category[] {
  return db
    .prepare(
      `SELECT c.*, a.name AS payday_account_name,
        COALESCE(SUM(l.amount), 0) AS balance
       FROM categories c
       LEFT JOIN accounts a ON a.id = c.payday_account_id
       LEFT JOIN lines l ON l.category_id = c.id
       ${includeArchived ? "" : "WHERE c.archived = 0"}
       GROUP BY c.id ORDER BY c.sort, c.id`
    )
    .all() as Category[];
}

// Per-category debt on a credit card account (negative pair sum = owed).
export function getCardDebts(cardAccountId: number) {
  return db
    .prepare(
      `SELECT c.id AS category_id, c.name, -SUM(l.amount) AS owed
       FROM lines l JOIN categories c ON c.id = l.category_id
       WHERE l.account_id = ?
       GROUP BY c.id HAVING SUM(l.amount) < 0
       ORDER BY owed DESC`
    )
    .all(cardAccountId) as { category_id: number; name: string; owed: number }[];
}

// Where a category's cash physically sits (excludes credit cards).
export function getCategoryHoldings(categoryId: number) {
  return db
    .prepare(
      `SELECT a.id AS account_id, a.name, SUM(l.amount) AS amount
       FROM lines l JOIN accounts a ON a.id = l.account_id
       WHERE l.category_id = ? AND a.type != 'credit_card'
       GROUP BY a.id HAVING SUM(l.amount) != 0
       ORDER BY amount DESC`
    )
    .all(categoryId) as { account_id: number; name: string; amount: number }[];
}

// All (category → cash-account) holdings in one query, for the dashboard.
export function getAllCategoryHoldings() {
  const rows = db
    .prepare(
      `SELECT l.category_id, a.name, SUM(l.amount) AS amount
       FROM lines l JOIN accounts a ON a.id = l.account_id
       WHERE a.type != 'credit_card'
       GROUP BY l.category_id, a.id HAVING SUM(l.amount) != 0
       ORDER BY amount DESC`
    )
    .all() as { category_id: number; name: string; amount: number }[];
  const map = new Map<number, { name: string; amount: number }[]>();
  for (const r of rows) {
    const list = map.get(r.category_id) ?? [];
    list.push({ name: r.name, amount: r.amount });
    map.set(r.category_id, list);
  }
  return map;
}

// Card statement balance: net position on/before the cutoff date, treating
// payments as covering oldest charges first. Clamped to [0, total owed].
export function getStatementBalance(cardAccountId: number, cutoffISO: string) {
  const total = (db
    .prepare(`SELECT COALESCE(-SUM(amount), 0) AS owed FROM lines WHERE account_id = ?`)
    .get(cardAccountId) as { owed: number }).owed;
  const upTo = (db
    .prepare(
      `SELECT COALESCE(-SUM(l.amount), 0) AS owed
       FROM lines l JOIN transactions t ON t.id = l.transaction_id
       WHERE l.account_id = ? AND t.date <= ?`
    )
    .get(cardAccountId, cutoffISO) as { owed: number }).owed;
  return { total: Math.max(0, total), statement: Math.min(Math.max(0, upTo), Math.max(0, total)) };
}

// This-month spending per category (expenses only, cash and card).
export function getMonthSpend(monthPrefix: string) {
  return db
    .prepare(
      `SELECT c.id AS category_id, c.name, -SUM(l.amount) AS spent
       FROM lines l
       JOIN transactions t ON t.id = l.transaction_id
       JOIN categories c ON c.id = l.category_id
       WHERE t.type = 'expense' AND t.date LIKE ? || '%'
       GROUP BY c.id HAVING SUM(l.amount) < 0
       ORDER BY spent DESC`
    )
    .all(monthPrefix) as { category_id: number; name: string; spent: number }[];
}

// Distinct payees, most-used first — feeds the autocomplete.
export function getPayeeSuggestions(limit = 40): string[] {
  return (db
    .prepare(
      `SELECT payee FROM transactions WHERE payee != ''
       GROUP BY payee ORDER BY COUNT(*) DESC, MAX(date) DESC LIMIT ?`
    )
    .all(limit) as { payee: string }[]).map((r) => r.payee);
}

export function getTopPayees(monthPrefix: string, limit = 8) {
  return db
    .prepare(
      `SELECT t.payee, COUNT(*) AS times,
        -SUM((SELECT SUM(l.amount) FROM lines l WHERE l.transaction_id = t.id)) AS spent
       FROM transactions t
       WHERE t.type = 'expense' AND t.payee != '' AND t.date LIKE ? || '%'
       GROUP BY t.payee ORDER BY spent DESC LIMIT ?`
    )
    .all(monthPrefix, limit) as { payee: string; times: number; spent: number }[];
}

export function getPayeeTransactions(payee: string, limit = 100) {
  return db
    .prepare(
      `SELECT t.id, t.type, t.date, t.note, t.payee,
        (SELECT SUM(l.amount) FROM lines l WHERE l.transaction_id = t.id) AS amount,
        (SELECT GROUP_CONCAT(DISTINCT c.name) FROM lines l JOIN categories c ON c.id = l.category_id WHERE l.transaction_id = t.id) AS category_names,
        (SELECT GROUP_CONCAT(DISTINCT a.name) FROM lines l JOIN accounts a ON a.id = l.account_id WHERE l.transaction_id = t.id) AS account_names,
        (SELECT GROUP_CONCAT(i.name, ', ') FROM items i WHERE i.transaction_id = t.id) AS item_names
       FROM transactions t
       WHERE t.payee = ? AND t.type = 'expense'
       ORDER BY t.date DESC, t.id DESC LIMIT ?`
    )
    .all(payee, limit) as {
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

export function getTransactionItems(transactionId: number) {
  return db
    .prepare(`SELECT name, amount FROM items WHERE transaction_id = ? ORDER BY id`)
    .all(transactionId) as { name: string; amount: number }[];
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

export function getRecentTransactions(
  limit = 30,
  from?: string,
  to?: string
): FeedItem[] {
  const where =
    from && to
      ? `WHERE t.date BETWEEN '${from.replace(/[^0-9-]/g, "")}' AND '${to.replace(/[^0-9-]/g, "")}'`
      : from
        ? `WHERE t.date >= '${from.replace(/[^0-9-]/g, "")}'`
        : to
          ? `WHERE t.date <= '${to.replace(/[^0-9-]/g, "")}'`
          : "";
  return db
    .prepare(
      `SELECT t.id, t.type, t.date, t.note, t.payee,
        (SELECT GROUP_CONCAT(i.name, ', ') FROM items i WHERE i.transaction_id = t.id) AS item_names,
        CASE t.type
          WHEN 'expense' THEN (SELECT SUM(l.amount) FROM lines l WHERE l.transaction_id = t.id)
          WHEN 'income' THEN (SELECT SUM(l.amount) FROM lines l WHERE l.transaction_id = t.id)
          WHEN 'card_payment' THEN (SELECT SUM(l.amount) FROM lines l JOIN accounts a ON a.id = l.account_id WHERE l.transaction_id = t.id AND a.type != 'credit_card')
          ELSE (SELECT SUM(CASE WHEN l.amount > 0 THEN l.amount ELSE 0 END) FROM lines l WHERE l.transaction_id = t.id)
        END AS amount,
        (SELECT GROUP_CONCAT(DISTINCT a.name) FROM lines l JOIN accounts a ON a.id = l.account_id WHERE l.transaction_id = t.id) AS account_names,
        (SELECT GROUP_CONCAT(DISTINCT c.name) FROM lines l JOIN categories c ON c.id = l.category_id WHERE l.transaction_id = t.id) AS category_names
       FROM transactions t
       ${where}
       ORDER BY t.date DESC, t.id DESC
       LIMIT ?`
    )
    .all(limit) as FeedItem[];
}
