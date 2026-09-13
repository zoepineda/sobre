"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { confettiEnabled, setConfettiEnabled } from "@/lib/confettiPref";

// Setup preference: celebrate logged income with confetti. On-device,
// per user, defaults to on.
export default function ConfettiPref({ userId }: { userId?: string }) {
  const [on, setOn] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOn(confettiEnabled(userId));
    setReady(true);
  }, [userId]);

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <Label htmlFor="confetti-pref" className="text-sm font-medium">
          Confetti on income 🎉
        </Label>
        <p className="text-[11px] text-muted-foreground">
          A little celebration every time money comes in. Turn it off if
          that&apos;s not your thing.
        </p>
      </div>
      <Checkbox
        id="confetti-pref"
        checked={on}
        disabled={!ready}
        onCheckedChange={(v) => {
          const next = v === true;
          setOn(next);
          setConfettiEnabled(userId, next);
        }}
      />
    </div>
  );
}
