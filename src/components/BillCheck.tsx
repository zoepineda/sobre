"use client";

import { useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleBillPaid } from "@/lib/actions";
import { playSound } from "@/lib/soundPref";

export default function BillCheck({
  billId,
  month,
  paid,
}: {
  billId: number;
  month: string;
  paid: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={toggleBillPaid}>
      <input type="hidden" name="bill_id" value={billId} />
      <input type="hidden" name="month" value={month} />
      <Checkbox
        id={`bill-${billId}`}
        checked={paid}
        onCheckedChange={(v) => {
          if (v === true) playSound("droplet");
          formRef.current?.requestSubmit();
        }}
        className="size-5"
        aria-label="Mark bill paid"
      />
    </form>
  );
}
