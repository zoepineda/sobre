import Link from "next/link";
import { getPayeeTransactions } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { peso, prettyDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PayeePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const payee = decodeURIComponent(name);
  const txns = await getPayeeTransactions(payee);
  const total = txns.reduce((s, t) => s + -t.amount, 0);

  return (
    <main className="p-4 lg:p-8 lg:mx-auto lg:max-w-2xl space-y-4">
      <header className="pt-3 lg:pt-0">
        <Link href="/activity" className="text-xs text-primary">
          ← Activity
        </Link>
        <h1 className="text-xl font-bold">{payee}</h1>
        <p className="text-xs text-muted-foreground">
          {txns.length} purchase{txns.length === 1 ? "" : "s"} · {peso(total)}{" "}
          all-time
        </p>
      </header>

      {txns.length === 0 ? (
        <Card className="py-5 shadow-sm">
          <p className="text-center text-sm text-muted-foreground">
            No purchases recorded here yet.
          </p>
        </Card>
      ) : (
        <Card className="gap-0 divide-y divide-border/60 py-0 shadow-sm">
          {txns.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between px-4 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm">
                  {t.note && t.note !== t.payee ? t.note : t.category_names}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {prettyDate(t.date)} · {t.account_names} · {t.category_names}
                </p>
                {t.item_names && (
                  <p className="truncate text-[11px] text-muted-foreground/80">
                    🧾 {t.item_names}
                  </p>
                )}
              </div>
              <p className="ml-3 shrink-0 text-sm font-semibold text-destructive">
                {peso(t.amount)}
              </p>
            </div>
          ))}
        </Card>
      )}
    </main>
  );
}
