"use client";

import { useRef } from "react";
import { type CashColor } from "@/lib/paperShaders";

// Classic rectangle color picker: a saturation/brightness box for the
// current hue, plus a horizontal hue strip underneath. Internally HSV
// (that's what makes the rectangle read correctly); stored as HSL.

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

function hslToHsv(c: CashColor) {
  const l = c.l / 100;
  const sl = c.s / 100;
  const v = l + sl * Math.min(l, 1 - l);
  const sv = v === 0 ? 0 : 2 * (1 - l / v);
  return { h: c.h, s: sv * 100, v: v * 100 };
}

function hsvToHsl(h: number, sv: number, v: number): CashColor {
  const vv = v / 100;
  const s = sv / 100;
  const l = vv * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (vv - l) / Math.min(l, 1 - l);
  return { h, s: Math.round(sl * 100), l: Math.round(l * 100) };
}

const PINE_DEFAULT: CashColor = { h: 150, s: 40, l: 20 };

export default function ColorPicker({
  color,
  onChange,
}: {
  color: CashColor | null;
  onChange: (c: CashColor) => void;
}) {
  const rectRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const current = color ?? PINE_DEFAULT;
  const hsv = hslToHsv(current);

  function pickRect(clientX: number, clientY: number) {
    const box = rectRef.current!.getBoundingClientRect();
    const s = clamp(((clientX - box.left) / box.width) * 100, 0, 100);
    const v = clamp((1 - (clientY - box.top) / box.height) * 100, 0, 100);
    onChange(hsvToHsl(current.h, s, v));
  }

  function pickHue(clientX: number) {
    const box = hueRef.current!.getBoundingClientRect();
    const h = Math.round(
      clamp(((clientX - box.left) / box.width) * 360, 0, 359)
    );
    onChange({ ...current, h });
  }

  const drag =
    (pick: (x: number, y: number) => void) =>
    ({
      onPointerDown: (e: React.PointerEvent) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        pick(e.clientX, e.clientY);
      },
      onPointerMove: (e: React.PointerEvent) => {
        if (e.buttons) pick(e.clientX, e.clientY);
      },
    });

  return (
    <div className="w-44 space-y-2">
      {/* saturation / brightness box */}
      <div
        ref={rectRef}
        role="slider"
        aria-label="Color shade"
        aria-valuetext={`saturation ${Math.round(hsv.s)}, brightness ${Math.round(hsv.v)}`}
        aria-valuenow={Math.round(hsv.v)}
        tabIndex={0}
        className="relative h-28 w-full cursor-crosshair touch-none rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${current.h} 100% 50%))`,
        }}
        {...drag(pickRect)}
        onKeyDown={(e) => {
          const step = 5;
          if (e.key === "ArrowRight")
            onChange(hsvToHsl(current.h, clamp(hsv.s + step, 0, 100), hsv.v));
          else if (e.key === "ArrowLeft")
            onChange(hsvToHsl(current.h, clamp(hsv.s - step, 0, 100), hsv.v));
          else if (e.key === "ArrowUp")
            onChange(hsvToHsl(current.h, hsv.s, clamp(hsv.v + step, 0, 100)));
          else if (e.key === "ArrowDown")
            onChange(hsvToHsl(current.h, hsv.s, clamp(hsv.v - step, 0, 100)));
          else return;
          e.preventDefault();
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{
            left: `${hsv.s}%`,
            top: `${100 - hsv.v}%`,
            background: `hsl(${current.h} ${current.s}% ${current.l}%)`,
          }}
        />
      </div>

      {/* hue strip */}
      <div
        ref={hueRef}
        role="slider"
        aria-label="Hue"
        aria-valuemin={0}
        aria-valuemax={359}
        aria-valuenow={Math.round(current.h)}
        tabIndex={0}
        className="relative h-3.5 w-full cursor-pointer touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        style={{
          background:
            "linear-gradient(to right, hsl(0 85% 55%), hsl(60 85% 55%), hsl(120 85% 45%), hsl(180 85% 45%), hsl(240 85% 60%), hsl(300 85% 55%), hsl(360 85% 55%))",
        }}
        {...drag((x) => pickHue(x))}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowUp")
            onChange({ ...current, h: (current.h + 6) % 360 });
          else if (e.key === "ArrowLeft" || e.key === "ArrowDown")
            onChange({ ...current, h: (current.h + 354) % 360 });
          else return;
          e.preventDefault();
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{
            left: `${(current.h / 360) * 100}%`,
            background: `hsl(${current.h} 85% 50%)`,
          }}
        />
      </div>
    </div>
  );
}
