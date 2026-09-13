"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import db from "./db";
import { toCentavos, todayISO } from "./format";

function insertTransaction(
  type: string,
  date: string,
  note: string,
  lines: { account_id: number; category_id: number; amount: number }[],
  payee = "",
  items: { name: string; amount: number }[] = []
) {
  const txn = db.transaction(() => {
    const { lastInsertRowid } = db
      .prepare(`INSERT INTO transactions (type, date, note, payee) VALUES (?, ?, ?, ?)`)
      .run(type, date, note, payee);
    const ins = db.prepare(
      `INSERT INTO lines (transaction_id, account_id, category_id, amount) VALUES (?, ?, ?, ?)`
    );
    for (const l of lines) {
      if (l.amount !== 0) ins.run(lastInsertRowid, l.account_id, l.category_id, l.amount);
    }
    const insItem = db.prepare(
      `INSERT INTO items (transaction_id, name, amount) VALUES (?, ?, ?)`
    );
    for (const i of items) {
      if (i.name.trim()) insItem.run(lastInsertRowid, i.name.trim(), i.amount);
    }
  });
  txn();
}

function done(path = "/") {
  revalidatePath("/", "layout");
  redirect(path);
}

export async function addExpense(formData: FormData) {
  const amount = toCentavos(formData.get("amount") as string);
  const accountId = Number(formData.get("account_id"));
  const categoryId = Number(formData.get("category_id"));
  const date = (formData.get("date") as string) || todayISO();
  const note = ((formData.get("note") as string) || "").trim();
  const payee = ((formData.get("payee") as string) || "").trim();
  if (!Number.isFinite(amount) || amount <= 0 || !accountId || !categoryId) return;

  const items: { name: string; amount: number }[] = [];
  for (const [key, value] of formData.entries()) {
    const m = /^item_name_(\d+)$/.exec(key);
    if (!m) continue;
    const name = String(value).trim();
    if (!name) continue;
    const amt = toCentavos((formData.get(`item_amount_${m[1]}`) as string) || "0");
    items.push({ name, amount: Number.isFinite(amt) && amt > 0 ? amt : 0 });
  }

  insertTransaction(
    "expense",
    date,
    note,
    [{ account_id: accountId, category_id: categoryId, amount: -amount }],
    payee,
    items
  );
  done("/");
}

export async function addIncome(formData: FormData) {
  const accountId = Number(formData.get("account_id"));
  const date = (formData.get("date") as string) || todayISO();
  const note = ((formData.get("note") as string) || "").trim();
  const splits: { account_id: number; category_id: number; amount: number }[] = [];
  for (const [key, value] of formData.entries()) {
    const m = /^split_(\d+)$/.exec(key);
    if (!m) continue;
    const amt = toCentavos(value as string);
    if (Number.isFinite(amt) && amt > 0) {
      splits.push({ account_id: accountId, category_id: Number(m[1]), amount: amt });
    }
  }
  if (!accountId || splits.length === 0) return;
  insertTransaction("income", date, note, splits);
  done("/");
}

// One-tap payday: creates a single income transaction that drops each
// envelope's per-cutoff target into its designated account.
export async function logPayday(formData: FormData) {
  const date = (formData.get("date") as string) || todayISO();
  const rows = db
    .prepare(
      `SELECT id, payday_target, payday_account_id FROM categories
       WHERE archived = 0 AND is_system = 0
         AND payday_target > 0 AND payday_account_id IS NOT NULL`
    )
    .all() as { id: number; payday_target: number; payday_account_id: number }[];
  if (rows.length === 0) return;

  insertTransaction(
    "income",
    date,
    "Payday allocation",
    rows.map((r) => ({
      account_id: r.payday_account_id,
      category_id: r.id,
      amount: r.payday_target,
    }))
  );
  done("/");
}

