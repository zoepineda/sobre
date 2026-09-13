"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";

// Spotlight onboarding for the Setup page. Dims the page, cuts a hole
// around each section, and explains it. Auto-runs once (localStorage),
// replayable via the "Tour" button next to the page title.

const STEPS: { target: string | null; title: string; body: string }[] = [
  {
    target: null,
    title: "Welcome to Sobre 💌",
    body: "Sobre is envelope budgeting: every peso you have is assigned to a purpose. This quick tour shows what each piece here means.",
  },
  {
    target: "accounts",
    title: "Accounts",
    body: "Where your money physically lives — banks, e-wallets, cash, and your credit card. One account can hold money belonging to many envelopes. Drag rows to reorder them everywhere.",
  },
  {
    target: "groups",
    title: "Envelope groups",
    body: "Big buckets that organize your envelopes — like Savings, Wants, or Needs. On Home they collapse to one line each, so lots of envelopes stay tidy.",
  },
  {
    target: "envelopes",
    title: "Envelopes",
    body: "The heart of the system. Each envelope has a running balance, a group, and a payday plan: how much goes in each cutoff, and into which account. Spending from an envelope on your credit card reserves its money for payback.",
  },
  {
    target: "bills",
    title: "Recurring bills",
    body: "Bills you pay every month become a checklist on Home. Ticking one logs the expense from the right account and envelope automatically — no double entry. That's the tour! Log income on the Income page and tap “Log payday” to fill every envelope in one go. (Psst: the palette button on the Total-cash card restyles your cards.)",
  },
];

const PAD = 8;

export default function SetupTour({ userId }: { userId?: string }) {
  const [step, setStep] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const reduced = useReducedMotion() ?? false;

  // per-user done flag — a second account on the same browser still gets
  // its own first-run tour
  const doneKey = `sobre-setup-tour-done:${userId ?? "anon"}`;

  // auto-start on first visit
  useEffect(() => {
    if (!localStorage.getItem(doneKey)) setStep(0);
  }, [doneKey]);

  const finish = useCallback(() => {
    localStorage.setItem(doneKey, "1");
    setStep(-1);
  }, [doneKey]);

  // measure + follow the current target
  useEffect(() => {
    if (step < 0) return;
    const target = STEPS[step].target;
    if (!target) {
      setRect(null);
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      return;
    }
    const el = document.querySelector(`[data-tour="${target}"]`);
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "center",
    });
    const measure = () => setRect(el.getBoundingClientRect());
    const timer = setInterval(measure, 120);
    return () => clearInterval(timer);
  }, [step, reduced]);

  useEffect(() => {
    if (step < 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight" || e.key === "Enter")
        setStep((s) => (s >= STEPS.length - 1 ? (finish(), -1) : s + 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(0, s - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, finish]);

  const open = step >= 0;
  const current = open ? STEPS[step] : null;
  const last = step === STEPS.length - 1;

  // tooltip placement: under the spotlight when there's room, else above
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const below = rect ? rect.bottom + PAD + 16 : 0;
  const tooltipTop = rect
    ? below + 220 < vh
      ? below
      : Math.max(16, rect.top - PAD - 230)
    : undefined;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="text-muted-foreground"
        onClick={() => setStep(0)}
      >
        <i className="lni lni-question-mark-circle" aria-hidden /> Tour
      </Button>

      <AnimatePresence>
        {open && current && (
          <motion.div
            key="tour"
            role="dialog"
            aria-modal="true"
            aria-label={`Setup tour: ${current.title}`}
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* dim layer with a cutout around the target */}
            {rect ? (
              <div
                aria-hidden
                className="pointer-events-none fixed rounded-xl transition-all duration-300"
                style={{
                  top: rect.top - PAD,
                  left: rect.left - PAD,
                  width: rect.width + PAD * 2,
                  height: rect.height + PAD * 2,
                  boxShadow: "0 0 0 9999px rgba(26, 29, 36, 0.62)",
                }}
              />
            ) : (
              <div aria-hidden className="fixed inset-0 bg-[rgba(26,29,36,0.62)]" />
            )}

            {/* click-catcher: tap anywhere advances */}
            <button
              type="button"
              aria-label="Next step"
              className="fixed inset-0 h-full w-full cursor-default"
              onClick={() => (last ? finish() : setStep(step + 1))}
            />

            {/* tooltip card */}
            <motion.div
              key={step}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed z-10 mx-4 max-w-sm rounded-xl bg-card p-4 shadow-xl"
              style={
                rect
                  ? { top: tooltipTop, left: Math.min(Math.max(16, rect.left), Math.max(16, window.innerWidth - 400)) }
                  : { top: "50%", left: "50%", transform: "translate(-50%, -50%)", margin: 0 }
              }
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-heading text-base font-bold">{current.title}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{current.body}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  {step + 1} / {STEPS.length}
                </p>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="xs" onClick={finish}>
                    Skip
                  </Button>
                  {step > 0 && (
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => setStep(step - 1)}
                    >
                      Back
                    </Button>
                  )}
                  <Button size="xs" onClick={() => (last ? finish() : setStep(step + 1))}>
                    {last ? "Done" : "Next"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
