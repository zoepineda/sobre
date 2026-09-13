import Link from "next/link";
import {
  getAccounts,
  getBills,
  getCategories,
  getAllCategoryHoldings,
  getGroups,
  getMonthSpend,
  getRecentTransactions,
} from "@/lib/queries";
import AccountGrid from "@/components/AccountGrid";
import Logo from "@/components/Logo";
import BillCheck from "@/components/BillCheck";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CashCard from "@/components/CashCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { peso, prettyDate, todayISO } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const accounts = getAccounts();
  const categories = getCategories();
  const groups = getGroups();
  const cards = accounts.filter((a) => a.type === "credit_card");
  const cash = accounts.filter((a) => a.type !== "credit_card");
  const month = todayISO().slice(0, 7);
  const bills = getBills(month);
  const spend = getMonthSpend(month);
  const totalSpend = spend.reduce((s, r) => s + r.spent, 0);
  const maxSpend = Math.max(1, ...spend.map((r) => r.spent));
  const feed = getRecentTransactions(8);
  const holdingsByCategory = getAllCategoryHoldings();
  const totalCash = cash.reduce((s, a) => s + a.balance, 0);
  const totalOwed = cards.reduce((s, a) => s + Math.max(0, -a.balance), 0);

  if (accounts.length === 0 && categories.every((c) => c.is_system)) {
    return (
      <main className="p-5 pt-14 space-y-4 text-center">
        <h1 className="flex justify-center text-2xl font-bold"><Logo size={34} /></h1>
        <p className="text-muted-foreground">
          Envelope budgeting that knows what your credit card owes.
        </p>
        <Button asChild size="lg">
          <Link href="/settings">Set up accounts &amp; envelopes →</Link>
        </Button>
      </main>
    );
  }

  const ungrouped = categories.filter(
    (c) => !c.group_id && (!c.is_system || c.balance !== 0)
  );
  const ungroupedTotal = ungrouped.reduce((s, c) => s + c.balance, 0);
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const envelopeRows = (list: typeof categories) => (
    <div className="divide-y divide-border/60">
      {list.map((c) => {
        const holdings = holdingsByCategory.get(c.id) ?? [];
        return (
        <div key={c.id} className="flex items-center justify-between py-2">
          <div className="min-w-0">
            <p className="text-sm">{c.name}</p>
            {holdings.length > 0 && (
              <p className="truncate text-[11px] text-muted-foreground">
                {holdings
                  .map((h) => `${h.name} ${peso(h.amount)}`)
                  .join(" · ")}
              </p>
            )}
          </div>
          <p
            className={`text-sm font-semibold ${
              c.balance < 0 ? "text-destructive" : ""
            }`}
          >
            {peso(c.balance)}
            {c.balance < 0 && (
              <Link
                href="/transfer"
                className="ml-2 text-[11px] font-normal text-destructive underline"
              >
                rebalance
              </Link>
            )}
          </p>
        </div>
        );
      })}
    </div>
  );

  return (
    <main className="p-4 lg:p-8 space-y-5">
      <header className="pt-3 lg:pt-0 flex items-end justify-between">
        <div>
          <h1 className="lg:hidden">
            <Logo size={26} className="text-xl" />
          </h1>
          <p className="text-xs uppercase tracking-wider text-muted-foreground lg:text-sm lg:font-semibold lg:text-foreground">
            {todayLabel}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="/income">
              <i className="lni lni-plus" aria-hidden /> Income
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/transfer">
              <i className="lni lni-arrow-both-direction-horizontal-1" aria-hidden />{" "}
              Move
            </Link>
          </Button>
        </div>
      </header>

      <div className="space-y-5 lg:grid lg:grid-cols-5 lg:items-start lg:gap-6 lg:space-y-0">
      <div className="space-y-5 lg:col-span-2">
      <section className="space-y-2">
        <CashCard totalCash={totalCash} />
        <Card className="py-0 shadow-sm">
          <Link
            href="/card"
            className="flex items-center justify-between px-4 py-3"
          >
            <p className="text-sm text-muted-foreground">Envelopes owe card</p>
            <p className={`font-bold ${totalOwed > 0 ? "text-destructive" : ""}`}>
              {peso(totalOwed)} →
            </p>
          </Link>
        </Card>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
          Accounts
        </h2>
        <AccountGrid
          accounts={accounts.map((a) => ({
            id: a.id,
            name: a.name,
            type: a.type,
            balance: a.balance,
          }))}
        />
      </section>
      </div>

      <div className="space-y-5 lg:col-span-3">
      {(groups.length > 0 || ungrouped.length > 0) && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            Envelopes
          </h2>
          <Accordion type="multiple" className="space-y-2">
            {groups.map((g) => {
              const inside = categories.filter((c) => c.group_id === g.id);
              return (
                <AccordionItem
                  key={g.id}
                  value={`group-${g.id}`}
                  className="rounded-xl border bg-card px-4 shadow-sm last:border-b"
                >
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <span className="flex w-full items-center justify-between pr-2">
                      <span className="font-medium">{g.name}</span>
                      <span
                        className={`font-bold ${
                          g.balance < 0 ? "text-destructive" : ""
                        }`}
                      >
                        {peso(g.balance)}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    {envelopeRows(inside)}
                    <Link
                      href={`/groups/${g.id}`}
                      className="mt-1 inline-block text-xs text-primary"
                    >
                      Withdrawal history →
                    </Link>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
            {ungrouped.length > 0 && (
              <AccordionItem
                value="ungrouped"
                className="rounded-xl border bg-card px-4 shadow-sm last:border-b"
              >
                <AccordionTrigger className="py-3 hover:no-underline">
                  <span className="flex w-full items-center justify-between pr-2">
                    <span className="font-medium">Other envelopes</span>
                    <span
                      className={`font-bold ${
                        ungroupedTotal < 0 ? "text-destructive" : ""
                      }`}
                    >
                      {peso(ungroupedTotal)}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  {envelopeRows(ungrouped)}
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Assign these to groups in{" "}
                    <Link href="/settings" className="text-primary underline">
                      Setup
                    </Link>
                    .
                  </p>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </section>
      )}

      {bills.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            Bills · {new Date().toLocaleDateString("en-PH", { month: "long" })}
            <Badge className="border-transparent bg-amber-soft text-amber-ink">
              {bills.filter((b) => b.paid_transaction_id).length}/{bills.length}{" "}
              paid
            </Badge>
          </h2>
          <Card className="gap-0 divide-y divide-border/60 py-0 shadow-sm">
            {bills.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between px-4 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <BillCheck
                    billId={b.id}
                    month={month}
                    paid={!!b.paid_transaction_id}
                  />
                  {/* label makes the whole name block toggle the checkbox */}
                  <label htmlFor={`bill-${b.id}`} className="cursor-pointer py-1">
                    <p
                      className={`text-sm ${
                        b.paid_transaction_id
                          ? "text-muted-foreground line-through"
                          : ""
                      }`}
                    >
                      {b.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {b.account_name} · {b.category_name}
                    </p>
                  </label>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    b.paid_transaction_id ? "text-muted-foreground" : ""
                  }`}
                >
                  {peso(b.expected_amount)}
                </p>
              </div>
            ))}
          </Card>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Ticking a bill logs the expense from its envelope automatically.
          </p>
        </section>
      )}

      {spend.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            Spent this month · {peso(totalSpend)}
          </h2>
          <Card className="py-4 shadow-sm">
            <CardContent className="space-y-2 px-4">
              {spend.map((r) => (
                <div key={r.category_id}>
                  <div className="mb-0.5 flex justify-between text-xs">
                    <span>{r.name}</span>
                    <span className="font-medium">{peso(r.spent)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${(r.spent / maxSpend) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {feed.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Recent
            </h2>
            <Link href="/activity" className="text-xs text-primary">
              See all →
            </Link>
          </div>
          <Card className="gap-0 divide-y divide-border/60 py-0 shadow-sm">
            {feed.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between px-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">
                    {t.payee || t.note || t.category_names || t.type}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {prettyDate(t.date)} ·{" "}
                    {t.type !== "expense" && t.type !== "income"
                      ? `${t.type.replace("_", " ")} · `
                      : ""}
                    {t.account_names}
                    {t.item_names ? ` · ${t.item_names}` : ""}
                  </p>
                </div>
                <p
                  className={`ml-3 shrink-0 text-sm font-semibold ${
                    t.amount < 0 ? "text-destructive" : "text-primary"
                  }`}
                >
                  {peso(t.amount)}
                </p>
              </div>
            ))}
          </Card>
        </section>
      )}
      </div>
      </div>
    </main>
  );
}
