import Link from "next/link";
import { getAccounts, getCategories, getPayeeSuggestions } from "@/lib/queries";
import BrandChip from "@/components/BrandChip";
import EnvelopeOption from "@/components/EnvelopeOption";
import ItemsEditor from "@/components/ItemsEditor";
import { addExpense } from "@/lib/actions";
import { todayISO } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const dynamic = "force-dynamic";

export default async function AddExpense() {
  const [accounts, allCategories, payees] = await Promise.all([
    getAccounts(),
    getCategories(),
    getPayeeSuggestions(),
  ]);
  const categories = allCategories.filter(
    (c) => !c.is_system || c.balance !== 0
  );

  if (accounts.length === 0) {
    return (
      <main className="p-5 pt-14 text-center">
        <p className="text-muted-foreground">
          Add an account first in{" "}
          <Link href="/settings" className="text-primary underline">
            Setup
          </Link>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="p-4 lg:p-8 lg:mx-auto lg:max-w-xl space-y-4">
      <h1 className="pt-3 lg:pt-0 text-xl font-bold">Log expense</h1>
      <form action={addExpense} className="space-y-4">
        <Card className="py-4 shadow-sm">
          <CardContent className="px-4">
            <Label htmlFor="amount" className="text-xs text-muted-foreground">
              Amount (₱)
            </Label>
            <input
              id="amount"
              name="amount"
              inputMode="decimal"
              placeholder="0.00"
              required
              autoFocus
              className="w-full bg-transparent text-3xl font-bold outline-none"
            />
          </CardContent>
        </Card>

        <Card className="py-4 shadow-sm">
          <CardContent className="space-y-3 px-4">
            <div className="space-y-1">
              <Label htmlFor="payee" className="text-xs text-muted-foreground">
                Where / what for
              </Label>
              <Input
                id="payee"
                name="payee"
                list="payee-suggestions"
                placeholder="e.g. Jollibee, Shopee, PLDT"
                autoComplete="off"
              />
              <datalist id="payee-suggestions">
                {payees.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
            <ItemsEditor />
            <div className="space-y-1">
              <Label htmlFor="account-select" className="text-xs text-muted-foreground">Paid with</Label>
              <Select name="account_id" defaultValue={String(accounts[0].id)}>
                <SelectTrigger id="account-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      <span className="flex items-center gap-2">
                        <BrandChip name={a.name} type={a.type} />
                        {a.name}
                        {a.type === "credit_card" ? " 💳" : ""}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Pick your credit card and the envelope&apos;s money is reserved
                for payback. No cash moves yet.
              </p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="category-select" className="text-xs text-muted-foreground">Envelope</Label>
              <Select
                name="category_id"
                defaultValue={String(categories[0]?.id)}
              >
                <SelectTrigger id="category-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => {
                    const home = accounts.find(
                      (a) => a.id === c.payday_account_id
                    );
                    return (
                      <EnvelopeOption
                        key={c.id}
                        id={c.id}
                        name={c.name}
                        home={home ? { name: home.name, type: home.type } : null}
                      />
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
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
                  Note (optional)
                </Label>
                <Input
                  id="note"
                  name="note"
                  placeholder="e.g. dinner w/ friends"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full">
          Save expense
        </Button>
      </form>
    </main>
  );
}
