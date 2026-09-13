"use client";

import { useRef } from "react";

// Flat hue wheel: a conic-gradient ring, tap or drag anywhere on it to
// pick a hue (0 at 12 o'clock, clockwise). Arrow keys nudge for keyboard.
export default function HueWheel({
  hue,
  onChange,
  size = 96,
}: {
  hue: number | null;
  onChange: (h: number) => void;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const r = size / 2;
  const thumbRadius = r - 9;
  const angle = ((hue ?? 150) * Math.PI) / 180;
  const thumbX = r + thumbRadius * Math.sin(angle);
  const thumbY = r - thumbRadius * Math.cos(angle);

  function pick(clientX: number, clientY: number) {
    const box = ref.current!.getBoundingClientRect();
    const x = clientX - (box.left + box.width / 2);
    const y = clientY - (box.top + box.height / 2);
    // angle from 12 o'clock, clockwise
    const deg = (Math.atan2(x, -y) * 180) / Math.PI;
    onChange(Math.round((deg + 360) % 360));
  }

  return (
    <div
      ref={ref}
      role="slider"
      aria-label="Card color hue"
      aria-valuemin={0}
      aria-valuemax={359}
      aria-valuenow={hue ?? 150}
      tabIndex={0}
      className="relative shrink-0 cursor-pointer touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      style={{
        width: size,
        height: size,
        background:
          "conic-gradient(hsl(0 70% 45%), hsl(60 70% 45%), hsl(120 70% 40%), hsl(180 70% 40%), hsl(240 70% 50%), hsl(300 70% 45%), hsl(360 70% 45%))",
        // ring, not a disc
        WebkitMask: "radial-gradient(circle, transparent 57%, black 58%)",
        mask: "radial-gradient(circle, transparent 57%, black 58%)",
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        pick(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (e.buttons) pick(e.clientX, e.clientY);
      }}
      onKeyDown={(e) => {
        const base = hue ?? 150;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          onChange((base + 6) % 360);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          onChange((base + 354) % 360);
        }
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
        style={{
          left: thumbX,
          top: thumbY,
          background: `hsl(${hue ?? 150} 40% 31%)`,
          opacity: hue === null ? 0.45 : 1,
        }}
      />
    </div>
  );
}
