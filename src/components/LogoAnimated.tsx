"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/* ─────────────────────────────────────────────────────────
 * SOBRE LOGO — ANIMATION STORYBOARD
 *
 *    0ms   amber tile pops in       (scale 0.6 → 1, springy)
 *  140ms   envelope + flap rise in  (y +6 → 0, fade)
 *  340ms   left eye pops            (scale 0 → 1, big bounce)
 *  440ms   right eye pops           (same, 100ms later)
 *  700ms   pupils glance left → right → settle
 * 1150ms   "sobre" letters stagger up (per-letter spring)
 * ─────────────────────────────────────────────────────────
 * Geometry mirrors Logo.tsx — keep the two in sync.        */

const TIMING = {
  tile: 0,
  body: 0.14,
  eyeL: 0.34,
  eyeR: 0.44,
  glance: 0.7,
  letters: 1.15,
  perLetter: 0.07,
};

const POP = { type: "spring", stiffness: 420, damping: 17 } as const;
const RISE = { type: "spring", stiffness: 300, damping: 24 } as const;

import Logo from "@/components/Logo";

function StaticLogo({ size, wordmark }: { size: number; wordmark: boolean }) {
  return <Logo size={size} wordmark={wordmark} className="" />;
}

const INK = "#1a1d24";
const EYE_FILL = "#f6f6f4";
const TILE = "#ffb80a";
const SW = 3.2;

function AnimatedEye({ cx, delay }: { cx: number; delay: number }) {
  const cy = 19;
  const r = 5.5;
  const pr = r * 0.62;
  return (
    <motion.g
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ ...POP, delay }}
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
    >
      <circle cx={cx} cy={cy} r={r} fill={EYE_FILL} stroke={INK} strokeWidth={SW} />
      {/* glance: left, right, settle */}
      <motion.circle
        cy={cy + 0.8}
        r={pr}
        fill={INK}
        initial={{ cx: cx - 1.2 }}
        animate={{ cx: [cx - 1.2, cx - 2, cx + 1.8, cx - 1.2] }}
        transition={{
          delay: TIMING.glance,
          duration: 0.9,
          times: [0, 0.25, 0.65, 1],
          ease: "easeInOut",
        }}
      />
    </motion.g>
  );
}

export default function LogoAnimated({
  size = 28,
  wordmark = true,
  className = "",
}: {
  size?: number;
  wordmark?: boolean;
  className?: string;
}) {
  // hovering the logo replays the whole sequence
  const [play, setPlay] = useState(0);
  const reduced = useReducedMotion() ?? false;
  if (reduced) {
    // no choreography: render the settled logo
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <StaticLogo size={size} wordmark={wordmark} />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 ${className}`}
      onMouseEnter={() => setPlay((n) => n + 1)}
    >
      <motion.svg
        key={play}
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...POP, delay: TIMING.tile }}
      >
        <rect width="48" height="48" rx="10" fill={TILE} />
        <motion.g
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...RISE, delay: TIMING.body }}
        >
          <path
            d="M9.2 21.4 Q8.6 20.2 10 19.9 L23.2 19.4 L38.2 19.8 Q39.6 19.8 39.7 21.2 L40.2 37.4 Q40.3 39.5 38.4 39.6 L10.4 40.2 Q8.6 40.2 8.5 38.4 Z"
            fill="none"
            stroke={INK}
            strokeWidth={SW}
            strokeLinejoin="round"
          />
          <path
            d="M9.6 21.2 L24 31 L39.3 20.8"
            stroke={INK}
            strokeWidth={SW}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </motion.g>
        <AnimatedEye cx={17.75} delay={TIMING.eyeL} />
        <AnimatedEye cx={30.25} delay={TIMING.eyeR} />
      </motion.svg>

      {wordmark && (
        <span
          key={`w-${play}`}
          className="font-heading font-black tracking-tight"
          style={{ fontSize: size * 0.72 }}
        >
          {"Sobre".split("").map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                ...POP,
                delay: TIMING.letters + i * TIMING.perLetter,
              }}
            >
              {ch}
            </motion.span>
          ))}
        </span>
      )}
    </span>
  );
}
