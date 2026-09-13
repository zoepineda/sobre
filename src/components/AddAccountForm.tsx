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
import { cardStyle } from "@/lib/cardStyles";

// mini brand card for the suggestion list — gradient from cardStyles plus a
// monogram (capitals in the name, e.g. GCash → GC), since we don't ship logos
function brandMark(name: string) {
  if (name.length <= 4) return name.toUpperCase();
  const caps = name.replace(/[^A-Z]/g, "");
  return (caps.length >= 2 ? caps : name.slice(0, 2).toUpperCase()).slice(0, 3);
}

// Known PH banks/wallets — suggested only while typing (never a full dump),
// and picking one auto-fills the account type. logo files live in
// public/brands/; chip picks the background the mark reads best on.
const KNOWN: {
  name: string;
  type: string;
  logo?: string;
  chip?: "light" | "dark" | "red";
}[] = [
  { name: "BPI", type: "bank", logo: "bpi.svg" },
  { name: "BDO", type: "bank", logo: "bdo.svg" },
  { name: "Metrobank", type: "bank", logo: "metrobank.svg" },
  { name: "Landbank", type: "bank", logo: "landbank.svg" },
  { name: "Security Bank", type: "bank", logo: "security-bank.svg" },
  { name: "PNB", type: "bank", logo: "pnb.svg" },
  { name: "RCBC", type: "bank", logo: "rcbc.svg" },
  { name: "UnionBank", type: "bank", logo: "unionbank.svg" },
  { name: "CIMB", type: "bank", logo: "cimb.svg", chip: "red" },
  { name: "MariBank", type: "bank", logo: "maribank.svg" },
  { name: "GoTyme", type: "bank", logo: "gotyme.svg" },
  { name: "Tonik", type: "bank", logo: "tonik.svg" },
  { name: "SeaBank", type: "bank", logo: "seabank.svg" },
  { name: "UNO Digital Bank", type: "bank", logo: "uno.svg" },
  { name: "OwnBank", type: "bank", logo: "ownbank.svg", chip: "dark" },
  { name: "Komo", type: "bank", logo: "komo.svg" },
  { name: "GCash", type: "ewallet", logo: "gcash.svg" },
  { name: "Maya", type: "ewallet", logo: "maya.svg", chip: "dark" },
  { name: "GrabPay", type: "ewallet", logo: "grabpay.svg" },
  { name: "ShopeePay", type: "ewallet", logo: "shopeepay.svg" },
  { name: "Coins.ph", type: "ewallet", logo: "coins-ph.svg" },
  { name: "Wallet cash", type: "cash" },
];

const CHIP_BG: Record<string, string> = {
  light: "bg-white border border-border/60",
  dark: "bg-[#101014]",
  red: "bg-[#DC241F]",
};

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
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                    i === focusIdx ? "bg-accent" : "hover:bg-accent"
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(k);
                  }}
                >
                  <span className="flex items-center gap-2.5">
                    {k.logo ? (
                      <span
                        aria-hidden
                        className={`flex h-6 w-10 shrink-0 items-center justify-center rounded-[5px] px-1 shadow-sm ${CHIP_BG[k.chip ?? "light"]}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/brands/${k.logo}`}
                          alt=""
                          className="max-h-4 max-w-full object-contain"
                        />
                      </span>
                    ) : (
                      <span
                        aria-hidden
                        className="flex h-6 w-10 shrink-0 items-center justify-center rounded-[5px] text-[9px] font-bold tracking-wide shadow-sm"
                        style={{
                          background: cardStyle(k.name, k.type).bg,
                          color: cardStyle(k.name, k.type).fg,
                        }}
                      >
                        {brandMark(k.name)}
                      </span>
                    )}
                    {k.name}
                  </span>
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
