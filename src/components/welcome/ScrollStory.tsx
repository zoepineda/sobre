"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";
import { PINE, SHADER_DEFS, recolor, useMotionPrefs } from "@/lib/paperShaders";

// The tutorial video's scenes, rebuilt as scroll-driven sections: each
// slide fades and rises in as it enters the viewport (once), with its
// visual mock staggering in beside the copy.

const EASE = [...EASE_OUT] as [number, number, number, number];

const SLIDES = [
  {
    title: "Add your accounts",
    body: "Banks, e-wallets, cash, and yes, that credit card. Each one becomes a little card in Sobre, styled like the real thing in your pocket.",
  },
  {
    title: "Sort it into envelopes",
    body: "Think categories, but with real money inside. Your envelopes always add up to your total cash, down to the last centavo. Nothing hides.",
  },
  {
    title: "One tap on payday",
    body: "Sweldo day! One tap fills every envelope with its planned amount, in the right account. Budgeting done before your coffee cools.",
  },
  {
    title: "Spend without surprises",
    body: "Every expense comes straight out of its envelope. Swipe your card and Sobre quietly sets the payback money aside, so the statement never gets to scare you.",
  },
];

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion() ?? false;
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Counts up from 0 when scrolled into view (after an optional delay). */
function CountUp({
  to,
  start,
  delay = 0,
}: {
  to: number;
  start: boolean;
  delay?: number;
}) {
  const [v, setV] = useState(0);
  const reduced = useReducedMotion() ?? false;
  useEffect(() => {
    if (!start) return;
    if (reduced) return setV(to);
    const t0 = performance.now() + delay * 1000;
    const dur = 900;
    let raf: number;
    const tick = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - t0) / dur));
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, to, reduced, delay]);
  return (
    <>
      ₱
      {v.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </>
  );
}

const CARDS = [
  {
    logo: "maya.svg",
    bg: "linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 60%, #103324 100%)",
    type: "E-wallet",
    amount: "₱127,743.68",
    knockout: false,
  },
  {
    logo: "gcash-card.svg",
    bg: "linear-gradient(135deg, #0057d8 0%, #007dfe 60%, #2f9bff 100%)",
    type: "E-wallet",
    amount: "₱8,250.00",
    knockout: false,
  },
  {
    logo: "bpi-card.svg",
    bg: "linear-gradient(135deg, #7d0c10 0%, #b11116 55%, #d3252b 100%)",
    type: "Bank",
    amount: "₱42,180.55",
    knockout: false,
  },
];

const WARP = SHADER_DEFS.find((d) => d.name === "Warp")!;
const FILL = {
  position: "absolute" as const,
  inset: 0,
  width: "100%",
  height: "100%",
};

