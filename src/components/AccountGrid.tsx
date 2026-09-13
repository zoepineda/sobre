"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import AccountCard from "@/components/AccountCard";
import { TiltCard } from "@/components/motion/tilt-card";
import { reorderAccounts } from "@/lib/actions";

type Acct = { id: number; name: string; type: string; balance: number };

function SortableCard({
  account,
  onOpen,
}: {
  account: Acct;
  onOpen: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: account.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: "manipulation",
      }}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(account.id)}
      className={
        "group relative " +
        (isDragging
          ? "z-10 cursor-grabbing opacity-90"
          : "cursor-pointer select-none")
      }
    >
      <TiltCard max={10} className="rounded-2xl [--foreground:#ffffff]">
        <AccountCard
          name={account.name}
          type={account.type}
          balance={account.balance}
        />
      </TiltCard>
      <GripVertical
        aria-hidden
        className="pointer-events-none absolute right-1.5 top-1/2 z-10 size-4 -translate-y-1/2 text-white/70 opacity-0 drop-shadow transition-opacity duration-200 group-hover:opacity-100"
      />
    </div>
  );
}

// Drag cards to reorder; the order persists (accounts.sort) everywhere.
export default function AccountGrid({ accounts }: { accounts: Acct[] }) {
  const [items, setItems] = useState(accounts);
  const router = useRouter();
  // Suppress the click that fires right after a drag ends.
  const dragged = useRef(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
    // keyboard: Tab to a card, Space to lift, arrows to move, Space to drop
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function onOpen(id: number) {
    if (dragged.current) return;
    router.push(`/accounts/${id}`);
  }

  function onDragEnd(event: DragEndEvent) {
    dragged.current = true;
    setTimeout(() => (dragged.current = false), 150);
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
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-3">
          {items.map((a) => (
            <SortableCard key={a.id} account={a} onOpen={onOpen} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
