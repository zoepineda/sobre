import type { Metadata } from "next";
import Link from "next/link";
import BrandChip from "@/components/BrandChip";
import LogoAnimated from "@/components/LogoAnimated";
import PageReveal from "@/components/motion/PageReveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sobre, envelope budgeting for PH wallets",
  description:
    "Every peso accounted for. Sort your money into envelopes across GCash, Maya, your banks, and your credit card.",
};

// Public landing page: what Sobre is and who it's for. Logged-out visits
// to / land here; everything routes to /login to get started.

const STEPS = [
  {
    icon: "lni-credit-card-multiple",
    title: "Add your accounts",
    body: "Banks, e-wallets, cash, and your credit card. Each becomes a card in Sobre, styled like the real thing.",
  },
  {
    icon: "lni-envelope-1",
    title: "Sort it into envelopes",
    body: "Envelopes work like categories, but they hold real money. Together they always equal your total cash, to the centavo.",
  },
  {
    icon: "lni-hand-taking-dollar",
    title: "One tap on payday",
    body: "Log payday fills every envelope with its planned amount, in the right account. Then just spend from envelopes.",
  },
];

const PERSONAS = [
  {
    icon: "lni-wallet-1",
    title: "The multi-wallet juggler",
    body: "GCash for deliveries, Maya for savings, a bank for bills. Sobre shows one total and exactly where each peso sits.",
  },
  {
    icon: "lni-calendar-days",
    title: "The paycheck planner",
    body: "You budget by cutoff, not by month. One tap on payday splits your sweldo into envelopes the way you planned it.",
  },
  {
    icon: "lni-credit-card-multiple",
    title: "The credit card flincher",
    body: "Swipe now, dread the statement later? Sobre reserves envelope money the moment you swipe, so payback is already set aside.",
  },
];

const BANKS = [
  { name: "GCash", type: "ewallet" },
  { name: "Maya", type: "ewallet" },
  { name: "BPI", type: "bank" },
  { name: "BDO", type: "bank" },
  { name: "GoTyme", type: "bank" },
  { name: "Tonik", type: "bank" },
  { name: "MariBank", type: "bank" },
  { name: "SeaBank", type: "bank" },
  { name: "CIMB", type: "bank" },
  { name: "UnionBank", type: "bank" },
];

export default function Welcome() {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-16 lg:px-8">
      <PageReveal className="space-y-16 lg:space-y-24">
        {/* header */}
        <header className="flex items-center justify-between pt-6">
          <LogoAnimated size={34} className="text-2xl" />
          <Button asChild variant="secondary" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        </header>

        {/* hero */}
        <section className="pt-2 text-center lg:pt-10">
          <h1 className="mx-auto max-w-3xl font-heading text-5xl font-black leading-[1.05] tracking-tight lg:text-7xl">
            Every peso{" "}
            <span className="relative inline-block">
              <span className="absolute inset-x-0 bottom-1 -z-10 h-4 bg-amber lg:bottom-2 lg:h-6" />
              accounted
            </span>{" "}
            for.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground lg:text-xl">
            Sobre is envelope budgeting built for the way we actually bank in
            the Philippines: money spread across e-wallets, banks, and a
            credit card that needs taming. Sort every peso into an envelope
            and always know what it&apos;s for.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/login">Get started, it&apos;s free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#tour">
                <i className="lni lni-play" aria-hidden /> Watch the 45-second
                tour
              </a>
            </Button>
          </div>
        </section>

        {/* tutorial video */}
        <section id="tour" className="scroll-mt-8">
          <div className="overflow-hidden rounded-2xl bg-pine shadow-xl">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src="/tutorial.mp4"
              controls
              playsInline
              preload="metadata"
              className="w-full"
            />
          </div>
        </section>

        {/* how it works */}
        <section>
          <h2 className="text-center font-heading text-3xl font-bold lg:text-4xl">
            How it works
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Card key={s.title} className="py-6 shadow-sm">
                <CardContent className="px-6">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-amber text-xl text-ink">
                    <i className={`lni ${s.icon}`} aria-hidden />
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-widest text-primary">
                    Step {i + 1}
                  </p>
                  <h3 className="mt-1 font-heading text-xl font-bold">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* who it's for */}
        <section>
          <h2 className="text-center font-heading text-3xl font-bold lg:text-4xl">
            Made for
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PERSONAS.map((p) => (
              <Card key={p.title} className="bg-secondary/40 py-6 shadow-sm">
                <CardContent className="px-6">
                  <i
                    className={`lni ${p.icon} text-3xl text-primary`}
                    aria-hidden
                  />
                  <h3 className="mt-3 font-heading text-xl font-bold">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* banks */}
        <section className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Plays nice with
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
            {BANKS.map((b) => (
              <span key={b.name} className="flex items-center gap-1.5">
                <BrandChip name={b.name} type={b.type} />
                <span className="text-sm text-muted-foreground">{b.name}</span>
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            ...and any bank, wallet, or cash stash you name.
          </p>
        </section>

        {/* closing CTA */}
        <section className="rounded-3xl bg-pine px-6 py-12 text-center text-white shadow-xl lg:py-16">
          <h2 className="font-heading text-3xl font-bold lg:text-4xl">
            Know where every peso lives.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">
            Free, private, and takes about five minutes to set up. Your money
            stays in your banks. Sobre just keeps the map.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-7 bg-amber text-ink hover:bg-amber/90"
          >
            <Link href="/login">Start budgeting →</Link>
          </Button>
        </section>

        <footer className="pb-2 text-center text-xs text-muted-foreground">
          Sobre · envelope in Tagalog · Every peso accounted for.
        </footer>
      </PageReveal>
    </main>
  );
}
