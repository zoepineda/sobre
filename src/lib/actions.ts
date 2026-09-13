"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "./pg";
import { getUserId } from "./supabase/server";
import { toCentavos, todayISO } from "./format";

type Line = { account_id: number; category_id: number; amount: number };
type Item = { name: string; amount: number };

async function insertTransaction(
  uid: string,
  type: string,
  date: string,
  note: string,
  lines: Line[],
  payee = "",
  items: Item[] = []
) {
  await sql.begin(async (tx) => {
    const [{ id }] = await tx`
      INSERT INTO transactions (user_id, type, date, note, payee)
      VALUES (${uid}, ${type}, ${date}, ${note}, ${payee})
      RETURNING id`;
    for (const l of lines) {
      if (l.amount !== 0)
        await tx`
          INSERT INTO lines (user_id, transaction_id, account_id, category_id, amount)
          VALUES (${uid}, ${id}, ${l.account_id}, ${l.category_id}, ${l.amount})`;
    }
    for (const i of items) {
      if (i.name.trim())
        await tx`
          INSERT INTO items (user_id, transaction_id, name, amount)
          VALUES (${uid}, ${id}, ${i.name.trim()}, ${i.amount})`;
    }
  });
}

function done(path = "/") {
  revalidatePath("/", "layout");
  redirect(path);
}

