"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Section-header "+ X" button that opens the add-form in a dialog.
// Closes optimistically when the inner form submits.
export default function AddDialog({
  title,
  trigger,
  children,
}: {
  title: string;
  trigger: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label={`Add ${trigger.toLowerCase()}`}
        >
          <i className="lni lni-plus" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[calc(100%-2rem)] sm:max-w-md"
        onSubmitCapture={() => setTimeout(() => setOpen(false), 80)}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
