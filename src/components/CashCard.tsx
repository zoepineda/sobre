"use client";

import { useEffect, useState } from "react";
import ShaderSwatches from "@/components/ShaderSwatches";
import { TiltCard } from "@/components/motion/tilt-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import {
  SHADER_DEFS,
  recolor,
  useCashPalette,
  useMotionPrefs,
  useShaderChoice,
} from "@/lib/paperShaders";

const FILL = { position: "absolute" as const, inset: 0, width: "100%", height: "100%" };

export default function CashCard({ totalCash }: { totalCash: number }) {
  const choice = useShaderChoice();
  const palette = useCashPalette();
  const { reduced } = useMotionPrefs();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const active = SHADER_DEFS.find((s) => s.name === choice);

  return (
    <TiltCard max={7} className="rounded-xl [--foreground:#ffffff]">
    <div
      className="relative overflow-hidden rounded-xl p-5 text-white shadow-sm"
      style={{ background: palette[1] }}
    >
      {mounted && active && (
        <active.Comp style={FILL} {...recolor(active.params, palette, { still: reduced })} />
      )}
      {/* scrim so the numbers stay readable over busy shaders */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/35 to-transparent" />
      <ShaderSwatches />
      <div className="relative">
        <p className="text-xs text-white/70">Total cash</p>
        <AnimatedCounter
          value={totalCash / 100}
          decimals={2}
          prefix="₱"
          className="text-3xl font-bold drop-shadow-sm"
        />
      </div>
    </div>
    </TiltCard>
  );
}
