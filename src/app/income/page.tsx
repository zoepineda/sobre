import { getAccounts, getCategories } from "@/lib/queries";
import { addIncome, logPayday } from "@/lib/actions";
import { peso, todayISO } from "@/lib/format";
import IncomeSplits from "@/components/IncomeSplits";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default async function Income() {
  const [allAccounts, categories] = await Promise.all([
    getAccounts(),
    getCategories(),
  ]);
  const accounts = allAccounts.filter((a) => a.type !== "credit_card");

  const template = categories.filter(
    (c) => c.payday_target > 0 && c.payday_account_id
  );
  const templateTotal = template.reduce((s, c) => s + c.payday_target, 0);
  const perAccount = new Map<string, number>();
  for (const c of template) {
    const key = c.payday_account_name ?? "?";
    perAccount.set(key, (perAccount.get(key) ?? 0) + c.payday_target);
  }

  return (
    <main className="p-4 lg:p-8 lg:mx-auto lg:max-w-xl space-y-4">
      <h1 className="pt-3 lg:pt-0 text-xl font-bold">Log income</h1>

      {template.length > 0 && (
        <Card className="border-primary/30 bg-secondary/50 py-4 shadow-sm">
          <CardContent className="space-y-2.5 px-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Payday allocation</p>
              <p className="text-sm font-bold">{peso(templateTotal)}</p>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {[...perAccount.entries()]
                .map(([name, amt]) => `${name} ${peso(amt)}`)
                .join(" · ")}
            </p>
            <form action={logPayday} className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="payday-date" className="text-xs text-muted-foreground">
                  Cutoff date
                </Label>
                <Input
                  type="date"
                  id="payday-date"
                  name="date"
                  defaultValue={todayISO()}
                />
              </div>
              <Button type="submit">Log payday</Button>
            </form>
            <p className="text-[11px] text-muted-foreground">
              One tap fills all {template.length} envelopes with their
              per-cutoff amounts, in their home accounts.
            </p>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        Or log any other income manually and split it across envelopes:
      </p>
      <form action={addIncome} className="space-y-4">
        <IncomeSplits
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            homeId: c.payday_account_id,
            isSystem: c.is_system,
          }))}
          accounts={accounts.map((a) => ({
            id: a.id,
            name: a.name,
            type: a.type,
          }))}
        />
        <Card className="py-4 shadow-sm">
          <CardContent className="space-y-3 px-4">
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <Label htmlFor="date" className="text-xs text-muted-foreground">
                  Date
                </Label>
                <Input
                  type="date"
                  id="date"
                  name="date"
                  defaultValue={todayISO()}
                />
              </div>
              <div className="flex-[2] space-y-1">
                <Label htmlFor="note" className="text-xs text-muted-foreground">
                  Note
                </Label>
                <Input id="note" name="note" placeholder="e.g. salary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Button type="submit" size="lg" className="w-full">
          Save income
        </Button>
      </form>
    </main>
  );
}
