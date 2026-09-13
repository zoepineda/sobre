"use client";

import { useEffect, useState } from "react";
import { brandCardLogo } from "@/lib/brandLogos";
import { cardStyle } from "@/lib/cardStyles";
import { peso } from "@/lib/format";
import { SHADER_DEFS, recolor, useMotionPrefs, useShaderChoice } from "@/lib/paperShaders";

const FILL = {
  position: "absolute" as const,
  inset: 0,
  width: "100%",
  height: "100%",
};

// Pull the brand hexes out of the CSS gradient so the shader stays on-palette.
function brandColors(bg: string): string[] {
  return bg.match(/#[0-9a-fA-F]{6}/g) ?? ["#26303c", "#3a4a5c"];
}

export default function AccountCard({
  name,
  type,
  balance,
}: {
  name: string;
  type: string;
  balance: number;
}) {
  const s = cardStyle(name, type);
  const isCard = type === "credit_card";
  const choice = useShaderChoice();
  const { reduced, coarse } = useMotionPrefs();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const active = SHADER_DEFS.find((d) => d.name === choice);

  return (
    <div
      className="relative flex aspect-[8/5] flex-col justify-between overflow-hidden rounded-2xl p-3.5 shadow-md"
      style={{ background: s.bg, color: s.fg }}
    >
      {mounted && active && (
        <active.Comp
          style={FILL}
          {...recolor(active.params, brandColors(s.bg), { still: reduced || coarse })}
        />
      )}
      <div className="relative flex items-start justify-between">
        <div>
          {brandCardLogo(name, type) ? (
            // white knockout, like real card printing
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/brands/${brandCardLogo(name, type)!.logo}`}
              alt={name}
              className="w-auto max-w-[110px] object-contain object-left"
              style={{
                height: brandCardLogo(name, type)!.height,
                filter: brandCardLogo(name, type)!.knockout
                  ? "brightness(0) invert(1)"
                  : undefined,
                opacity: 0.95,
              }}
            />
          ) : (
            <p className="text-sm font-bold leading-tight">{name}</p>
          )}
          <p className="mt-0.5 text-[10px] uppercase tracking-widest" style={{ color: s.sub }}>
            {isCard ? "credit" : type.replace("_", " ")}
          </p>
        </div>
        {/* contactless mark */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.7 }}>
          <path d="M4 3.5c2.5 2.5 2.5 6.5 0 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M7 5c1.7 1.7 1.7 4.3 0 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M10 6.5c.8.8.8 2.2 0 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </div>

      <div className="relative flex items-end justify-between">
        {/* chip */}
        <div
          className="h-5 w-7 rounded-[4px] border"
          style={{ background: s.chip, borderColor: "rgba(0,0,0,0.25)", opacity: 0.9 }}
        >
          <div className="mx-auto mt-[7px] h-px w-4" style={{ background: "rgba(0,0,0,0.35)" }} />
        </div>
        <div className="text-right">
          {isCard && balance < 0 && (
            <p className="text-[10px]" style={{ color: s.sub }}>
              owes
            </p>
          )}
          <p className="text-base font-bold leading-tight">
            {isCard ? peso(Math.max(0, -balance)) : peso(balance)}
          </p>
        </div>
      </div>
    </div>
  );
}
