"use client";

import { useRef } from "react";
import DeleteButton from "@/components/ui/delete-button";

// RareUI delete-button (tap → confirm/cancel panel) wired to an archive
// server action. Scaled down to sit inside compact list rows.
export default function ArchiveDelete({
  action,
  id,
}: {
  action: (formData: FormData) => Promise<void>;
  id: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={action} className="flex items-center">
      <input type="hidden" name="id" value={id} />
      <DeleteButton
        className="origin-right scale-[0.62] -my-2"
        onConfirm={() => formRef.current?.requestSubmit()}
      />
    </form>
  );
}
