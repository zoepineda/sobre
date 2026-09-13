"use client";

import { useState } from "react";
import { setStartingBalances } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { peso } from "@/lib/format";

type Envelope = {
  id: number;
  name: string;
  balance: number;
  homeAccountId: number | null;
};
type Account = { id: number; name: string };

export default function StartingBalancesForm({
  envelopes,
  accounts,
  unassignedTotal,
}: {
  envelopes: Envelope[];
  accounts: Account[];
  unassignedTotal: number;
}) {
  const [amounts, setAmounts] = useState<Record<number, string>>({});

  const entered = Object.values(amounts).reduce((sum, v) => {
    const n = Math.round(parseFloat(v) * 100);
    return sum + (Number.isFinite(n) && n > 0 ? n : 0);
  }, 0);
  const over = entered > unassignedTotal;

  return (
    <form action={setStartingBalances} className="space-y-4">
      <Card className="gap-0 divide-y divide-border/60 py-0 shadow-sm">
        {envelopes.map((e) => (
          <div key={e.id} className="flex items-center gap-2 px-4 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{e.name}</p>
              <p className="text-[11px] text-muted-foreground">
                holds {peso(e.balance)}
              </p>
            </div>
            <Select
              name={`account_${e.id}`}
              defaultValue={String(e.homeAccountId ?? accounts[0]?.id)}
            >
              <SelectTrigger
                aria-label={`Account for ${e.name}`}
                size="sm"
                className="w-28 shrink-0"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              name={`amount_${e.id}`}
              inputMode="decimal"
              placeholder="0.00"
              aria-label={`Amount for ${e.name}`}
              className="h-9 w-24 shrink-0 text-right"
              value={amounts[e.id] ?? ""}
              onChange={(ev) =>
                setAmounts((prev) => ({ ...prev, [e.id]: ev.target.value }))
              }
            />
          </div>
        ))}
      </Card>

      <div className="sticky bottom-20 space-y-2 lg:bottom-4">
        <Card className="py-3 shadow-md">
          <CardContent className="flex items-center justify-between px-4">
            <p className="text-sm">
              Distributing{" "}
              <span className={`font-bold ${over ? "text-destructive" : ""}`}>
                {peso(entered)}
              </span>{" "}
              of {peso(unassignedTotal)} unassigned
            </p>
            <Button type="submit" disabled={entered === 0}>
              Set balances
            </Button>
          </CardContent>
        </Card>
        {over && (
          <p className="text-center text-xs text-destructive">
            That&apos;s more than what&apos;s sitting in Unassigned — the
            extra would push Unassigned negative. Double-check the amounts
            (or your accounts&apos; opening balances).
          </p>
        )}
      </div>
    </form>
  );
}
