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
