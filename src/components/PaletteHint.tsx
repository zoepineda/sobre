"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";

// One-time spotlight on the cash card's palette button, shown the first
// time a user lands on Home with accounts set up. Same spotlight language
// as the Setup tour: dim the page, cut a hole around the target.

const PAD = 6;

export default function PaletteHint({ userId }: { userId?: string }) {
  const key = `sobre-palette-hint-done:${userId ?? "anon"}`;
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(key)) return;
    // let the card (and its shader) settle before measuring
    const t = setTimeout(() => {
      if (document.querySelector('[data-hint="palette"]')) setOpen(true);
    }, 900);
    return () => clearTimeout(t);
  }, [key]);

  // follow the button while the hint is up (scroll, layout shifts)
  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const el = document.querySelector('[data-hint="palette"]');
      if (el) setRect(el.getBoundingClientRect());
    };
    measure();
    const timer = setInterval(measure, 150);
    return () => clearInterval(timer);
  }, [open]);

  const dismiss = () => {
    localStorage.setItem(key, "1");
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && rect && (
        <motion.div
          role="dialog"
          aria-label="Tip: card styles"
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            aria-hidden
            className="pointer-events-none fixed rounded-lg transition-all duration-150"
            style={{
              top: rect.top - PAD,
              left: rect.left - PAD,
              width: rect.width + PAD * 2,
              height: rect.height + PAD * 2,
              boxShadow: "0 0 0 9999px rgba(26, 29, 36, 0.62)",
            }}
          />
          <button
            type="button"
            aria-label="Dismiss tip"
            className="fixed inset-0 h-full w-full cursor-default"
            onClick={dismiss}
          />
          <div
            className="fixed z-10 mx-4 max-w-xs rounded-xl bg-card p-4 shadow-xl"
            style={{
              top: rect.bottom + PAD + 12,
              right: Math.max(16, window.innerWidth - rect.right - PAD - 4),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-heading text-base font-bold">Make it yours 🎨</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              This palette button restyles the Total-cash card and all your
              account cards with animated backgrounds.
            </p>
            <div className="mt-3 flex justify-end">
              <Button size="xs" onClick={dismiss}>
                Got it
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
