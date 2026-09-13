"use client";

import { useMemo, useState } from "react";
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
import { peso, toCentavos } from "@/lib/format";

type Debt = { category_id: number; name: string; owed: number };
type Acct = { id: number; name: string };

export default function CardPayForm({
  debts,
  sources,
}: {
  debts: Debt[];
  sources: Acct[];
}) {
  const [amounts, setAmounts] = useState<Record<number, string>>(() =>
    Object.fromEntries(
      debts.map((d) => [d.category_id, (d.owed / 100).toFixed(2)])
    )
  );

  const total = useMemo(
    () =>
      debts.reduce((s, d) => {
        const c = toCentavos(amounts[d.category_id] || "0");
        return s + (Number.isFinite(c) && c > 0 ? c : 0);
      }, 0),
    [amounts, debts]
  );

  return (
    <Card className="py-4 shadow-sm">
      <CardContent className="space-y-3 px-4">
        <p className="text-sm font-semibold">Record a payment</p>
        <div className="space-y-2">
          {debts.map((d) => (
            <div
              key={d.category_id}
              className="flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm">{d.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  owes {peso(d.owed)}
                </p>
              </div>
              <Input
                name={`pay_${d.category_id}`}
                inputMode="decimal"
                value={amounts[d.category_id] ?? ""}
                onChange={(e) =>
                  setAmounts((s) => ({
                    ...s,
                    [d.category_id]: e.target.value,
                  }))
                }
                className="w-28 text-right"
              />
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <Label htmlFor="pay-source" className="text-xs text-muted-foreground">Paid from</Label>
          <Select
            name="source_account_id"
            defaultValue={String(sources[0]?.id)}
          >
            <SelectTrigger id="pay-source" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sources.map((a) => (
                <SelectItem key={a.id} value={String(a.id)}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            Paying from several accounts? Record one payment per account, and
            edit the envelope amounts above for each.
          </p>
        </div>
        <Button type="submit" className="w-full">
          Pay {peso(total)}
        </Button>
      </CardContent>
    </Card>
  );
}
