"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { archiveCategory, updateCategory } from "@/lib/actions";
import { peso } from "@/lib/format";

type Envelope = {
  id: number;
  name: string;
  is_system: boolean;
  group_id: number | null;
  payday_target: number;
  payday_account_id: number | null;
  payday_account_name: string | null;
  balance: number;
};
type Group = { id: number; name: string };
type Account = { id: number; name: string };

export default function EnvelopeList({
  envelopes,
  groups,
  accounts,
}: {
  envelopes: Envelope[];
  groups: Group[];
  accounts: Account[];
}) {
  const [editing, setEditing] = useState<Envelope | null>(null);

  const real = envelopes.filter((e) => !e.is_system);
  const unassigned = envelopes.find((e) => e.is_system && e.balance !== 0);
  const planTotal = real.reduce((s, e) => s + e.payday_target, 0);

  const sections: { key: string; title: string; list: Envelope[] }[] = [
    ...groups
      .map((g) => ({
        key: `g-${g.id}`,
        title: g.name,
        list: real.filter((e) => e.group_id === g.id),
      }))
      .filter((s) => s.list.length > 0),
  ];
  const ungrouped = real.filter(
    (e) => !groups.some((g) => g.id === e.group_id)
  );
  if (ungrouped.length > 0)
    sections.push({ key: "none", title: "No group", list: ungrouped });

  const row = (e: Envelope) => {
    return (
      <button
        key={e.id}
        type="button"
        onClick={() => setEditing(e)}
        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left hover:bg-muted/50"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{e.name}</span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {e.payday_account_name ? `→ ${e.payday_account_name}` : "no home account"}
            {e.balance !== 0 && (
              <>
                {" · "}
                <span className={e.balance < 0 ? "text-destructive" : undefined}>
                  holds {peso(e.balance)}
                </span>
              </>
            )}
          </span>
        </span>
        <span className="shrink-0 text-right">
          {e.payday_target > 0 ? (
            <>
              <span className="text-sm font-semibold">
                {peso(e.payday_target)}
              </span>
              <span className="ml-1 text-[10px] text-muted-foreground">
                /cutoff
              </span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" aria-hidden />
      </button>
    );
  };

  return (
    <>
      <Card className="gap-0 divide-y divide-border/60 overflow-hidden py-0 shadow-sm">
        {sections.map((s) => {
          const subtotal = s.list.reduce((sum, e) => sum + e.payday_target, 0);
          return (
            <div key={s.key}>
              <div className="flex items-center justify-between bg-muted/50 px-4 py-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {s.title}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {peso(subtotal)} /cutoff
                </p>
              </div>
              <div className="divide-y divide-border/40">{s.list.map(row)}</div>
            </div>
          );
        })}

        {unassigned && (
          <div className="flex items-center justify-between px-4 py-2.5">
            <p className="text-sm font-medium">
              Unassigned
              <Badge variant="outline" className="ml-1.5 text-[10px]">
                built-in
              </Badge>
            </p>
            <p className="text-sm font-semibold">{peso(unassigned.balance)}</p>
          </div>
        )}

        {/* the plan, confirmed */}
        <div className="flex items-center justify-between bg-secondary/60 px-4 py-2.5">
          <p className="text-xs font-semibold text-secondary-foreground">
            Plan total · {real.length} envelopes
          </p>
          <p className="text-sm font-bold text-secondary-foreground">
            {peso(planTotal)} /cutoff
          </p>
        </div>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent
          className="max-w-md"
          onSubmitCapture={() => setTimeout(() => setEditing(null), 80)}
        >
          <DialogHeader>
            <DialogTitle>Edit envelope</DialogTitle>
          </DialogHeader>
          {editing && (
            <div key={editing.id} className="space-y-4">
              <form action={updateCategory} className="space-y-3">
                <input type="hidden" name="id" value={editing.id} />
                <div className="space-y-1">
                  <Label htmlFor="env-name" className="text-xs text-muted-foreground">
                    Name
                  </Label>
                  <Input
                    id="env-name"
                    name="name"
                    defaultValue={editing.name}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="env-target" className="text-xs text-muted-foreground">
                      ₱ per cutoff
                    </Label>
                    <Input
                      id="env-target"
                      name="payday_target"
                      inputMode="decimal"
                      defaultValue={
                        editing.payday_target > 0
                          ? (editing.payday_target / 100).toFixed(2)
                          : ""
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Into account
                    </Label>
                    <Select
                      name="payday_account_id"
                      defaultValue={String(editing.payday_account_id ?? 0)}
                    >
                      <SelectTrigger aria-label="Home account" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">None</SelectItem>
                        {accounts.map((a) => (
                          <SelectItem key={a.id} value={String(a.id)}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Group</Label>
                  <Select
                    name="group_id"
                    defaultValue={String(editing.group_id ?? 0)}
                  >
                    <SelectTrigger aria-label="Envelope group" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No group</SelectItem>
                      {groups.map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Save changes
                </Button>
              </form>
              <form action={archiveCategory} className="text-center">
                <input type="hidden" name="id" value={editing.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                >
                  Archive this envelope
                </Button>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