function BankStack() {
  const { reduced } = useMotionPrefs();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className="relative mx-auto h-[310px] w-[300px] sm:h-[330px] sm:w-[340px]">
      {CARDS.map((c, i) => (
        <Reveal
          key={c.logo}
          delay={i * 0.12}
          className="absolute left-1/2 w-[260px] -translate-x-1/2 sm:w-[290px]"
        >
          <div
            className="relative aspect-[8/5] overflow-hidden rounded-2xl p-5 shadow-xl"
            style={{
              background: c.bg,
              marginTop: i * 72,
              transform: `translateX(${(i - 1) * 18}px) rotate(${[-3, 1.5, -1.5][i]}deg)`,
            }}
          >
            {mounted && (
              <WARP.Comp
                style={FILL}
                {...recolor(
                  WARP.params,
                  c.bg.match(/#[0-9a-fA-F]{6}/g) ?? ["#26303c", "#3a4a5c"],
                  { still: reduced }
                )}
              />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/brands/${c.logo}`}
              alt=""
              className="relative h-6 w-auto"
            />
            <div className="relative mt-14 flex items-end justify-between text-white">
              <span className="text-[10px] uppercase tracking-widest opacity-70">
                {c.type}
              </span>
              <span className="text-lg font-bold">{c.amount}</span>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

const ENVELOPES = [
  ["Savings", 60000],
  ["Rent", 18000],
  ["Food Fund", 6500],
  ["Travel Fund", 25210.24],
  ["Wants Budget", 2480.12],
] as const;

// nugget flight timing: launch beat per row, flight time, landing = count start
const NUGGET = { first: 0.35, per: 0.38, flight: 0.55, top0: 112, step: 45 };

function EnvelopePanel({ counting }: { counting: boolean }) {
  const { reduced } = useMotionPrefs();
  const prefersReduced = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const landAt = (i: number) => NUGGET.first + i * NUGGET.per + NUGGET.flight;
  return (
    <div className="relative mx-auto w-full max-w-sm">
      {/* amber money-nuggets: fly from the total into their envelope rows */}
      {counting &&
        !prefersReduced &&
        ENVELOPES.map(([name, amount], i) => (
          <motion.div
            key={`nugget-${name}`}
            className="pointer-events-none absolute z-10 whitespace-nowrap rounded-full bg-amber px-3 py-1 text-xs font-bold text-ink shadow-md"
            initial={{ top: 40, left: "38%", opacity: 0 }}
            animate={{
              top: [40, NUGGET.top0 + i * NUGGET.step],
              left: ["38%", "68%"],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              delay: NUGGET.first + i * NUGGET.per,
              duration: NUGGET.flight,
              ease: "easeIn",
              opacity: { times: [0, 0.2, 0.85, 1], duration: NUGGET.flight },
            }}
          >
            ₱
            {amount.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </motion.div>
        ))}
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl bg-pine p-5 text-white shadow-lg">
          {mounted && (
            <WARP.Comp
              style={FILL}
              {...recolor(WARP.params, PINE, { still: reduced })}
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
          <div className="relative">
            <p className="text-[10px] uppercase tracking-widest opacity-70">
              Total cash
            </p>
            <p className="text-2xl font-bold">₱112,190.36</p>
          </div>
        </div>
      </Reveal>
      <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-lg">
        {ENVELOPES.map(([name, amount], i) => (
          <Reveal key={name} delay={0.12 + i * 0.09}>
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3 text-sm last:border-b-0">
              <span>{name}</span>
              <span className="font-semibold tabular-nums">
                <CountUp
                  to={amount}
                  start={counting}
                  delay={NUGGET.first + i * NUGGET.per + NUGGET.flight}
                />
              </span>
            </div>
          </Reveal>
        ))}
        <Reveal delay={landAt(4)}>
          <div className="bg-primary/5 px-5 py-3 text-xs text-muted-foreground">
            All 5 add up to ₱112,190.36. Every single time.
          </div>
        </Reveal>
      </div>
    </div>
  );
}

const PAYDAY_CONFETTI = ["#2f6f4f", "#ffb80a", "#1e4633", "#f6f6f4", "#2fdf75"];

function PaydayMock({ counting }: { counting: boolean }) {
  const [run, setRun] = useState(0);
  const replay = async (e: React.MouseEvent) => {
    setRun((n) => n + 1);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const confetti = (await import("canvas-confetti")).default;
    confetti({
      particleCount: 70,
      spread: 75,
      startVelocity: 32,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: PAYDAY_CONFETTI,
      disableForReducedMotion: true,
    });
  };
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4">
      <Reveal className="flex flex-col items-center gap-1.5">
        <motion.button
          type="button"
          onClick={replay}
          whileTap={{ scale: 0.93 }}
          className="cursor-pointer rounded-xl bg-primary px-9 py-3.5 text-lg font-bold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
        >
          Log payday
        </motion.button>
        <span className="text-xs text-muted-foreground">Tap it! You know you want to.</span>
      </Reveal>
      <div className="w-full overflow-hidden rounded-2xl bg-white shadow-lg">
        {(
          [
            ["Savings", 8000],
            ["Rent", 6000],
            ["Food Fund", 3500],
            ["Wants Budget", 1462],
          ] as const
        ).map(([name, amount], i) => (
          <Reveal key={name} delay={0.12 + i * 0.09}>
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3 text-sm last:border-b-0">
              <span>{name}</span>
              <span className="font-semibold text-primary tabular-nums">
                +
                <CountUp
                  key={run}
                  to={amount}
                  start={counting}
                  delay={i * 0.08}
                />
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function SpendMock() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <Reveal>
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-3 text-sm">
            <span>Food Fund · Jollibee</span>
            <span className="font-semibold text-destructive">-₱485.00</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3 text-sm">
            <span>Wants · Shopee</span>
            <span className="font-semibold text-destructive">-₱1,240.00</span>
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.18}>
        <div className="rounded-2xl bg-pine p-5 text-white shadow-lg">
          <p className="text-[10px] uppercase tracking-widest opacity-70">
            Envelopes owe card
          </p>
          <p className="text-2xl font-bold">
            ₱1,725.00{" "}
            <span className="text-sm font-normal opacity-75">
              reserved &amp; ready
            </span>
          </p>
        </div>
      </Reveal>
    </div>
  );
}

function Slide({
  index,
  visual,
}: {
  index: number;
  visual: (inView: boolean) => React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const s = SLIDES[index];
  const flip = index % 2 === 1;
  return (
    <div
      ref={ref}
      className={`grid items-center gap-10 md:grid-cols-2 md:gap-16 ${
        flip ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      <Reveal>
        <div className="flex items-start gap-5 lg:gap-8">
          <span
            aria-hidden
            className="-mt-2 font-heading text-6xl font-black text-amber lg:text-8xl"
            style={{ textShadow: "4px 4px 0 var(--color-ink)" }}
          >
            {index + 1}
          </span>
          <div className="pt-1">
            <h3 className="font-heading text-2xl font-bold lg:text-3xl">
              {s.title}
            </h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {s.body}
            </p>
          </div>
        </div>
      </Reveal>
      <div>{visual(inView)}</div>
    </div>
  );
}

export default function ScrollStory() {
  return (
    <div className="space-y-24 lg:space-y-36">
      <Slide index={0} visual={() => <BankStack />} />
      <Slide index={1} visual={(v) => <EnvelopePanel counting={v} />} />
      <Slide index={2} visual={(v) => <PaydayMock counting={v} />} />
      <Slide index={3} visual={() => <SpendMock />} />
    </div>
  );
}
