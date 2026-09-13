"use client";

import { useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setCategoryGroup } from "@/lib/actions";

export default function GroupAssign({
  categoryId,
  groupId,
  groups,
}: {
  categoryId: number;
  groupId: number | null;
  groups: { id: number; name: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState(groupId ? String(groupId) : "0");

  return (
    <form ref={formRef} action={setCategoryGroup}>
      <input type="hidden" name="category_id" value={categoryId} />
      <input type="hidden" name="group_id" value={value} />
      <Select
        value={value}
        onValueChange={(v) => {
          setValue(v);
          requestAnimationFrame(() => formRef.current?.requestSubmit());
        }}
      >
        <SelectTrigger size="sm" aria-label="Envelope group" className="text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">no group</SelectItem>
          {groups.map((g) => (
            <SelectItem key={g.id} value={String(g.id)}>
              {g.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  );
}
