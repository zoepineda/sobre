"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { DialRoot, useDialKitController } from "dialkit";
import "dialkit/styles.css";
import Logo from "@/components/Logo";
import LogoAnimated from "@/components/LogoAnimated";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ─────────────────────────────────────────────────────────
 * LOGIN INTRO — ANIMATION STORYBOARD
 *
 *    0ms   logo storyboard plays, large, centered on screen
 *          (tile pop → eyes blink in → glance → letters)
 * logoDone hold a beat, let the mascot land
 *  + hold  logo shrinks & glides into the card header (spring)
 *  + card  login card rises in underneath
 *
 * Every timing is live-tunable via the DialKit panel (dev
 * only). Reduced motion: skip straight to the end state.
 * ───────────────────────────────────────────────────────── */

const SLOT = 40; // logo size once docked in the card header

function toMotion(curve: { type: string; [k: string]: unknown }): Transition {
  return curve.type === "easing"
    ? {
        type: "tween",
        duration: curve.duration as number,
        ease: curve.ease as [number, number, number, number],
      }
    : (curve as unknown as Transition);
}

// Intro Lab — login-intro choreography playground. The card is a mock;
// nothing here authenticates. Tune with the DialKit panel, Replay to loop.
export default function IntroLab() {
  const reduced = useReducedMotion() ?? false;

  const dial = useDialKitController(
    "Login Intro",
    {
      startScale: [2.1, 1, 2.6, 0.05],
      logoDone: [2.05, 0.5, 4, 0.05],
      holdBeat: [0.3, 0, 1.5, 0.05],
      dockSpring: { type: "spring", stiffness: 131, damping: 17, mass: 1.1 },
      cardDelay: [0.34, 0, 1, 0.02],
      cardSpring: { type: "spring", stiffness: 200, damping: 25, mass: 1 },
      replay: { type: "action", label: "Replay intro" },
    },
    {
      id: "sobre-login-intro",
      onAction: () => setRun((n) => n + 1),
    }
  );
  const p = dial.values;

  // stage machine: center → dock (card enters alongside); `run` replays
  const [run, setRun] = useState(0);
  const [stage, setStage] = useState<"center" | "dock">("center");
  const [settled, setSettled] = useState(false);
  const [delta, setDelta] = useState<{ x: number; y: number } | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) {
      setStage("dock");
      setSettled(true);
      return;
    }
    setStage("center");
    setSettled(false);
    setDelta(null);
    const t = setTimeout(() => {
      const hero = heroRef.current?.getBoundingClientRect();
      const slot = slotRef.current?.getBoundingClientRect();
      if (hero && slot) {
        setDelta({
          x: slot.left + slot.width / 2 - (hero.left + hero.width / 2),
          // slot is measured while the card sits 28px low for its entrance
          y: slot.top + slot.height / 2 - (hero.top + hero.height / 2) - 28,
        });
      }
      setStage("dock");
    }, (p.logoDone + p.holdBeat) * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, reduced]);

  const docked = stage === "dock";

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <DialRoot position="top-right" />

      {/* the travelling brand: flies fixed, then hands off to the in-card logo */}
      {!settled && (
      <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center">
        <motion.div
          ref={heroRef}
          initial={false}
          animate={
            docked && delta
              ? { x: delta.x, y: delta.y, scale: SLOT / 64 }
              : { x: 0, y: 0, scale: reduced ? SLOT / 64 : p.startScale }
          }
          transition={reduced ? { duration: 0 } : toMotion(p.dockSpring)}
          onAnimationComplete={() => {
            if (docked && delta) setSettled(true);
          }}
        >
          <LogoAnimated key={`logo-${run}`} size={64} className="text-3xl" />
        </motion.div>
      </div>
      )}

      <motion.div
        className="w-full max-w-sm"
        initial={reduced ? false : { opacity: 0, y: 28 }}
        animate={docked ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
        transition={
          reduced
            ? { duration: 0 }
            : { ...toMotion(p.cardSpring), delay: p.cardDelay }
        }
      >
        <Card className="py-5 shadow-sm">
          <CardContent className="px-5">
            {/* landing slot for the brand — reserves the header space */}
            <div
              ref={slotRef}
              className="mx-auto mb-5 flex h-10 w-40 items-center justify-center"
            >
              {settled && <Logo size={40} className="text-xl" />}
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              disabled
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.1 3.7-8.6z"/>
                <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-6-2.1-6.9-5.1L1.2 17.2C3.2 21.2 7.3 24 12 24z"/>
                <path fill="#FBBC05" d="M5.1 14.3c-.3-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.2 6.8C.4 8.4 0 10.1 0 12s.4 3.6 1.2 5.2l3.9-2.9z"/>
                <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17 1.1 15.2 0 12 0 7.3 0 3.2 2.8 1.2 6.8l3.9 2.9c1-3 3.7-5 6.9-5z"/>
              </svg>
              Continue with Google
            </Button>
            <div className="my-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                or
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <form className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs text-muted-foreground">
                  Email
                </Label>
                <Input id="email" type="email" disabled placeholder="you@example.com" />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="password"
                  className="text-xs text-muted-foreground"
                >
                  Password
                </Label>
                <Input id="password" type="password" disabled />
              </div>
              <Button type="button" size="lg" className="w-full" disabled>
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Every peso accounted for.
        </p>
      </motion.div>
    </main>
  );
}
