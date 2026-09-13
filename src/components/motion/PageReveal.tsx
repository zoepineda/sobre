"use client";

import { Children, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";

const EASE = [...EASE_OUT] as [number, number, number, number];

// Staggered page entrance: each direct child rises in as the page loads,
// so views feel alive without any layout change. The wrapper takes over
// the page's spacing classes; reduced motion renders statically.
export default function PageReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion() ?? false;
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <div className={className}>
      {Children.toArray(children).map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: Math.min(i * 0.07, 0.42),
            ease: EASE,
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
