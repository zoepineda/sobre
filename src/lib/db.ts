import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// Ledger model: every transaction is a set of lines, each a signed delta on an
// (account, category) pair. Account balance = sum of its lines; category
// balance = sum of its lines; the envelope-per-account split falls out of the
// pair sums. A credit-card swipe is a negative line on the card account, which
// simultaneously lowers the category's available money and records the debt.

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "finance.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank','ewallet','cash','credit_card')),
  archived INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  archived INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 0,
  is_system INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('expense','income','transfer','card_payment','opening')),
  date TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS lines (
  id INTEGER PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  amount INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  archived INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS bills (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  expected_amount INTEGER NOT NULL,
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  archived INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS bill_payments (
  id INTEGER PRIMARY KEY,
  bill_id INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  UNIQUE (bill_id, month)
);
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_items_txn ON items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_lines_txn ON lines(transaction_id);
CREATE INDEX IF NOT EXISTS idx_lines_account ON lines(account_id);
CREATE INDEX IF NOT EXISTS idx_lines_category ON lines(category_id);
`);

// Migration: envelope grouping (added after v1).
const catCols = db.prepare(`PRAGMA table_info(categories)`).all() as { name: string }[];
if (!catCols.some((c) => c.name === "group_id")) {
  db.exec(`ALTER TABLE categories ADD COLUMN group_id INTEGER REFERENCES groups(id)`);
}
// Payday allocation template: how much goes into this envelope each cutoff,
// and which account that money physically lands in.
if (!catCols.some((c) => c.name === "payday_target")) {
  db.exec(`ALTER TABLE categories ADD COLUMN payday_target INTEGER NOT NULL DEFAULT 0`);
}
if (!catCols.some((c) => c.name === "payday_account_id")) {
  db.exec(`ALTER TABLE categories ADD COLUMN payday_account_id INTEGER REFERENCES accounts(id)`);
}

// Migration: payee ("what/where exactly") on transactions.
const txnCols = db.prepare(`PRAGMA table_info(transactions)`).all() as { name: string }[];
if (!txnCols.some((c) => c.name === "payee")) {
  db.exec(`ALTER TABLE transactions ADD COLUMN payee TEXT NOT NULL DEFAULT ''`);
}

// Seed the built-in Unassigned envelope for money that hasn't been
// distributed to a real category yet (e.g. opening balances).
const hasUnassigned = db
  .prepare(`SELECT id FROM categories WHERE is_system = 1`)
  .get();
if (!hasUnassigned) {
  db.prepare(
    `INSERT INTO categories (name, is_system, sort) VALUES ('Unassigned', 1, 9999)`
  ).run();
}

export default db;
