import Link from "next/link";
import db from "@/lib/db";
import {
  getAccountEnvelopes,
  getAccountTransactions,
} from "@/lib/queries";
import ShaderPanel from "@/components/ShaderPanel";
import { Card } from "@/components/ui/card";
import { peso, prettyDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const account = db
    .prepare(`SELECT * FROM accounts WHERE id = ?`)
    .get(Number(id)) as
    | { id: number; name: string; type: string }
    | undefined;

  if (!account) {
    return (
      <main className="p-5 pt-14 text-center text-muted-foreground">
        Account not found.{" "}
        <Link href="/" className="text-primary underline">
          Back home
        </Link>
      </main>
    );
  }

  const envelopes = getAccountEnvelopes(account.id);
  const total = envelopes.reduce((s, e) => s + e.amount, 0);
  const txns = getAccountTransactions(account.id, 50);
  const isCard = account.type === "credit_card";

  return (
    <main className="p-4 lg:p-8 lg:mx-auto lg:max-w-2xl space-y-4">
      <header className="pt-3 lg:pt-0">
        <Link href="/" className="text-xs text-primary">
          ← Home
        </Link>
        <h1 className="text-xl font-bold">{account.name}</h1>
      </header>

      <ShaderPanel
        name={account.name}
        type={account.type}
        className="rounded-xl p-5 shadow-md"
      >
        <p className="text-xs opacity-70">
          {isCard ? "total owed to this card" : "account balance"}
        </p>
        <p className="text-3xl font-bold">
          {peso(isCard ? Math.max(0, -total) : total)}
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-widest opacity-60">
          {account.type.replace("_", " ")}
        </p>
      </ShaderPanel>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
          {isCard ? "Envelopes that owe this card" : "Envelopes held here"}
        </h2>
        {envelopes.length === 0 ? (
          <Card className="py-5 shadow-sm">
            <p className="text-center text-sm text-muted-foreground">
              {isCard
                ? "No envelope owes this card."
                : "No envelope money in this account yet — log income into it or Move money here."}
            </p>
          </Card>
        ) : (
          <Card className="gap-0 divide-y divide-border/60 py-0 shadow-sm">
            {envelopes.map((e) => (
              <div
                key={e.category_id}
                className="flex items-center justify-between px-4 py-2.5"
              >
                <p className="text-sm">{e.name}</p>
                <p
                  className={`text-sm font-semibold ${
                    e.amount < 0 ? "text-destructive" : ""
                  }`}
                >
                  {isCard && e.amount < 0
                    ? `owes ${peso(-e.amount)}`
                    : peso(e.amount)}
                </p>
              </div>
            ))}
          </Card>
        )}
        {!isCard && envelopes.length > 0 && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            This is derived from every transaction, so it always matches
            reality — use{" "}
            <Link href="/transfer" className="text-primary underline">
              Move
            </Link>{" "}
            to shift envelope money between accounts.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
          Activity on this account
        </h2>
        {txns.length === 0 ? (
          <Card className="py-5 shadow-sm">
            <p className="text-center text-sm text-muted-foreground">
              No transactions yet.
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
                    {t.note || t.category_names || t.type}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {prettyDate(t.date)} ·{" "}
                    {t.type !== "expense" && t.type !== "income"
                      ? `${t.type.replace("_", " ")} · `
                      : ""}
                    {t.category_names}
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
        )}
      </section>
    </main>
  );
}
