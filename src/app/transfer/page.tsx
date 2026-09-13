import { getAccounts, getCategories } from "@/lib/queries";
import Link from "next/link";
import { addTransfer } from "@/lib/actions";
import BrandChip from "@/components/BrandChip";
import EnvelopeOption from "@/components/EnvelopeOption";
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

export default async function Transfer({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const [{ from, to }, allAccounts, categories] = await Promise.all([
    searchParams,
    getAccounts(),
    getCategories(),
  ]);
  const accounts = allAccounts.filter((a) => a.type !== "credit_card");
  const valid = (v?: string) =>
    accounts.some((a) => String(a.id) === v) ? v : undefined;

  const accountSelect = (name: string, preselect?: string) => (
    <Select
      name={name}
      defaultValue={valid(preselect) ?? String(accounts[0]?.id)}
    >
      <SelectTrigger id={name} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((a) => (
          <SelectItem key={a.id} value={String(a.id)}>
            <span className="flex items-center gap-2">
              <BrandChip name={a.name} type={a.type} />
              {a.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
  const categorySelect = (name: string) => (
    <Select name={name} defaultValue={String(categories[0]?.id)}>
      <SelectTrigger id={name} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {categories.map((c) => {
          const home = allAccounts.find((a) => a.id === c.payday_account_id);
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
  );

  return (
    <main className="p-4 lg:p-8 lg:mx-auto lg:max-w-xl space-y-4">
      <h1 className="pt-3 lg:pt-0 text-xl font-bold">Move money</h1>
      <p className="text-xs text-muted-foreground">
        Between accounts, between envelopes, or both at once, e.g. topping up
        an overspent envelope or distributing Unassigned money. Seeding all
        your envelopes at once?{" "}
        <Link href="/starting-balances" className="font-medium text-primary">
          Set starting balances →
        </Link>
      </p>
      <form action={addTransfer} className="space-y-4">
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
              className="w-full bg-transparent text-3xl font-bold outline-none"
            />
          </CardContent>
        </Card>
        <Card className="py-4 shadow-sm">
          <CardContent className="space-y-3 px-4">
            <p className="text-sm font-semibold">From</p>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <Label htmlFor="from_account_id" className="text-xs text-muted-foreground">Account</Label>
                {accountSelect("from_account_id", from)}
              </div>
              <div className="flex-1 space-y-1">
                <Label htmlFor="from_category_id" className="text-xs text-muted-foreground">
                  Envelope
                </Label>
                {categorySelect("from_category_id")}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="py-4 shadow-sm">
          <CardContent className="space-y-3 px-4">
            <p className="text-sm font-semibold">To</p>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <Label htmlFor="to_account_id" className="text-xs text-muted-foreground">Account</Label>
                {accountSelect("to_account_id", to)}
              </div>
              <div className="flex-1 space-y-1">
                <Label htmlFor="to_category_id" className="text-xs text-muted-foreground">
                  Envelope
                </Label>
                {categorySelect("to_category_id")}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Same account on both sides = just relabeling money between
              envelopes. Same envelope on both sides = moving cash between
              accounts.
            </p>
          </CardContent>
        </Card>
        <Card className="py-4 shadow-sm">
          <CardContent className="flex gap-3 px-4">
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
              <Input id="note" name="note" />
            </div>
          </CardContent>
        </Card>
        <Button type="submit" size="lg" className="w-full">
          Move it
        </Button>
      </form>
    </main>
  );
}
