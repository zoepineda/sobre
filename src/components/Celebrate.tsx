"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "motion/react";
import { confettiEnabled } from "@/lib/confettiPref";

// Fires a confetti volley when the page loads with ?celebrate=1 (set by the
// income actions), then strips the param so refreshes stay quiet. Skipped
// when the user turned it off in Setup, or prefers reduced motion.

const BRAND = ["#2f6f4f", "#ffb80a", "#1e4633", "#f6f6f4", "#2fdf75"];

export default function Celebrate({ userId }: { userId?: string }) {
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    (async () => {
      if (!reduced && confettiEnabled(userId)) {
        const confetti = (await import("canvas-confetti")).default;
        // center pop, then two side cannons
        confetti({
          particleCount: 90,
          spread: 75,
          startVelocity: 42,
          origin: { x: 0.5, y: 0.35 },
          colors: BRAND,
          disableForReducedMotion: true,
        });
        setTimeout(() => {
          confetti({
            particleCount: 45,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors: BRAND,
            disableForReducedMotion: true,
          });
          confetti({
            particleCount: 45,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors: BRAND,
            disableForReducedMotion: true,
          });
        }, 180);
      }
      router.replace("/", { scroll: false });
    })();
  }, [reduced, userId, router]);

  return null;
}
