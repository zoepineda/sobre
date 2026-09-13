import { getAccounts, getAllCategoryHoldings, getCategories } from "@/lib/queries";
import StartingBalancesForm from "@/components/StartingBalancesForm";
import { peso } from "@/lib/format";

export const dynamic = "force-dynamic";

// One-time seeding screen: distribute Unassigned money into every envelope
// in a single transaction, so current real-life envelope amounts can be
// logged without faking income.
export default async function StartingBalances() {
  const [allAccounts, categories, holdings] = await Promise.all([
    getAccounts(),
    getCategories(),
    getAllCategoryHoldings(),
  ]);
  const accounts = allAccounts.filter((a) => a.type !== "credit_card");
  const unassigned = categories.find((c) => c.is_system);
  const envelopes = categories.filter((c) => !c.is_system);
  const unassignedByAccount = unassigned
    ? (holdings.get(unassigned.id) ?? [])
    : [];
  const unassignedTotal = unassignedByAccount.reduce(
    (sum, h) => sum + h.amount,
    0
  );

  return (
    <main className="p-4 lg:p-8 lg:mx-auto lg:max-w-xl space-y-4">
      <h1 className="pt-3 lg:pt-0 text-xl font-bold">Set starting balances</h1>
      <p className="text-xs text-muted-foreground">
        Type what each envelope currently holds in real life. This relabels
        money out of Unassigned within each envelope&apos;s account — account
        balances stay untouched, and nothing shows up as income.
      </p>

      {unassignedByAccount.length > 0 && (
        <div className="rounded-xl bg-secondary p-3 text-xs text-secondary-foreground">
          <p className="font-semibold">Unassigned money to distribute</p>
          {unassignedByAccount.map((h) => (
            <p key={h.name} className="mt-0.5 flex justify-between">
              <span>{h.name}</span>
              <span className="font-medium">{peso(h.amount)}</span>
            </p>
          ))}
        </div>
      )}

      {envelopes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No envelopes yet — create them in Setup first.
        </p>
      ) : unassignedTotal <= 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing is sitting in Unassigned right now. Add opening balances to
          your accounts (or log income into Unassigned) first, then come back
          here to distribute it.
        </p>
      ) : (
        <StartingBalancesForm
          envelopes={envelopes.map((c) => ({
            id: c.id,
            name: c.name,
            balance: c.balance,
            homeAccountId: c.payday_account_id,
          }))}
          accounts={accounts.map((a) => ({
            id: a.id,
            name: a.name,
            type: a.type,
          }))}
          unassignedTotal={unassignedTotal}
        />
      )}
    </main>
  );
}
