"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ArchiveDelete from "@/components/ArchiveDelete";
import { Card } from "@/components/ui/card";
import { archiveAccount, reorderAccounts } from "@/lib/actions";
import { brandCardLogo } from "@/lib/brandLogos";
import { cardStyle } from "@/lib/cardStyles";
import { peso } from "@/lib/format";

type Acct = { id: number; name: string; type: string; balance: number };

function Row({ account }: { account: Acct }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: account.id });
  const s = cardStyle(account.name, account.type);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        background: s.bg,
        color: s.fg,
        touchAction: "manipulation",
      }}
      {...attributes}
      {...listeners}
      className={
        "flex items-center justify-between px-4 py-2.5 " +
        (isDragging ? "relative z-10 cursor-grabbing opacity-90" : "cursor-grab")
      }
    >
      <div className="select-none">
        {brandCardLogo(account.name, account.type) ? (
          // white knockout, matching the Home cards
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/brands/${brandCardLogo(account.name, account.type)!.logo}`}
            alt={account.name}
            className="w-auto max-w-[100px] object-contain object-left"
            style={{
              height: Math.round(brandCardLogo(account.name, account.type)!.height * 0.8),
              filter: brandCardLogo(account.name, account.type)!.knockout
                ? "brightness(0) invert(1)"
                : undefined,
              opacity: 0.95,
            }}
          />
        ) : (
          <p className="text-sm font-medium">{account.name}</p>
        )}
        <p className="mt-0.5 text-[11px] uppercase tracking-wide" style={{ color: s.sub }}>
          {account.type.replace("_", " ")} · {peso(account.balance)}
        </p>
      </div>
      <ArchiveDelete action={archiveAccount} id={account.id} />
    </div>
  );
}

export default function SetupAccountList({ accounts }: { accounts: Acct[] }) {
  const [items, setItems] = useState(accounts);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
    // keyboard: Tab to a card, Space to lift, arrows to move, Space to drop
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const next = arrayMove(
        prev,
        prev.findIndex((a) => a.id === active.id),
        prev.findIndex((a) => a.id === over.id)
      );
      reorderAccounts(next.map((a) => a.id));
      return next;
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <Card className="gap-0 overflow-hidden py-0 shadow-sm">
          {items.map((a) => (
            <Row key={a.id} account={a} />
          ))}
        </Card>
      </SortableContext>
    </DndContext>
  );
}
