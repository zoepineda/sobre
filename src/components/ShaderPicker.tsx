"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PINE,
  SHADER_CHOICES,
  SHADER_DEFS,
  recolor,
  setShaderChoice,
  useMotionPrefs,
  useShaderChoice,
} from "@/lib/paperShaders";

const FILL = { position: "absolute" as const, inset: 0, width: "100%", height: "100%" };

// Setup → Appearance: picks the animated background for the cash card
// and all account cards, with a live demo card underneath.
export default function ShaderPicker() {
  const choice = useShaderChoice();
  const { reduced } = useMotionPrefs();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const active = SHADER_DEFS.find((d) => d.name === choice);

  return (
    <div className="space-y-2.5">
      {/* live demo of the current pick */}
      <div className="relative h-28 overflow-hidden rounded-xl bg-pine p-4 text-white shadow-sm">
        {mounted && active && (
          <active.Comp style={FILL} {...recolor(active.params, PINE, { still: reduced })} />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/35 to-transparent" />
        <div className="relative flex h-full flex-col justify-between">
          <p className="text-xs text-white/70">Total cash</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold drop-shadow-sm">₱12,345.67</p>
            <p className="text-[11px] uppercase tracking-widest text-white/60">
              demo
            </p>
          </div>
        </div>
      </div>

      <Select value={choice} onValueChange={setShaderChoice}>
        <SelectTrigger className="w-full" aria-label="Card background style">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SHADER_CHOICES.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
