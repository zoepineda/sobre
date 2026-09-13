import Link from "next/link";
import { getTopPayees, getTopPayeesAllTime } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
import { peso, todayISO } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PayeesPage() {
  const month = todayISO().slice(0, 7);
  const thisMonth = await getTopPayees(month, 20);
  const monthLabel = new Date().toLocaleDateString("en-PH", { month: "long" });

  const allTime = await getTopPayeesAllTime(30);

  const list = (rows: typeof allTime) => (
    <Card className="gap-0 divide-y divide-border/60 py-0 shadow-sm">
      {rows.map((p) => (
        <Link
          key={p.payee}
          href={`/payees/${encodeURIComponent(p.payee)}`}
          className="flex items-center justify-between px-4 py-2.5"
        >
          <p className="text-sm">
            {p.payee}
            <span className="ml-2 text-[11px] text-muted-foreground">
              ×{p.times}
            </span>
          </p>
          <p className="text-sm font-semibold">{peso(p.spent)} →</p>
        </Link>
      ))}
    </Card>
  );

  return (
    <main className="p-4 lg:p-8 lg:mx-auto lg:max-w-2xl space-y-5">
      <header className="pt-3 lg:pt-0">
        <Link href="/activity" className="text-xs text-primary">
          ← Activity
        </Link>
        <h1 className="text-xl font-bold">Where the money went</h1>
      </header>

      {thisMonth.length === 0 && allTime.length === 0 ? (
        <Card className="py-5 shadow-sm">
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              Nothing here yet — add a &quot;where / what for&quot; when logging
              expenses and they&apos;ll show up ranked here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {thisMonth.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground">
                {monthLabel}
              </h2>
              {list(thisMonth)}
            </section>
          )}
          {allTime.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground">
                All time
              </h2>
              {list(allTime)}
            </section>
          )}
        </>
      )}
    </main>
  );
}
