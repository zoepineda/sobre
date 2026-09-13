"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAccount } from "@/lib/actions";

// Known PH banks/wallets — suggested only while typing (never a full dump),
// and picking one auto-fills the account type.
const KNOWN: { name: string; type: string }[] = [
  { name: "BPI", type: "bank" },
  { name: "BDO", type: "bank" },
  { name: "Metrobank", type: "bank" },
  { name: "Landbank", type: "bank" },
  { name: "Security Bank", type: "bank" },
  { name: "PNB", type: "bank" },
  { name: "RCBC", type: "bank" },
  { name: "UnionBank", type: "bank" },
  { name: "CIMB", type: "bank" },
  { name: "MariBank", type: "bank" },
  { name: "GoTyme", type: "bank" },
  { name: "Tonik", type: "bank" },
  { name: "SeaBank", type: "bank" },
  { name: "UNO Digital Bank", type: "bank" },
  { name: "OwnBank", type: "bank" },
  { name: "Komo", type: "bank" },
  { name: "GCash", type: "ewallet" },
  { name: "Maya", type: "ewallet" },
  { name: "GrabPay", type: "ewallet" },
  { name: "ShopeePay", type: "ewallet" },
  { name: "Coins.ph", type: "ewallet" },
  { name: "Wallet cash", type: "cash" },
];

export default function AddAccountForm() {
  const [name, setName] = useState("");
  const [type, setType] = useState("bank");
  const [focusIdx, setFocusIdx] = useState(-1);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = name.trim().toLowerCase();
  const matches =
    q.length > 0
      ? KNOWN.filter(
          (k) =>
            k.name.toLowerCase().includes(q) && k.name.toLowerCase() !== q
        ).slice(0, 6)
      : [];
  const showList = open && matches.length > 0;

  function pick(k: { name: string; type: string }) {
    setName(k.name);
    setType(k.type);
    setOpen(false);
    setFocusIdx(-1);
  }

  return (
    <form action={createAccount} className="space-y-3">
      <div className="relative">
        <Input
          ref={inputRef}
          name="name"
          placeholder="e.g. BPI, GCash, Wallet cash"
          required
          autoComplete="off"
          role="combobox"
          aria-expanded={showList}
          aria-label="Account name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setOpen(true);
            setFocusIdx(-1);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (!showList) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setFocusIdx((i) => Math.min(matches.length - 1, i + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setFocusIdx((i) => Math.max(-1, i - 1));
            } else if (e.key === "Enter" && focusIdx >= 0) {
              e.preventDefault();
              pick(matches[focusIdx]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        {showList && (
          <ul
            role="listbox"
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border bg-popover shadow-md"
          >
            {matches.map((k, i) => (
              <li key={k.name} role="option" aria-selected={i === focusIdx}>
                <button
                  type="button"
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm ${
                    i === focusIdx ? "bg-accent" : "hover:bg-accent"
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(k);
                  }}
                >
                  {k.name}
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {k.type.replace("_", " ")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2">
        <Select name="type" value={type} onValueChange={setType}>
          <SelectTrigger aria-label="Account type" className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank">Bank</SelectItem>
            <SelectItem value="ewallet">E-wallet</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="credit_card">Credit card</SelectItem>
          </SelectContent>
        </Select>
        <Input
          name="opening"
          inputMode="decimal"
          placeholder="Opening ₱ (not for cards)"
          className="flex-1"
        />
      </div>
      <p className="text-[11px] text-muted-foreground">
        Opening balances land in the Unassigned envelope — use Move to
        distribute them. Credit cards start at zero owed.
      </p>
      <Button type="submit" className="w-full">
        Add account
      </Button>
    </form>
  );
}