export async function addExpense(formData: FormData) {
  const uid = await getUserId();
  const amount = toCentavos(formData.get("amount") as string);
  const accountId = Number(formData.get("account_id"));
  const categoryId = Number(formData.get("category_id"));
  const date = (formData.get("date") as string) || todayISO();
  const note = ((formData.get("note") as string) || "").trim();
  const payee = ((formData.get("payee") as string) || "").trim();
  if (!Number.isFinite(amount) || amount <= 0 || !accountId || !categoryId) return;

  const items: Item[] = [];
  for (const [key, value] of formData.entries()) {
    const m = /^item_name_(\d+)$/.exec(key);
    if (!m) continue;
    const name = String(value).trim();
    if (!name) continue;
    const amt = toCentavos((formData.get(`item_amount_${m[1]}`) as string) || "0");
    items.push({ name, amount: Number.isFinite(amt) && amt > 0 ? amt : 0 });
  }

  await insertTransaction(
    uid,
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
  const uid = await getUserId();
  const accountId = Number(formData.get("account_id"));
  const date = (formData.get("date") as string) || todayISO();
  const note = ((formData.get("note") as string) || "").trim();
  const splits: Line[] = [];
  for (const [key, value] of formData.entries()) {
    const m = /^split_(\d+)$/.exec(key);
    if (!m) continue;
    const amt = toCentavos(value as string);
    if (Number.isFinite(amt) && amt > 0) {
      splits.push({ account_id: accountId, category_id: Number(m[1]), amount: amt });
    }
  }
  if (!accountId || splits.length === 0) return;
  await insertTransaction(uid, "income", date, note, splits);
  done("/");
}

export async function logPayday(formData: FormData) {
  const uid = await getUserId();
  const date = (formData.get("date") as string) || todayISO();
  const rows = (await sql`
    SELECT c.id, c.payday_target, c.payday_account_id
    FROM categories c
    JOIN accounts a ON a.id = c.payday_account_id AND a.archived = false
    WHERE c.user_id = ${uid} AND c.archived = false AND c.is_system = false
      AND c.payday_target > 0`) as unknown as {
    id: number;
    payday_target: number;
    payday_account_id: number;
  }[];
  if (rows.length === 0) return;

  await insertTransaction(
    uid,
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
  const uid = await getUserId();
  const amount = toCentavos(formData.get("amount") as string);
  const fromAccount = Number(formData.get("from_account_id"));
  const fromCategory = Number(formData.get("from_category_id"));
  const toAccount = Number(formData.get("to_account_id"));
  const toCategory = Number(formData.get("to_category_id"));
  const date = (formData.get("date") as string) || todayISO();
  const note = ((formData.get("note") as string) || "").trim();
  if (!Number.isFinite(amount) || amount <= 0) return;
  if (fromAccount === toAccount && fromCategory === toCategory) return;

  await insertTransaction(uid, "transfer", date, note, [
    { account_id: fromAccount, category_id: fromCategory, amount: -amount },
    { account_id: toAccount, category_id: toCategory, amount: amount },
  ]);
  done("/");
}

// One-time seeding: relabel Unassigned money into many envelopes at once.
// Each row moves amount_<catId> within account_<catId>, so account balances
// never change — only the envelope assignment does.
export async function setStartingBalances(formData: FormData) {
  const uid = await getUserId();
  const unassigned = await ensureUnassigned(uid);
  const lines: Line[] = [];
  for (const [key, value] of formData.entries()) {
    const m = /^amount_(\d+)$/.exec(key);
    if (!m) continue;
    const amount = toCentavos(String(value));
    if (!Number.isFinite(amount) || amount <= 0) continue;
    const categoryId = Number(m[1]);
    const accountId = Number(formData.get(`account_${m[1]}`));
    if (!accountId || categoryId === unassigned) continue;
    lines.push({ account_id: accountId, category_id: unassigned, amount: -amount });
    lines.push({ account_id: accountId, category_id: categoryId, amount });
  }
  if (lines.length === 0) return;
  await insertTransaction(uid, "transfer", todayISO(), "Starting balances", lines);
  done("/");
}

export async function payCard(formData: FormData) {
  const uid = await getUserId();
  const cardId = Number(formData.get("card_account_id"));
  const sourceId = Number(formData.get("source_account_id"));
  const date = (formData.get("date") as string) || todayISO();
  const note = ((formData.get("note") as string) || "").trim();
  const lines: Line[] = [];
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
  await insertTransaction(uid, "card_payment", date, note, lines);
  done("/card");
}

async function ensureUnassigned(uid: string): Promise<number> {
  const rows = await sql`
    SELECT id FROM categories WHERE user_id = ${uid} AND is_system = true`;
  if (rows.length > 0) return rows[0].id as number;
  const [{ id }] = await sql`
    INSERT INTO categories (user_id, name, is_system, sort)
    VALUES (${uid}, 'Unassigned', true, 9999) RETURNING id`;
  return id as number;
}

export async function createAccount(formData: FormData) {
  const uid = await getUserId();
  const name = ((formData.get("name") as string) || "").trim();
  const type = formData.get("type") as string;
  const opening = toCentavos((formData.get("opening") as string) || "0");
  if (!name || !type) return;

  const [{ id: accountId }] = await sql`
    INSERT INTO accounts (user_id, name, type)
    VALUES (${uid}, ${name}, ${type}) RETURNING id`;

  if (Number.isFinite(opening) && opening !== 0 && type !== "credit_card") {
    const unassigned = await ensureUnassigned(uid);
    await insertTransaction(uid, "opening", todayISO(), `Opening balance: ${name}`, [
      { account_id: accountId as number, category_id: unassigned, amount: opening },
    ]);
  }
  done("/settings");
}

export async function createCategory(formData: FormData) {
  const uid = await getUserId();
  const name = ((formData.get("name") as string) || "").trim();
  if (!name) return;
  const groupId = Number(formData.get("group_id")) || null;
  const target = toCentavos((formData.get("payday_target") as string) || "0");
  const accountId = Number(formData.get("payday_account_id")) || null;
  await sql`
    INSERT INTO categories (user_id, name, group_id, payday_target, payday_account_id)
    VALUES (${uid}, ${name}, ${groupId},
            ${Number.isFinite(target) && target > 0 ? target : 0}, ${accountId})`;
  done("/settings");
}

export async function reorderAccounts(ids: number[]) {
  const uid = await getUserId();
  await sql.begin(async (tx) => {
    for (let i = 0; i < ids.length; i++) {
      await tx`UPDATE accounts SET sort = ${i} WHERE id = ${ids[i]} AND user_id = ${uid}`;
    }
  });
  revalidatePath("/", "layout");
}

export async function createGroup(formData: FormData) {
  const uid = await getUserId();
  const name = ((formData.get("name") as string) || "").trim();
  if (!name) return;
  await sql`INSERT INTO groups (user_id, name) VALUES (${uid}, ${name})`;
  done("/settings");
}

export async function archiveGroup(formData: FormData) {
  const uid = await getUserId();
  const id = Number(formData.get("id"));
  await sql.begin(async (tx) => {
    await tx`UPDATE categories SET group_id = NULL WHERE group_id = ${id} AND user_id = ${uid}`;
    await tx`UPDATE groups SET archived = true WHERE id = ${id} AND user_id = ${uid}`;
  });
  done("/settings");
}

export async function setCategoryGroup(formData: FormData) {
  const uid = await getUserId();
  const categoryId = Number(formData.get("category_id"));
  const groupId = Number(formData.get("group_id")) || null;
  await sql`
    UPDATE categories SET group_id = ${groupId}
    WHERE id = ${categoryId} AND user_id = ${uid} AND is_system = false`;
  done("/settings");
}

// Edit an envelope in one go: name, group, payday target + home account.
export async function updateCategory(formData: FormData) {
  const uid = await getUserId();
  const id = Number(formData.get("id"));
  const name = ((formData.get("name") as string) || "").trim();
  const groupId = Number(formData.get("group_id")) || null;
  const target = toCentavos((formData.get("payday_target") as string) || "0");
  const accountId = Number(formData.get("payday_account_id")) || null;
  if (!id || !name) return;
  await sql`
    UPDATE categories SET
      name = ${name},
      group_id = ${groupId},
      payday_target = ${Number.isFinite(target) && target > 0 ? target : 0},
      payday_account_id = ${accountId}
    WHERE id = ${id} AND user_id = ${uid} AND is_system = false`;
  done("/settings");
}

export async function createBill(formData: FormData) {
  const uid = await getUserId();
  const name = ((formData.get("name") as string) || "").trim();
  const amount = toCentavos(formData.get("amount") as string);
  const accountId = Number(formData.get("account_id"));
  const categoryId = Number(formData.get("category_id"));
  if (!name || !Number.isFinite(amount) || amount <= 0 || !accountId || !categoryId) return;
  await sql`
    INSERT INTO bills (user_id, name, expected_amount, account_id, category_id)
    VALUES (${uid}, ${name}, ${amount}, ${accountId}, ${categoryId})`;
  done("/settings");
}

export async function archiveBill(formData: FormData) {
  const uid = await getUserId();
  await sql`
    UPDATE bills SET archived = true
    WHERE id = ${Number(formData.get("id"))} AND user_id = ${uid}`;
  done("/settings");
}

export async function toggleBillPaid(formData: FormData) {
  const uid = await getUserId();
  const billId = Number(formData.get("bill_id"));
  const month = (formData.get("month") as string) || todayISO().slice(0, 7);
  const bills = (await sql`
    SELECT id, name, expected_amount, account_id, category_id
    FROM bills WHERE id = ${billId} AND user_id = ${uid}`) as unknown as {
    id: number;
    name: string;
    expected_amount: number;
    account_id: number;
    category_id: number;
  }[];
  const bill = bills[0];
  if (!bill) return;

  const existing = (await sql`
    SELECT id, transaction_id FROM bill_payments
    WHERE bill_id = ${billId} AND month = ${month} AND user_id = ${uid}`) as unknown as {
    id: number;
    transaction_id: number;
  }[];

  if (existing[0]) {
    await sql.begin(async (tx) => {
      await tx`DELETE FROM transactions WHERE id = ${existing[0].transaction_id} AND user_id = ${uid}`;
      await tx`DELETE FROM bill_payments WHERE id = ${existing[0].id} AND user_id = ${uid}`;
    });
  } else {
    await sql.begin(async (tx) => {
      const [{ id: txnId }] = await tx`
        INSERT INTO transactions (user_id, type, date, note, payee)
        VALUES (${uid}, 'expense', ${todayISO()}, ${bill.name}, ${bill.name})
        RETURNING id`;
      await tx`
        INSERT INTO lines (user_id, transaction_id, account_id, category_id, amount)
        VALUES (${uid}, ${txnId}, ${bill.account_id}, ${bill.category_id}, ${-bill.expected_amount})`;
      await tx`
        INSERT INTO bill_payments (user_id, bill_id, month, transaction_id)
        VALUES (${uid}, ${billId}, ${month}, ${txnId})`;
    });
  }
  done("/");
}

export async function archiveAccount(formData: FormData) {
  const uid = await getUserId();
  const id = Number(formData.get("id"));
  const [{ b }] = (await sql`
    SELECT COALESCE(SUM(amount), 0)::int AS b FROM lines
    WHERE account_id = ${id} AND user_id = ${uid}`) as unknown as { b: number }[];
  if (b !== 0) {
    done("/settings?error=account");
    return;
  }
  const [{ refs }] = (await sql`
    SELECT (
      (SELECT COUNT(*) FROM categories WHERE user_id = ${uid} AND archived = false AND payday_account_id = ${id})
      + (SELECT COUNT(*) FROM bills WHERE user_id = ${uid} AND archived = false AND account_id = ${id})
    )::int AS refs`) as unknown as { refs: number }[];
  if (refs > 0) {
    done("/settings?error=account-in-use");
    return;
  }
  await sql`UPDATE accounts SET archived = true WHERE id = ${id} AND user_id = ${uid}`;
  done("/settings");
}

export async function archiveCategory(formData: FormData) {
  const uid = await getUserId();
  const id = Number(formData.get("id"));
  const [{ b }] = (await sql`
    SELECT COALESCE(SUM(amount), 0)::int AS b FROM lines
    WHERE category_id = ${id} AND user_id = ${uid}`) as unknown as { b: number }[];
  if (b !== 0) {
    done("/settings?error=envelope");
    return;
  }
  await sql`
    UPDATE categories SET archived = true
    WHERE id = ${id} AND user_id = ${uid} AND is_system = false`;
  done("/settings");
}

export async function unarchive(formData: FormData) {
  const uid = await getUserId();
  const kind = formData.get("kind") as string;
  const id = Number(formData.get("id"));
  if (kind === "account") {
    await sql`UPDATE accounts SET archived = false WHERE id = ${id} AND user_id = ${uid}`;
  } else if (kind === "envelope") {
    await sql`UPDATE categories SET archived = false WHERE id = ${id} AND user_id = ${uid}`;
  }
  done("/settings");
}

export async function deleteTransaction(formData: FormData) {
  const uid = await getUserId();
  await sql`
    DELETE FROM transactions
    WHERE id = ${Number(formData.get("id"))} AND user_id = ${uid}`;
  done("/activity");
}

export async function signOut() {
  const { createClient } = await import("./supabase/server");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