export async function addTransfer(formData: FormData) {
  const amount = toCentavos(formData.get("amount") as string);
  const fromAccount = Number(formData.get("from_account_id"));
  const fromCategory = Number(formData.get("from_category_id"));
  const toAccount = Number(formData.get("to_account_id"));
  const toCategory = Number(formData.get("to_category_id"));
  const date = (formData.get("date") as string) || todayISO();
  const note = ((formData.get("note") as string) || "").trim();
  if (!Number.isFinite(amount) || amount <= 0) return;
  if (fromAccount === toAccount && fromCategory === toCategory) return;

  insertTransaction("transfer", date, note, [
    { account_id: fromAccount, category_id: fromCategory, amount: -amount },
    { account_id: toAccount, category_id: toCategory, amount: amount },
  ]);
  done("/");
}

export async function payCard(formData: FormData) {
  const cardId = Number(formData.get("card_account_id"));
  const sourceId = Number(formData.get("source_account_id"));
  const date = (formData.get("date") as string) || todayISO();
  const note = ((formData.get("note") as string) || "").trim();
  const lines: { account_id: number; category_id: number; amount: number }[] = [];
  for (const [key, value] of formData.entries()) {
    const m = /^pay_(\d+)$/.exec(key);
    if (!m) continue;
    const amt = toCentavos(value as string);
    if (Number.isFinite(amt) && amt > 0) {
      const categoryId = Number(m[1]);
      lines.push({ account_id: sourceId, category_id: categoryId, amount: -amt });
      lines.push({ account_id: cardId, category_id: categoryId, amount: amt });
    }
  }
  if (!cardId || !sourceId || lines.length === 0) return;
  insertTransaction("card_payment", date, note, lines);
  done("/card");
}

export async function createAccount(formData: FormData) {
  const name = ((formData.get("name") as string) || "").trim();
  const type = formData.get("type") as string;
  const opening = toCentavos((formData.get("opening") as string) || "0");
  if (!name || !type) return;

  const { lastInsertRowid } = db
    .prepare(`INSERT INTO accounts (name, type) VALUES (?, ?)`)
    .run(name, type);

  if (Number.isFinite(opening) && opening !== 0 && type !== "credit_card") {
    const unassigned = db
      .prepare(`SELECT id FROM categories WHERE is_system = 1`)
      .get() as { id: number };
    insertTransaction("opening", todayISO(), `Opening balance — ${name}`, [
      { account_id: Number(lastInsertRowid), category_id: unassigned.id, amount: opening },
    ]);
  }
  done("/settings");
}

export async function createCategory(formData: FormData) {
  const name = ((formData.get("name") as string) || "").trim();
  if (!name) return;
  db.prepare(`INSERT INTO categories (name) VALUES (?)`).run(name);
  done("/settings");
}

export async function archiveAccount(formData: FormData) {
  const id = Number(formData.get("id"));
  const bal = (db
    .prepare(`SELECT COALESCE(SUM(amount), 0) AS b FROM lines WHERE account_id = ?`)
    .get(id) as { b: number }).b;
  if (bal !== 0) {
    done("/settings?error=account");
    return;
  }
  db.prepare(`UPDATE accounts SET archived = 1 WHERE id = ?`).run(id);
  done("/settings");
}

export async function archiveCategory(formData: FormData) {
  const id = Number(formData.get("id"));
  const bal = (db
    .prepare(`SELECT COALESCE(SUM(amount), 0) AS b FROM lines WHERE category_id = ?`)
    .get(id) as { b: number }).b;
  if (bal !== 0) {
    done("/settings?error=envelope");
    return;
  }
  db.prepare(`UPDATE categories SET archived = 1 WHERE id = ? AND is_system = 0`).run(id);
  done("/settings");
}

export async function unarchive(formData: FormData) {
  const kind = formData.get("kind") as string;
  const id = Number(formData.get("id"));
  if (kind === "account") {
    db.prepare(`UPDATE accounts SET archived = 0 WHERE id = ?`).run(id);
  } else if (kind === "envelope") {
    db.prepare(`UPDATE categories SET archived = 0 WHERE id = ?`).run(id);
  }
  done("/settings");
}

