import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const fraunces = loadFraunces();
const inter = loadInter();

export const HEADING = fraunces.fontFamily;
export const BODY = inter.fontFamily;

// Sobre brand tokens (mirrors src/app/globals.css in the app)
export const PAPER = "#f6f6f4";
export const INK = "#1a1d24";
export const PINE = "#1e4633";
export const PRIMARY = "#2f6f4f";
export const AMBER = "#ffb80a";
export const MUTED = "#6b7280";
export const RED = "#c0392b";
export const GREEN = "#2f6f4f";

export const CONFETTI = ["#2f6f4f", "#ffb80a", "#1e4633", "#f6f6f4", "#2fdf75"];
