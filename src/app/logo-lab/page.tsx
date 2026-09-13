"use client";

import Link from "next/link";
import { Fraunces } from "next/font/google";
import { DialRoot, useDialKit } from "dialkit";
import "dialkit/styles.css";

const fraunces = Fraunces({ subsets: ["latin"], weight: "900" });

// Logo Lab — two concepts, switchable in the panel:
//   V1 "Geometric": envelope whose flap is an upward arrow (pine + mint)
//   V2 "Peeking eyes": wobbly Otter-vibe envelope with eyes (amber + ink)

type V1 = {
  tile: string;
  envelope: string;
  arrow: string;
  cornerRadius: number;
  strokeWidth: number;
  bodyTop: number;
  bodyRadius: number;
  flap: { inset: number; peak: number; base: number };
  peso: { show: boolean; width: number; y: number };
};

type V2 = {
  ink: string;
  eyeFill: string;
  strokeWidth: number;
  eyes: {
    size: number;
    gap: number;
    y: number;
    pupilScale: number;
    pupilOffset: { x: number; y: number };
  };
  flap: { show: boolean; depth: number };
  tile: { color: string; radius: number };
};

function MarkV1({ size, p, onTile = true }: { size: number; p: V1; onTile?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      {onTile && <rect width="48" height="48" rx={p.cornerRadius} fill={p.tile} />}
      <rect
        x={9}
        y={p.bodyTop}
        width={30}
        height={37 - p.bodyTop}
        rx={p.bodyRadius}
        stroke={onTile ? p.envelope : p.tile}
        strokeWidth={p.strokeWidth}
      />
      <path
        d={`M${p.flap.inset} ${p.flap.base} L24 ${p.flap.peak} L${48 - p.flap.inset} ${p.flap.base}`}
        stroke={p.arrow}
        strokeWidth={p.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {p.peso.show && (
        <path
          d={`M${24 - p.peso.width / 2} ${p.peso.y} H${24 + p.peso.width / 2}`}
          stroke={onTile ? p.envelope : p.tile}
          strokeWidth={p.strokeWidth}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function MarkV2({ size, p, onTile = true }: { size: number; p: V2; onTile?: boolean }) {
  const sw = p.strokeWidth;
  const cxL = 24 - p.eyes.gap / 2;
  const cxR = 24 + p.eyes.gap / 2;
  const r = p.eyes.size;
  const pr = r * p.eyes.pupilScale;
  const px = p.eyes.pupilOffset.x;
  const py = -p.eyes.pupilOffset.y;

  const eye = (cx: number) => (
    <g key={cx}>
      <circle cx={cx} cy={p.eyes.y} r={r} fill={p.eyeFill} stroke={p.ink} strokeWidth={sw} />
      <circle
        cx={Math.max(cx - r + pr, Math.min(cx + r - pr, cx + px))}
        cy={Math.max(p.eyes.y - r + pr, Math.min(p.eyes.y + r - pr, p.eyes.y + py))}
        r={pr}
        fill={p.ink}
      />
    </g>
  );

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      {onTile && <rect width="48" height="48" rx={p.tile.radius} fill={p.tile.color} />}
      <path
        d="M9.2 21.4 Q8.6 20.2 10 19.9 L23.2 19.4 L38.2 19.8 Q39.6 19.8 39.7 21.2 L40.2 37.4 Q40.3 39.5 38.4 39.6 L10.4 40.2 Q8.6 40.2 8.5 38.4 Z"
        fill={onTile ? "none" : p.eyeFill}
        stroke={p.ink}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      {p.flap.show && (
        <path
          d={`M9.6 21.2 L24 ${20 + p.flap.depth} L39.3 20.8`}
          stroke={p.ink}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
      {eye(cxL)}
      {eye(cxR)}
    </svg>
  );
}

export default function LogoLab() {
  const p = useDialKit(
    "Sobre Logo",
    {
      concept: {
        type: "select" as const,
        options: [
          { value: "v1", label: "V1 — Geometric arrow" },
          { value: "v2", label: "V2 — Peeking eyes" },
        ],
        default: "v2",
      },
      heroBg: "#ffb80a",
      wordmark: "sobre",
      v1: {
        _collapsed: true,
        tile: "#1e4633",
        envelope: "#e4efe9",
        arrow: "#67e8a9",
        cornerRadius: [10, 0, 24, 0.5],
        strokeWidth: [2.6, 1, 5, 0.1],
        bodyTop: [16, 12, 22, 0.5],
        bodyRadius: [3.5, 0, 10, 0.5],
        flap: { inset: [13, 9, 20, 0.5], peak: [17.5, 10, 26, 0.5], base: [27, 20, 34, 0.5] },
        peso: { show: true, width: [7, 3, 16, 0.5], y: [33, 28, 36, 0.5] },
      },
      v2: {
        ink: "#1a1d24",
        eyeFill: "#f6f6f4",
        strokeWidth: [3.2, 1.5, 5, 0.1],
        eyes: {
          size: [5.5, 3, 8, 0.1],
          gap: [12.5, 8, 20, 0.5],
          y: [19, 14, 24, 0.5],
          pupilScale: [0.62, 0.3, 0.85, 0.01],
          pupilOffset: { type: "pad" as const, x: [-1.2, -3, 3, 0.1], y: [-0.8, -3, 3, 0.1] },
        },
        flap: { show: true, depth: [11, 4, 17, 0.5] },
        tile: { color: "#ffb80a", radius: [10, 0, 24, 0.5] },
      },
    },
    { id: "sobre-logo-lab-v3", persist: true }
  );

  const isV2 = p.concept === "v2";
  const Mark = ({ size, onTile }: { size: number; onTile?: boolean }) =>
    isV2 ? (
      <MarkV2 size={size} p={p.v2} onTile={onTile} />
    ) : (
      <MarkV1 size={size} p={p.v1} onTile={onTile} />
    );
  const wordmarkClass = isV2 ? fraunces.className : "font-bold";
  const heroInk = isV2 ? p.v2.ink : "#ffffff";

  return (
    <main className="p-4 lg:p-8 lg:mx-auto lg:max-w-3xl space-y-6">
      <DialRoot position="top-right" defaultOpen />

      <header className="pt-3 lg:pt-0">
        <Link href="/settings" className="text-xs text-primary">
          ← Setup
        </Link>
        <h1 className="text-xl font-bold">Logo Lab</h1>
        <p className="text-xs text-muted-foreground">
          Switch concepts in the panel; each keeps its own controls.
        </p>
      </header>

      <section
        className="flex items-center justify-center gap-4 rounded-xl py-14 shadow-sm"
        style={{ background: isV2 ? p.heroBg : p.v1.tile }}
      >
        <Mark size={104} onTile={false} />
        <span
          className={`${wordmarkClass} text-6xl tracking-tight`}
          style={{ color: heroInk }}
        >
          {p.wordmark}
        </span>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          At real sizes
        </h2>
        <div className="flex flex-wrap items-end gap-6 rounded-xl bg-card p-6 shadow-sm">
          {[16, 24, 32, 48, 64].map((s) => (
            <div key={s} className="flex flex-col items-center gap-1.5">
              <Mark size={s} />
              <p className="text-[11px] text-muted-foreground">{s}px</p>
            </div>
          ))}
          <div className="flex flex-col items-center gap-1.5">
            <span className="inline-flex items-center gap-2">
              <Mark size={30} />
              <span className={`${wordmarkClass} text-xl text-foreground`}>
                {p.wordmark}
              </span>
            </span>
            <p className="text-[11px] text-muted-foreground">sidebar</p>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          On different surfaces
        </h2>
        <div className="grid grid-cols-3 overflow-hidden rounded-xl shadow-sm">
          <div className="flex items-center justify-center bg-background py-8">
            <Mark size={48} />
          </div>
          <div className="flex items-center justify-center bg-pine py-8">
            <Mark size={48} />
          </div>
          <div className="flex items-center justify-center bg-ink py-8">
            <Mark size={48} />
          </div>
        </div>
      </section>

      <p className="text-[11px] text-muted-foreground">
        Happy with one? Hit <span className="font-semibold">Copy</span> in the
        panel toolbar (or just tell me which version + tweaks) and it gets
        baked into the real logo + favicon.
      </p>
    </main>
  );
}
