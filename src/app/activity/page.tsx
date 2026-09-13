import Link from "next/link";
import { getRecentTransactions, getTopPayees } from "@/lib/queries";
import { deleteTransaction } from "@/lib/actions";
import ArchiveDelete from "@/components/ArchiveDelete";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { peso, prettyDate, todayISO } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Activity({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  const filtered = !!(from || to);
  const month = todayISO().slice(0, 7);
  const [feed, topPayees] = await Promise.all([
    getRecentTransactions(filtered ? 1000 : 200, from, to),
    getTopPayees(month, 1),
  ]);
  const spentInRange = feed
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + -t.amount, 0);

  return (
    <main className="p-4 lg:p-8 lg:mx-auto lg:max-w-3xl space-y-4">
      <div className="pt-3 lg:pt-0 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Activity</h1>
        <form action="/activity" className="flex items-center gap-1.5 lg:gap-2">
          <Input
            type="date"
            name="from"
            aria-label="From date"
            defaultValue={from ?? ""}
            className="h-8 w-[6.6rem] px-1.5 text-xs lg:h-9 lg:w-[8.75rem] lg:px-2.5 lg:text-sm"
          />
          <span className="hidden text-xs text-muted-foreground lg:inline">
            –
          </span>
          <Input
            type="date"
            name="to"
            aria-label="To date"
            defaultValue={to ?? ""}
            className="h-8 w-[6.6rem] px-1.5 text-xs lg:h-9 lg:w-[8.75rem] lg:px-2.5 lg:text-sm"
          />
          <Button type="submit" variant="secondary" size="xs" className="lg:h-9 lg:px-4 lg:text-sm">
            Filter
          </Button>
          {filtered && (
            <Button
              asChild
              variant="ghost"
              size="icon-xs"
              className="lg:h-9 lg:w-auto lg:px-3"
              aria-label="Clear filter"
            >
              <Link href="/activity">✕</Link>
            </Button>
          )}
        </form>
      </div>

      {topPayees.length > 0 && (
        <Link href="/payees" className="-mt-2 block text-xs text-primary">
          Where the money went →
        </Link>
      )}

      {filtered && feed.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {feed.length} transaction{feed.length === 1 ? "" : "s"} · spent{" "}
          <span className="font-semibold text-foreground">
            {peso(spentInRange)}
          </span>{" "}
          in this range
        </p>
      )}

      {feed.length === 0 ? (
        <Card className="py-5 shadow-sm">
          <p className="text-center text-sm text-muted-foreground">
            Nothing yet. Log your first expense from the + tab.
          </p>
        </Card>
      ) : (
        <Card className="gap-0 divide-y divide-border/60 py-0 shadow-sm">
            {feed.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">
                    {t.payee || t.note || t.category_names || t.type}
                    {t.payee && t.note && t.note !== t.payee ? (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {t.note}
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {prettyDate(t.date)} ·{" "}
                    {t.type !== "expense" && t.type !== "income"
                      ? `${t.type.replace("_", " ")} · `
                      : ""}
                    {t.account_names} · {t.category_names}
                  </p>
                  {t.item_names && (
                    <p className="truncate text-[11px] text-muted-foreground/80">
                      🧾 {t.item_names}
                    </p>
                  )}
                </div>
                <div className="ml-3 flex shrink-0 items-center gap-3">
                  <p
                    className={`text-sm font-semibold ${
                      t.amount < 0 ? "text-destructive" : "text-primary"
                    }`}
                  >
                    {peso(t.amount)}
                  </p>
                  <ArchiveDelete action={deleteTransaction} id={t.id} />
                </div>
              </div>
            ))}
        </Card>
      )}
    </main>
  );
}