export async function reorderAccounts(ids: number[]) {
  const stmt = db.prepare(`UPDATE accounts SET sort = ? WHERE id = ?`);
  const tx = db.transaction(() => {
    ids.forEach((id, i) => stmt.run(i, id));
  });
  tx();
  revalidatePath("/", "layout");
}

export async function createGroup(formData: FormData) {
  const name = ((formData.get("name") as string) || "").trim();
  if (!name) return;
  db.prepare(`INSERT INTO groups (name) VALUES (?)`).run(name);
  done("/settings");
}

export async function archiveGroup(formData: FormData) {
  const id = Number(formData.get("id"));
  const tx = db.transaction(() => {
    db.prepare(`UPDATE categories SET group_id = NULL WHERE group_id = ?`).run(id);
    db.prepare(`UPDATE groups SET archived = 1 WHERE id = ?`).run(id);
  });
  tx();
  done("/settings");
}

export async function setCategoryGroup(formData: FormData) {
  const categoryId = Number(formData.get("category_id"));
  const groupId = Number(formData.get("group_id")) || null;
  db.prepare(`UPDATE categories SET group_id = ? WHERE id = ? AND is_system = 0`).run(
    groupId,
    categoryId
  );
  done("/settings");
}

export async function createBill(formData: FormData) {
  const name = ((formData.get("name") as string) || "").trim();
  const amount = toCentavos(formData.get("amount") as string);
  const accountId = Number(formData.get("account_id"));
  const categoryId = Number(formData.get("category_id"));
  if (!name || !Number.isFinite(amount) || amount <= 0 || !accountId || !categoryId) return;
  db.prepare(
    `INSERT INTO bills (name, expected_amount, account_id, category_id) VALUES (?, ?, ?, ?)`
  ).run(name, amount, accountId, categoryId);
  done("/settings");
}

export async function archiveBill(formData: FormData) {
  db.prepare(`UPDATE bills SET archived = 1 WHERE id = ?`).run(
    Number(formData.get("id"))
  );
  done("/settings");
}

// Tick = log the expense from the bill's envelope; untick = remove it.
export async function toggleBillPaid(formData: FormData) {
  const billId = Number(formData.get("bill_id"));
  const month = (formData.get("month") as string) || todayISO().slice(0, 7);
  const bill = db
    .prepare(`SELECT * FROM bills WHERE id = ?`)
    .get(billId) as
    | { id: number; name: string; expected_amount: number; account_id: number; category_id: number }
    | undefined;
  if (!bill) return;

  const existing = db
    .prepare(`SELECT id, transaction_id FROM bill_payments WHERE bill_id = ? AND month = ?`)
    .get(billId, month) as { id: number; transaction_id: number } | undefined;

  const tx = db.transaction(() => {
    if (existing) {
      db.prepare(`DELETE FROM transactions WHERE id = ?`).run(existing.transaction_id);
      db.prepare(`DELETE FROM bill_payments WHERE id = ?`).run(existing.id);
    } else {
      const { lastInsertRowid } = db
        .prepare(
          `INSERT INTO transactions (type, date, note, payee) VALUES ('expense', ?, ?, ?)`
        )
        .run(todayISO(), bill.name, bill.name);
      db.prepare(
        `INSERT INTO lines (transaction_id, account_id, category_id, amount) VALUES (?, ?, ?, ?)`
      ).run(lastInsertRowid, bill.account_id, bill.category_id, -bill.expected_amount);
      db.prepare(
        `INSERT INTO bill_payments (bill_id, month, transaction_id) VALUES (?, ?, ?)`
      ).run(billId, month, lastInsertRowid);
    }
  });
  tx();
  done("/");
}

export async function deleteTransaction(formData: FormData) {
  db.prepare(`DELETE FROM transactions WHERE id = ?`).run(
    Number(formData.get("id"))
  );
  done("/activity");
}
