"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import Logo from "@/components/Logo";
import LogoAnimated from "@/components/LogoAnimated";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

/* ─────────────────────────────────────────────────────────
 * LOGIN INTRO — ANIMATION STORYBOARD (tuned in /intro-lab)
 *
 *     0ms   logo storyboard plays at 2.1×, centered on screen
 *           (tile pop → eyes blink in → glance → letters)
 *  2050ms   storyboard done — hold a beat
 *  2350ms   logo springs into the card header (131/17/1.1)
 *  2690ms   login card rises in underneath (200/25/1)
 *
 * Reduced motion: skip straight to the settled layout.
 * ───────────────────────────────────────────────────────── */

const START_SCALE = 2.1;
const START_SCALE_MOBILE = 1.6; // phones get a gentler hero so it fits comfortably
const LOGO_DONE = 2.05; // s — let the logo's own storyboard finish
const HOLD_BEAT = 0.3; // s — beat of stillness before the dock
const CARD_DELAY = 0.34; // s — card trails the docking logo
const DOCK_SPRING = { type: "spring", stiffness: 131, damping: 17, mass: 1.1 } as const;
const CARD_SPRING = { type: "spring", stiffness: 200, damping: 25, mass: 1 } as const;
const SLOT = 40; // docked logo size
const HERO = 64; // centered logo size

export default function Login() {
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;

  // stage machine: center → dock (card enters alongside)
  const [stage, setStage] = useState<"center" | "dock">("center");
  const [settled, setSettled] = useState(false);
  const [startScale] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 640
      ? START_SCALE_MOBILE
      : START_SCALE
  );
  const [delta, setDelta] = useState<{ x: number; y: number } | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) {
      setStage("dock");
      setSettled(true);
      return;
    }
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
    }, (LOGO_DONE + HOLD_BEAT) * 1000);
    return () => clearTimeout(t);
  }, [reduced]);

  const docked = stage === "dock";

  // ── auth ──
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function google() {
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      setBusy(false);
      setError(error.message);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();
    const { data, error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) return setError(error.message);
    if (!data.session) {
      setMode("signin");
      setNotice(
        "Almost there! Check your email for the confirmation link, then come back and sign in."
      );
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      {/* the travelling brand: flies fixed, then hands off to the in-card logo */}
      {!settled && (
      <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center">
        <motion.div
          ref={heroRef}
          initial={false}
          animate={
            docked && delta
              ? { x: delta.x, y: delta.y, scale: SLOT / HERO }
              : { x: 0, y: 0, scale: reduced ? SLOT / HERO : startScale }
          }
          transition={reduced ? { duration: 0 } : DOCK_SPRING}
          onAnimationComplete={() => {
            if (docked && delta) setSettled(true);
          }}
        >
          <LogoAnimated size={HERO} className="text-3xl" />
        </motion.div>
      </div>
      )}

      <motion.div
        className="w-full max-w-sm"
        initial={reduced ? false : { opacity: 0, y: 28 }}
        animate={docked ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
        transition={
          reduced ? { duration: 0 } : { ...CARD_SPRING, delay: CARD_DELAY }
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
              disabled={busy}
              onClick={google}
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
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="password"
                  className="text-xs text-muted-foreground"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {notice && (
                <p className="rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
                  {notice}
                </p>
              )}
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy
                  ? "…"
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}
              </Button>
            </form>
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="mt-3 w-full text-center text-xs text-primary"
            >
              {mode === "signin"
                ? "First time? Create the account"
                : "Already set up? Sign in"}
            </button>
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Every peso accounted for.
        </p>
      </motion.div>
    </main>
  );
}
