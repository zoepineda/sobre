// Sound-effects preference (per user, on-device, default on) plus a tiny
// play helper. Sounds come from cuelume: synthesized WebAudio, no files.
import type { SoundName } from "cuelume";

export function soundKey(userId?: string) {
  return `sobre-sounds:${userId ?? "anon"}`;
}

export function soundsEnabled(userId?: string) {
  return localStorage.getItem(soundKey(userId)) !== "0";
}

export function setSoundsEnabled(userId: string | undefined, on: boolean) {
  localStorage.setItem(soundKey(userId), on ? "1" : "0");
}

/** Play a UI sound if the user hasn't turned sounds off. Fire-and-forget. */
export function playSound(
  name: SoundName,
  userId?: string,
  volume?: number
) {
  if (!soundsEnabled(userId)) return;
  import("cuelume")
    .then(({ play }) => play(name, volume === undefined ? undefined : { volume }))
    .catch(() => {});
}
