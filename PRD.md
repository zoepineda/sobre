# PRD — Personal Finance Tracker

**Owner:** Mark C.
**Date:** 2026-09-13
**Status:** Draft v1

## 1. Problem

The owner runs an envelope-style budgeting system: income is split across categories (emergency fund, bills, personal wants, friends, family, travel fund, etc.), with the money physically distributed across multiple real bank accounts and e-wallets. A single account may hold money belonging to several categories.

Two pain points:

1. **No single overview.** Expenses are scattered across accounts and categories, so it's hard to see where money is actually going in one place.
2. **Credit card confusion.** A new credit card breaks the envelope model: a card swipe spends "category money" without touching any account. At bill time it's unclear how much to pull from which account/category to pay the card.

## 2. Goals

- One clear view of all spending, balances, and trends across every account and category.
- Make the credit card compatible with envelope budgeting: every card purchase is attributed to a category, and the app always knows how much each category "owes" the card.
- Low-friction expense entry from a phone.

### Non-goals (for now)

- Automatic bank sync (PH bank API coverage is poor; CSV import covers this need).
- Multi-user support (design shouldn't preclude it, but don't build it).
- Investment tracking, net-worth projections, bill reminders.

## 3. User & platform

- **Single user**, personal finances, Philippine context.
- **Mobile-first web app** — primary use is logging expenses on the phone; a wider dashboard layout on desktop is a bonus.
- **Hosted with a database** (recommendation: Next.js + Supabase/Postgres) so phone and laptop share the same data. Simple auth (single account) since finances are sensitive.
- **Currency:** PHP (₱) primary. Occasional foreign-currency transactions (e.g. USD subscriptions, travel) can be logged with the original amount + PHP equivalent; no full multi-currency accounting.

## 4. Core concepts (data model)

| Concept | Description |
|---|---|
| **Account** | A real place money lives: bank account, e-wallet, cash, or the credit card. One account can hold money belonging to many categories. |
| **Category** | A flat list of envelopes (Emergency Fund, Bills, Personal Wants, Friends, Family, Travel Fund, …). Each category has a running balance — true envelope style, no monthly limits. The balance *is* the budget. |
| **Transaction** | Money movement. Types: **expense** (from an account, assigned to a category), **income** (into an account), **transfer** (between accounts and/or between categories), **card payment** (settles card debt). |
| **Category-account split** | Because one account holds many categories' money, each category balance also tracks *which account(s)* that money sits in. Invariant: for every account, the sum of category money assigned to it equals the account balance. |
| **Card debt per category** | A credit card expense increases the card's owed balance *and* records which category owes it — without reducing any cash account yet. |

## 5. The credit card model (key feature)

1. **Swipe:** user logs a card expense and picks a category (e.g. ₱800, Friends). The category's *available* balance drops by ₱800 (money is spoken for), the card's outstanding balance rises by ₱800, and a "Friends owes card ₱800" entry is recorded. No cash account changes.
2. **Any time:** a "Card payback" view shows total card debt broken down by category, and by which account each category's money sits in — i.e. "to pay the current balance, pull ₱2,300 from BPI (Wants ₱1,500 + Friends ₱800) and ₱1,800 from GCash (Bills)."
3. **Payment — flexible:**
   - **Statement settle-up:** record one payment covering the statement; the app clears the corresponding per-category debts and deducts from the chosen source accounts.
   - **Partial / early payments:** pay any amount any time; the user chooses which category debts the payment covers (default: oldest first). Remaining debts stay visible.

## 6. Features & phasing

### MVP (v1) — tracking + card logic

- **Accounts:** create/edit accounts (bank, e-wallet, cash, credit card) with starting balances.
- **Categories:** flat list, create/edit/archive, starting balances, and assignment of each category's money to accounts.
- **Manual expense entry:** fast mobile flow — amount, category, account (or credit card), optional note/date. Target: under 10 seconds to log.
- **Income & transfers:** log income into an account and assign it to categories; move money between categories and between accounts.
- **Credit card flow:** card expenses with category attribution, per-category debt ledger, payback breakdown view, flexible payment recording (full, partial, early).
- **Overview dashboard:**
  - All account balances + all category balances at a glance, including card debt per category.
  - Recent transactions feed (all accounts/categories, chronological).
  - This-month spending breakdown by category.

### v2

- **CSV/statement import:** upload the credit card's statement export (the only import source needed), map columns, dedupe against already-logged card expenses, and bulk-assign categories to any unlogged ones.
- **Payday allocation:** on income entry, split it across categories via a saved allocation template (fixed amounts and/or percentages), generating the transfer records automatically.
- **Trends:** month-over-month charts — spending per category over time, savings-category growth (travel fund, emergency fund).

### v3 / later

- Foreign-currency niceties (store original currency + rate on a transaction).
- Multi-user/shared budgets.
- PWA install + offline entry queue.

## 7. Success criteria

- Every peso across all accounts is visible and attributed to a category; account totals always reconcile with category totals.
- At any moment, the user can answer "if I paid my card right now, how much comes out of which account?" in one screen.
- Expense logging is fast enough on mobile that it actually happens at point of purchase.
- After one month of use: the overview answers "where did my money go this month?" without opening any bank app.

## 8. Resolved decisions (from owner review, 2026-09-13)

- **Statement cycle:** a running debt ledger is sufficient for v1. The card's monthly cut-off is the **20th** — display it on the card payback view (e.g. "debts accrued since the 20th") but no per-statement grouping logic is required yet.
- **CSV import (v2):** the only import source needed is the **credit card issuer's statement export**. Cash/e-wallet activity stays manual-entry.
- **Negative category balances:** allowed, never blocked — the app records reality. A negative envelope means that category borrowed from other categories' money in the same account. Show it prominently (red on dashboard) and prompt the user to rebalance via a category transfer or at the next payday allocation. Real accounts themselves can never go negative in the app (except the credit card, whose balance is debt by nature).
