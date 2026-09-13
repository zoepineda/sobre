"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { peso, toCentavos } from "@/lib/format";

type Cat = { id: number; name: string };

export default function IncomeSplits({ categories }: { categories: Cat[] }) {
  const [total, setTotal] = useState("");
  const [splits, setSplits] = useState<Record<number, string>>({});

  const totalC = toCentavos(total || "0");
  const allocated = useMemo(
    () =>
      Object.values(splits).reduce((s, v) => {
        const c = toCentavos(v || "0");
        return s + (Number.isFinite(c) && c > 0 ? c : 0);
      }, 0),
    [splits]
  );
  const remaining = (Number.isFinite(totalC) ? totalC : 0) - allocated;

  return (
    <>
      <Card className="py-4 shadow-sm">
        <CardContent className="px-4">
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
          {categories.map((c) => (
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
