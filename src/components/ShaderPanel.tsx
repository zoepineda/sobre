"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cardStyle } from "@/lib/cardStyles";
import { SHADER_DEFS, recolor, useMotionPrefs, useShaderChoice } from "@/lib/paperShaders";

const FILL = { position: "absolute" as const, inset: 0, width: "100%", height: "100%" };

function brandColors(bg: string): string[] {
  return bg.match(/#[0-9a-fA-F]{6}/g) ?? ["#26303c", "#3a4a5c"];
}

// Brand-colored panel with the globally-selected shader backdrop.
// Used for the big header cards on account/card detail pages.
export default function ShaderPanel({
  name,
  type,
  className = "",
  children,
}: {
  name: string;
  type: string;
  className?: string;
  children: ReactNode;
}) {
  const s = cardStyle(name, type);
  const choice = useShaderChoice();
  const { reduced, coarse } = useMotionPrefs();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const active = SHADER_DEFS.find((d) => d.name === choice);

  return (
    <section
      className={`relative overflow-hidden ${className}`}
      style={{ background: s.bg, color: s.fg }}
    >
      {mounted && active && (
        <active.Comp style={FILL} {...recolor(active.params, brandColors(s.bg), { still: reduced || coarse })} />
      )}
      <div className="relative">{children}</div>
    </section>
  );
}
