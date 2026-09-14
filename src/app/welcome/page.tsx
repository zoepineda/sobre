import type { Metadata } from "next";
import Link from "next/link";
import BrandChip from "@/components/BrandChip";
import LogoAnimated from "@/components/LogoAnimated";
import SectionReveal from "@/components/motion/SectionReveal";
import ScrollStory from "@/components/welcome/ScrollStory";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sobre, envelope budgeting for PH wallets",
  description:
    "Every peso accounted for. Sort your money into envelopes across GCash, Maya, your banks, and your credit card.",
};

// Public landing page: what Sobre is and who it's for. Logged-out visits
// to / land here; everything routes to /login to get started.

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

// The logo's own wobbly envelope, cropped out of the 48-grid mark, with a
// paper body and the persona's icon peeking over the rim like the eyes do.
function PersonaEnvelope({ icon, tilt }: { icon: string; tilt: number }) {
  return (
    <div
      className="relative inline-block"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <i
        className={`lni ${icon} absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-3xl text-primary`}
        aria-hidden
      />
      <svg width="104" height="70" viewBox="7.5 18.5 34 23" fill="none" aria-hidden>
        <path
          d="M9.2 21.4 Q8.6 20.2 10 19.9 L23.2 19.4 L38.2 19.8 Q39.6 19.8 39.7 21.2 L40.2 37.4 Q40.3 39.5 38.4 39.6 L10.4 40.2 Q8.6 40.2 8.5 38.4 Z"
          fill="#fff"
          stroke="#1a1d24"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9.6 21.2 L24 31 L39.3 20.8"
          stroke="#1a1d24"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

const CONTAINER = "mx-auto max-w-5xl px-5 lg:px-8";

export default function Welcome() {
  return (
    <main>
      {/* paper band: header + hero */}
      <div className={CONTAINER}>
        <header className="flex items-center justify-between pt-6">
          <LogoAnimated size={34} className="text-2xl" />
          <Button asChild variant="secondary" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        </header>

        <SectionReveal>
          <section className="pb-20 pt-14 text-center lg:pb-28 lg:pt-20">
            <h1 className="mx-auto max-w-3xl font-heading text-[2.6rem] font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl">
              Every peso{" "}
              <span className="relative inline-block">
                <span className="absolute inset-x-0 bottom-1 -z-10 h-4 bg-amber lg:bottom-2 lg:h-6" />
                accounted
              </span>{" "}
              for.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground lg:text-xl">
              Sobre is envelope budgeting for how we actually bank in the
              Philippines: money scattered across e-wallets, banks, and a
              credit card that needs a little taming. Give every peso its own
              envelope and always know exactly what it&apos;s for.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/login">Get started, it&apos;s free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#how">Show me how ↓</a>
              </Button>
            </div>
          </section>
        </SectionReveal>
      </div>

      {/* white band: the tour */}
      <section id="how" className="scroll-mt-10 border-y border-border/50 bg-white">
        <div className={`${CONTAINER} py-16 lg:py-24`}>
          <SectionReveal>
            <h2 className="font-heading text-3xl font-bold lg:text-4xl">
              How it works
            </h2>
          </SectionReveal>
          <div className="mt-14">
            <ScrollStory />
          </div>
        </div>
      </section>

      {/* amber band: who it's for */}
      <section className="bg-amber-soft">
        <div className={`${CONTAINER} py-16 lg:py-24`}>
          <SectionReveal>
            <h2 className="text-center font-heading text-3xl font-bold lg:text-4xl">
              Made for
            </h2>
            <div className="mt-14 flex flex-col items-center gap-14 md:flex-row md:items-start md:justify-center md:gap-8">
              {PERSONAS.map((p, i) => (
                <div
                  key={p.title}
                  className={`max-w-xs text-center ${i === 1 ? "md:mt-10" : ""}`}
                >
                  <PersonaEnvelope icon={p.icon} tilt={[-3, 2, -2][i]} />
                  <h3 className="mt-4 font-heading text-xl font-bold">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-amber-ink/80">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* paper band: banks */}
      <section>
        <div className={`${CONTAINER} py-16 text-center lg:py-20`}>
          <SectionReveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Plays nice with
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
              {BANKS.map((b) => (
                <span key={b.name} className="flex items-center gap-1.5">
                  <BrandChip name={b.name} type={b.type} />
                  <span className="text-sm text-muted-foreground">
                    {b.name}
                  </span>
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              ...and any bank, wallet, or cash stash you name.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* pine band: closing CTA + footer */}
      <section className="bg-pine text-white">
        <div className={`${CONTAINER} py-16 text-center lg:py-20`}>
          <SectionReveal>
            <h2 className="font-heading text-3xl font-bold lg:text-4xl">
              Know where every peso lives.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/75">
              Free, private, and set up in about five minutes. Your money stays
              right where it is. Sobre just keeps the map, and throws a little
              confetti when you get paid.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-7 bg-amber text-ink hover:bg-amber/90"
            >
              <Link href="/login">Start budgeting →</Link>
            </Button>
          </SectionReveal>
          <footer className="mt-14 text-center text-xs text-white/50">
            Sobre means envelope in Tagalog 💌 Every peso accounted for.
          </footer>
        </div>
      </section>
    </main>
  );
}
