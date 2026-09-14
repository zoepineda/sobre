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
    body: "Banks, e-wallets, cash, and your credit card. Each becomes a card in Sobre, styled like the real thing.",
  },
  {
    title: "Sort it into envelopes",
    body: "Envelopes work like categories, but they hold real money. Together they always equal your total cash, to the centavo.",
  },
  {
    title: "One tap on payday",
    body: "Log payday fills every envelope with its planned amount, in the right account, all at once.",
  },
  {
    title: "Spend without surprises",
    body: "Expenses come out of their envelope. Card swipes reserve that envelope's cash for payback, so the bill is never a shock.",
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

/** Counts up from 0 when scrolled into view. */
function CountUp({ to, start }: { to: number; start: boolean }) {
  const [v, setV] = useState(0);
  const reduced = useReducedMotion() ?? false;
  useEffect(() => {
    if (!start) return;
    if (reduced) return setV(to);
    const t0 = performance.now();
    const dur = 900;
    let raf: number;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, to, reduced]);
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
    <div className="relative mx-auto h-[300px] w-[320px] sm:w-[360px]">
      {CARDS.map((c, i) => (
        <Reveal
          key={c.logo}
          delay={i * 0.12}
          className="absolute w-[260px] sm:w-[290px]"
        >
          <div
            className="relative aspect-[8/5] overflow-hidden rounded-2xl p-5 shadow-xl"
            style={{
              background: c.bg,
              marginTop: i * 62,
              marginLeft: i * 34,
              transform: `rotate(${[-2, 1.5, -1][i]}deg)`,
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

function EnvelopePanel({ counting }: { counting: boolean }) {
  const { reduced } = useMotionPrefs();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className="mx-auto w-full max-w-sm">
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
          <Reveal key={name} delay={0.15 + i * 0.09}>
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3 text-sm last:border-b-0">
              <span>{name}</span>
              <span className="font-semibold tabular-nums">
                <CountUp to={amount} start={counting} />
              </span>
            </div>
          </Reveal>
        ))}
        <Reveal delay={0.62}>
          <div className="bg-primary/5 px-5 py-3 text-xs text-muted-foreground">
            5 envelopes = ₱112,190.36. Always, to the centavo.
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function PaydayMock({ counting }: { counting: boolean }) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4">
      <Reveal>
        <div className="rounded-xl bg-primary px-9 py-3.5 text-lg font-bold text-white shadow-lg shadow-primary/30">
          Log payday
        </div>
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
                +<CountUp to={amount} start={counting} />
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
