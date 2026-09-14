"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { playSound, setSoundsEnabled, soundsEnabled } from "@/lib/soundPref";

// Setup preference: little sound effects on key actions. On-device,
// per user, defaults to on. Toggling it on plays a preview.
export default function SoundPref({ userId }: { userId?: string }) {
  const [on, setOn] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOn(soundsEnabled(userId));
    setReady(true);
  }, [userId]);

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <Label htmlFor="sound-pref" className="text-sm font-medium">
          Sound effects 🔊
        </Label>
        <p className="text-[11px] text-muted-foreground">
          Soft chimes when money lands and bills get ticked. Synthesized on
          device, no audio files.
        </p>
      </div>
      <Checkbox
        id="sound-pref"
        checked={on}
        disabled={!ready}
        onCheckedChange={(v) => {
          const next = v === true;
          setOn(next);
          setSoundsEnabled(userId, next);
          if (next) playSound("chime", userId);
        }}
      />
    </div>
  );
}
