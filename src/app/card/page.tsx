import Link from "next/link";
import {
  getAccounts,
  getCardDebts,
  getCategoryHoldings,
  getStatementBalance,
} from "@/lib/queries";
import { payCard } from "@/lib/actions";
import ShaderPanel from "@/components/ShaderPanel";
import { lastCutoffISO, peso, prettyDate, todayISO } from "@/lib/format";
import CardPayForm from "@/components/CardPayForm";

export const dynamic = "force-dynamic";

export default async function CardPage({
  searchParams,
}: {
  searchParams: Promise<{ card?: string }>;
}) {
  const sp = await searchParams;
  const accounts = await getAccounts();
  const cards = accounts.filter((a) => a.type === "credit_card");
  const sources = accounts.filter((a) => a.type !== "credit_card");

  if (cards.length === 0) {
    return (
      <main className="p-5 pt-14 text-center">
        <p className="text-muted-foreground">
          No credit card yet. Add one in{" "}
          <Link href="/settings" className="text-primary underline">
            Setup
          </Link>{" "}
          (type: credit card).
        </p>
      </main>
    );
  }

  const card =
    cards.find((c) => String(c.id) === sp?.card) ?? cards[0];
  const cutoff = lastCutoffISO();
  const [debts, { total, statement }] = await Promise.all([
    getCardDebts(card.id),
    getStatementBalance(card.id, cutoff),
  ]);
  const holdingsList = await Promise.all(
    debts.map((d) => getCategoryHoldings(d.category_id))
  );

  return (
    <main className="p-4 lg:p-8 space-y-4">
      <h1 className="pt-3 lg:pt-0 text-xl font-bold">Card payback</h1>
      {cards.length > 1 && (
        <div className="flex gap-2">
          {cards.map((c) => (
            <Link
              key={c.id}
              href={`/card?card=${c.id}`}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                c.id === card.id
                  ? "bg-primary text-white"
                  : "bg-card text-muted-foreground"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
      <div className="space-y-4">
      <ShaderPanel
        name={card.name}
        type={card.type}
        className="rounded-2xl p-5 shadow-md"
      >
        <p className="text-xs opacity-70">{card.name} · total owed</p>
        <p className="text-3xl font-bold">{peso(total)}</p>
        <div className="mt-3 flex justify-between text-xs opacity-75">
          <span>
            Statement balance (thru {prettyDate(cutoff)}): {peso(statement)}
          </span>
          <span>cut-off: 20th</span>
        </div>
      </ShaderPanel>

      {debts.length === 0 ? (
        <p className="rounded-2xl bg-card p-5 text-center text-sm text-muted-foreground shadow-sm">
          All settled. No envelope owes this card. 🎉
        </p>
      ) : (
        <section>
            <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
              Who owes the card, and where their money sits
            </h2>
            <div className="space-y-2">
              {debts.map((d, di) => {
                const holdings = holdingsList[di];
                return (
                  <div
                    key={d.category_id}
                    className="rounded-2xl bg-card p-4 shadow-sm"
                  >
                    <div className="flex justify-between">
                      <p className="font-medium">{d.name}</p>
                      <p className="font-semibold text-destructive">
                        {peso(d.owed)}
                      </p>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {holdings.length > 0
                        ? "cash in: " +
                          holdings
                            .map((h) => `${h.name} ${peso(h.amount)}`)
                            .join(" · ")
                        : "no cash held for this envelope, rebalance first"}
                    </p>
                  </div>
                );
              })}
            </div>
        </section>
      )}
      </div>

      {debts.length > 0 && (
        <form action={payCard}>
            <input type="hidden" name="card_account_id" value={card.id} />
            <input type="hidden" name="date" value={todayISO()} />
            <CardPayForm
              debts={debts}
              sources={sources.map((a) => ({ id: a.id, name: a.name }))}
            />
        </form>
      )}
      </div>
    </main>
  );
}
