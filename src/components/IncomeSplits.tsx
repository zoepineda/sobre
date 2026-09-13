"use client";

import { useMemo, useState } from "react";
import BrandChip from "@/components/BrandChip";
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
import { peso, toCentavos } from "@/lib/format";

type Cat = {
  id: number;
  name: string;
  homeId: number | null;
  isSystem: boolean;
};
type Account = { id: number; name: string; type: string };

export default function IncomeSplits({
  categories,
  accounts,
  defaultAccountId,
}: {
  categories: Cat[];
  accounts: Account[];
  defaultAccountId?: number;
}) {
  const [total, setTotal] = useState("");
  const [accountId, setAccountId] = useState(
    String(defaultAccountId ?? accounts[0]?.id ?? "")
  );
  const [splits, setSplits] = useState<Record<number, string>>({});

  // the deposit account filters the list: its own envelopes, envelopes
  // without a home yet, and Unassigned — so money can't land in envelopes
  // that live in a different account by accident
  const visible = useMemo(
    () =>
      categories.filter(
        (c) => c.isSystem || !c.homeId || c.homeId === Number(accountId)
      ),
    [categories, accountId]
  );

  const totalC = toCentavos(total || "0");
  const allocated = useMemo(
    () =>
      visible.reduce((s, c) => {
        const v = toCentavos(splits[c.id] || "0");
        return s + (Number.isFinite(v) && v > 0 ? v : 0);
      }, 0),
    [splits, visible]
  );
  const remaining = (Number.isFinite(totalC) ? totalC : 0) - allocated;
  const accountName = accounts.find((a) => String(a.id) === accountId)?.name;

  return (
    <>
      <Card className="py-4 shadow-sm">
        <CardContent className="space-y-3 px-4">
          <div>
            <Label htmlFor="total" className="text-xs text-muted-foreground">
              Amount received (₱)
            </Label>
            <input
              id="total"
              inputMode="decimal"
              placeholder="0.00"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="w-full bg-transparent text-3xl font-bold outline-none"
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="income-account"
              className="text-xs text-muted-foreground"
            >
              Deposited into
            </Label>
            <Select name="account_id" value={accountId} onValueChange={setAccountId}>
              <SelectTrigger id="income-account" className="w-full">
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
          </div>
        </CardContent>
      </Card>

      <Card className="py-4 shadow-sm">
        <CardContent className="space-y-2.5 px-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Split into envelopes</p>
            <p
              className={`text-xs font-medium ${
                remaining === 0 && allocated > 0
                  ? "text-primary"
                  : remaining < 0
                    ? "text-destructive"
                    : "text-muted-foreground"
              }`}
            >
              {remaining < 0
                ? `over by ${peso(-remaining)}`
                : `${peso(remaining)} left to assign`}
            </p>
          </div>
          {accountName && (
            <p className="text-[11px] text-muted-foreground">
              Showing envelopes homed in {accountName} (plus any without a
              home). Switch the account above to fill its envelopes.
            </p>
          )}
          {visible.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3">
              <Label htmlFor={`split_${c.id}`} className="text-sm font-normal">
                {c.name}
              </Label>
              <Input
                id={`split_${c.id}`}
                name={`split_${c.id}`}
                inputMode="decimal"
                placeholder="0"
                value={splits[c.id] ?? ""}
                onChange={(e) =>
                  setSplits((s) => ({ ...s, [c.id]: e.target.value }))
                }
                className="w-28 text-right"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
