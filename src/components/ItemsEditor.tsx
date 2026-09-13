"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Optional receipt breakdown: rows render as named inputs the server action
// reads (item_name_N / item_amount_N). Purely informational — items don't
// have to add up to the expense total.
export default function ItemsEditor() {
  const [rows, setRows] = useState<number[]>([]);
  const [nextId, setNextId] = useState(0);

  return (
    <div className="space-y-2">
      {rows.map((id) => (
        <div key={id} className="flex items-center gap-2">
          <Input
            name={`item_name_${id}`}
            aria-label="Item name"
            placeholder="e.g. cat litter"
            className="flex-[2]"
          />
          <Input
            name={`item_amount_${id}`}
            aria-label="Item amount"
            inputMode="decimal"
            placeholder="₱"
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remove item"
            onClick={() => setRows((r) => r.filter((x) => x !== id))}
          >
            ✕
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-primary"
        onClick={() => {
          setRows((r) => [...r, nextId]);
          setNextId((n) => n + 1);
        }}
      >
        <i className="lni lni-plus" aria-hidden />{" "}
        {rows.length === 0 ? "Break down the receipt (optional)" : "Add item"}
      </Button>
    </div>
  );
}
