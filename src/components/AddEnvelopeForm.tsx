"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCategory } from "@/lib/actions";

type Opt = { id: number; name: string };

// Full envelope details at creation — same fields as the edit sheet.
export default function AddEnvelopeForm({
  groups,
  accounts,
}: {
  groups: Opt[];
  accounts: Opt[];
}) {
  return (
    <form action={createCategory} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="new-env-name" className="text-xs text-muted-foreground">
          Name
        </Label>
        <Input
          id="new-env-name"
          name="name"
          placeholder="e.g. Travel Fund"
          required
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="new-env-target" className="text-xs text-muted-foreground">
            ₱ per cutoff
          </Label>
          <Input
            id="new-env-target"
            name="payday_target"
            inputMode="decimal"
            placeholder="0"
          />
        </div>
        <div className="flex-1 space-y-1">
          <Label className="text-xs text-muted-foreground">Into account</Label>
          <Select name="payday_account_id" defaultValue="0">
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
        <Select name="group_id" defaultValue="0">
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
        Add envelope
      </Button>
    </form>
  );
}
