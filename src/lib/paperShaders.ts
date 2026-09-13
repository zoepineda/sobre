"use client";

import { useEffect, useState } from "react";
import {
  MeshGradient,
  SimplexNoise,
  StaticMeshGradient,
  Warp,
  meshGradientPresets,
  simplexNoisePresets,
  staticMeshGradientPresets,
  warpPresets,
} from "@paper-design/shaders-react";

export const PINE = ["#2f6f4f", "#1e4633", "#4fa878", "#0d241a", "#67b08c"];

export type ShaderDef = {
  name: string;
  Comp: React.ComponentType<Record<string, unknown>>;
  params: Record<string, unknown>;
};

// The curated set. "Plain" (no shader) is handled by picking a name
// that doesn't match any of these.
export const SHADER_DEFS: ShaderDef[] = [
  {
    name: "Mesh Gradient",
    Comp: MeshGradient as ShaderDef["Comp"],
    params: meshGradientPresets[0].params as Record<string, unknown>,
  },
  {
    name: "Simplex Noise",
    Comp: SimplexNoise as ShaderDef["Comp"],
    params: simplexNoisePresets[0].params as Record<string, unknown>,
  },
  {
    name: "Static Mesh Gradient",
    Comp: StaticMeshGradient as ShaderDef["Comp"],
    params: staticMeshGradientPresets[0].params as Record<string, unknown>,
  },
  {
    name: "Warp",
    Comp: Warp as ShaderDef["Comp"],
    params: warpPresets[0].params as Record<string, unknown>,
  },
];

export const PLAIN = "Plain";
export const SHADER_CHOICES = [...SHADER_DEFS.map((d) => d.name), PLAIN];

// Recolor a shader's default preset into an arbitrary palette
// (darkest palette color becomes the background).
// Reduced-motion / coarse-pointer awareness: shaders render a still frame
// (speed 0) instead of animating when the user or device asks for calm.
export function useMotionPrefs() {
  const [prefs, setPrefs] = useState({ reduced: false, coarse: false });
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(pointer: coarse)");
    const update = () =>
      setPrefs({ reduced: reduced.matches, coarse: coarse.matches });
    update();
    reduced.addEventListener("change", update);
    coarse.addEventListener("change", update);
    return () => {
      reduced.removeEventListener("change", update);
      coarse.removeEventListener("change", update);
    };
  }, []);
  return prefs;
}

export function recolor(
  params: Record<string, unknown>,
  palette: string[],
  opts?: { still?: boolean }
): Record<string, unknown> {
  const lum = (hex: string) =>
    parseInt(hex.slice(1, 3), 16) +
    parseInt(hex.slice(3, 5), 16) +
    parseInt(hex.slice(5, 7), 16);
  const darkest = [...palette].sort((a, b) => lum(a) - lum(b))[0];
  const out: Record<string, unknown> = {};
  let i = 0;
  for (const [key, value] of Object.entries(params)) {
    if (key === "frame") continue;
    if (key === "speed") {
      out.speed = opts?.still ? 0 : Math.min(Number(value) || 0.4, 0.4);
    } else if (key === "colors" && Array.isArray(value)) {
      out.colors = value.map((_, idx) => palette[idx % palette.length]);
    } else if (/^color/i.test(key) && typeof value === "string") {
      out[key] = key.toLowerCase().includes("back")
        ? darkest
        : palette[i++ % palette.length];
    } else {
      out[key] = value;
    }
  }
  return out;
}

// Shared shader choice: persisted in localStorage, broadcast across components.
const KEY = "cash-shader-name";
const EVENT = "shader-choice-change";
const DEFAULT = "Mesh Gradient";

function normalize(name: string | null): string {
  return name && SHADER_CHOICES.includes(name) ? name : DEFAULT;
}

export function setShaderChoice(name: string) {
  localStorage.setItem(KEY, name);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: name }));
}

export function useShaderChoice(): string {
  const [choice, setChoice] = useState(DEFAULT);
  useEffect(() => {
    setChoice(normalize(localStorage.getItem(KEY)));
    const onChange = (e: Event) =>
      setChoice(normalize((e as CustomEvent<string>).detail));
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);
  return choice;
}

// ── custom cash-card color ──
// null = the default Pine palette. A picked color becomes the card base,
// and the rest of the palette (mid / light / darkest / lighter) is derived
// with the same relationships as the pine original, so shaders and white
// text keep working at any hue.
export type CashColor = { h: number; s: number; l: number };

const COLOR_KEY = "cash-color";
const COLOR_EVENT = "cash-color-change";
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export function hslToHex(h: number, s: number, l: number): string {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function paletteFromColor(c: CashColor): string[] {
  const { h, s } = c;
  // base lightness clamped so white text on the card stays readable
  const l = clamp(c.l, 6, 62);
  return [
    hslToHex(h, s, clamp(l + 11, 0, 78)), // mid
    hslToHex(h, s, l), // card base
    hslToHex(h, clamp(s * 0.85, 0, 100), clamp(l + 28, 0, 86)), // light
    hslToHex(h, clamp(s * 1.18, 0, 100), clamp(l - 10, 4, 100)), // darkest
    hslToHex(h, clamp(s * 0.8, 0, 100), clamp(l + 35, 0, 92)), // lighter
  ];
}

export function setCashColor(c: CashColor | null) {
  if (c === null) localStorage.removeItem(COLOR_KEY);
  else
    localStorage.setItem(
      COLOR_KEY,
      `${Math.round(c.h)},${Math.round(c.s)},${Math.round(c.l)}`
    );
  window.dispatchEvent(new CustomEvent(COLOR_EVENT, { detail: c }));
}

function parseColor(stored: string | null): CashColor | null {
  if (!stored) return null;
  const [h, s, l] = stored.split(",").map(Number);
  return [h, s, l].every(Number.isFinite) ? { h, s, l } : null;
}

export function useCashColor(): CashColor | null {
  const [color, setColor] = useState<CashColor | null>(null);
  useEffect(() => {
    // migrate the short-lived hue-only format
    const oldHue = localStorage.getItem("cash-hue");
    if (oldHue !== null && localStorage.getItem(COLOR_KEY) === null) {
      localStorage.setItem(COLOR_KEY, `${Number(oldHue)},40,20`);
      localStorage.removeItem("cash-hue");
    }
    setColor(parseColor(localStorage.getItem(COLOR_KEY)));
    const onChange = (e: Event) =>
      setColor((e as CustomEvent<CashColor | null>).detail);
    window.addEventListener(COLOR_EVENT, onChange);
    return () => window.removeEventListener(COLOR_EVENT, onChange);
  }, []);
  return color;
}

/** Active cash-card palette: custom color when set, Pine otherwise. */
export function useCashPalette(): string[] {
  const color = useCashColor();
  return color === null ? PINE : paletteFromColor(color);
}
