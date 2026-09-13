import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BODY,
  CONFETTI,
  HEADING,
  INK,
  MUTED,
  PAPER,
  PINE,
  PRIMARY,
} from "./brand";
import {
  BankCard,
  EnvelopeRow,
  Panel,
  Rise,
  SobreLogo,
  StepTitle,
} from "./components";

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: PAPER }}>{children}</AbsoluteFill>
);

const SideBySide: React.FC<{ left: React.ReactNode; right: React.ReactNode }> = ({
  left,
  right,
}) => (
  <AbsoluteFill
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 140,
      padding: 90,
    }}
  >
    {left}
    {right}
  </AbsoluteFill>
);

/** Scene fade-out helper for the last 12 frames of a sequence. */
const useFadeOut = (duration: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [duration - 12, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

// ── 1. Intro ──
export const Intro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tag = spring({ frame: frame - 34, fps, config: { damping: 15 } });
  return (
    <Stage>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 44,
          opacity: useFadeOut(duration),
        }}
      >
        <SobreLogo size={170} delay={5} />
        <div
          style={{
            fontFamily: BODY,
            fontSize: 38,
            color: MUTED,
            opacity: tag,
            transform: `translateY(${interpolate(tag, [0, 1], [26, 0])}px)`,
          }}
        >
          Every peso, spoken for.
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

// ── 2. Accounts ──
export const Accounts: React.FC<{ duration: number }> = ({ duration }) => {
  return (
    <Stage>
      <AbsoluteFill style={{ opacity: useFadeOut(duration) }}>
        <SideBySide
          left={
            <StepTitle
              step="Step 1"
              title="Add your accounts"
              body="Banks, e-wallets, cash, and your credit card. Each one gets its own card, styled like the real thing."
            />
          }
          right={
            <div style={{ display: "flex", flexDirection: "column", gap: -60 }}>
              <Rise delay={12}>
                <BankCard
                  logo="maya.svg"
                  gradient="linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 60%, #103324 100%)"
                  type="E-wallet"
                  amount="₱127,743.68"
                />
              </Rise>
              <Rise delay={20} style={{ marginTop: -96, marginLeft: 90 }}>
                <BankCard
                  logo="gcash-card.svg"
                  gradient="linear-gradient(135deg, #0057d8 0%, #007dfe 60%, #2f9bff 100%)"
                  type="E-wallet"
                  amount="₱8,250.00"
                />
              </Rise>
              <Rise delay={28} style={{ marginTop: -96, marginLeft: 180 }}>
                <BankCard
                  logo="bpi-card.svg"
                  gradient="linear-gradient(135deg, #7d0c10 0%, #b11116 55%, #d3252b 100%)"
                  type="Bank"
                  amount="₱42,180.55"
                  logoHeight={44}
                />
              </Rise>
            </div>
          }
        />
      </AbsoluteFill>
    </Stage>
  );
};

// ── 3. Envelopes ──
export const Envelopes: React.FC<{ duration: number }> = ({ duration }) => {
  const rows = [
    ["Savings", "₱60,000.00"],
    ["Rent", "₱18,000.00"],
    ["Food Fund", "₱6,500.00"],
    ["Travel Fund", "₱25,210.24"],
    ["Wants Budget", "₱2,480.12"],
  ] as const;
  return (
    <Stage>
      <AbsoluteFill style={{ opacity: useFadeOut(duration) }}>
        <SideBySide
          left={
            <StepTitle
              step="Step 2"
              title="Sort it into envelopes"
              body="Every peso you have gets a job. Envelopes always add up to exactly your total cash, so nothing hides."
            />
          }
          right={
            <Panel>
              <div
                style={{
                  padding: "22px 28px",
                  fontFamily: BODY,
                  fontWeight: 700,
                  fontSize: 22,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: MUTED,
                }}
              >
                Envelopes
              </div>
              {rows.map(([name, amount], i) => (
                <Rise key={name} delay={10 + i * 7}>
                  <EnvelopeRow name={name} amount={amount} />
                </Rise>
              ))}
            </Panel>
          }
        />
      </AbsoluteFill>
    </Stage>
  );
};

// ── 4. Payday (with confetti) ──
export const Payday: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const press = spring({ frame: frame - 26, fps, config: { damping: 11 } });
  const burstAt = 34;
  const count = (target: number) =>
    Math.round(
      interpolate(frame, [burstAt, burstAt + 34], [0, target], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    ).toLocaleString("en-PH");

  const confetti = new Array(90).fill(0).map((_, i) => {
    const t = frame - burstAt;
    if (t < 0) return null;
    const angle = random(`a${i}`) * Math.PI * 2;
    const speed = 14 + random(`s${i}`) * 22;
    const x = Math.cos(angle) * speed * t;
    const y = Math.sin(angle) * speed * t * 0.7 + 0.5 * 0.9 * t * t;
    const rot = random(`r${i}`) * 360 + t * (6 + random(`w${i}`) * 8);
    const life = interpolate(t, [0, 55], [1, 0], {
      extrapolateRight: "clamp",
    });
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: "50%",
          top: "42%",
          width: 16,
          height: 10 + random(`h${i}`) * 10,
          background: CONFETTI[i % CONFETTI.length],
          transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`,
          opacity: life,
          borderRadius: 3,
        }}
      />
    );
  });

  return (
    <Stage>
      <AbsoluteFill style={{ opacity: useFadeOut(duration) }}>
        <SideBySide
          left={
            <StepTitle
              step="Step 3"
              title="One tap on payday"
              body="Log payday fills every envelope with its planned amount, in the right account, all at once."
            />
          }
          right={
            <div style={{ display: "flex", flexDirection: "column", gap: 34, alignItems: "center" }}>
              <Rise delay={8}>
                <div
                  style={{
                    fontFamily: BODY,
                    fontWeight: 700,
                    fontSize: 34,
                    color: "#fff",
                    background: PRIMARY,
                    borderRadius: 18,
                    padding: "26px 66px",
                    boxShadow: "0 14px 30px rgba(47,111,79,0.4)",
                    transform: `scale(${interpolate(press, [0, 0.5, 1], [1, 0.93, 1])})`,
                  }}
                >
                  Log payday
                </div>
              </Rise>
              <Panel width={520}>
                <EnvelopeRow name="Savings" amount={`₱${count(8000)}.00`} />
                <EnvelopeRow name="Rent" amount={`₱${count(6000)}.00`} />
                <EnvelopeRow name="Food Fund" amount={`₱${count(3500)}.00`} />
                <EnvelopeRow name="Wants Budget" amount={`₱${count(1462)}.00`} />
              </Panel>
            </div>
          }
        />
        {confetti}
      </AbsoluteFill>
    </Stage>
  );
};

// ── 5. Spend & card tracking ──
export const Spend: React.FC<{ duration: number }> = ({ duration }) => {
  return (
    <Stage>
      <AbsoluteFill style={{ opacity: useFadeOut(duration) }}>
        <SideBySide
          left={
            <StepTitle
              step="Step 4"
              title="Spend without surprises"
              body="Expenses come out of their envelope. Swipe your credit card, and Sobre reserves that envelope's cash for payback, so the bill is never a shock."
            />
          }
          right={
            <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
              <Rise delay={10}>
                <Panel width={560}>
                  <EnvelopeRow name="Food Fund · Jollibee" amount="-₱485.00" red />
                  <EnvelopeRow name="Wants · Shopee" amount="-₱1,240.00" red />
                </Panel>
              </Rise>
              <Rise delay={22}>
                <div
                  style={{
                    width: 560,
                    borderRadius: 24,
                    background: PINE,
                    color: "#fff",
                    padding: "30px 34px",
                    fontFamily: BODY,
                    boxShadow: "0 18px 44px rgba(26,29,36,0.24)",
                  }}
                >
                  <div style={{ fontSize: 22, opacity: 0.7, letterSpacing: 3, textTransform: "uppercase" }}>
                    Envelopes owe card
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 46, marginTop: 8 }}>
                    ₱1,725.00 <span style={{ fontSize: 26, fontWeight: 400, opacity: 0.75 }}>reserved &amp; ready</span>
                  </div>
                </div>
              </Rise>
            </div>
          }
        />
      </AbsoluteFill>
    </Stage>
  );
};

// ── 6. Outro ──
export const Outro: React.FC<{ duration: number }> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const url = spring({ frame: frame - 30, fps, config: { damping: 15 } });
  return (
    <Stage>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 40,
        }}
      >
        <SobreLogo size={150} delay={4} />
        <div
          style={{
            fontFamily: HEADING,
            fontSize: 52,
            fontWeight: 700,
            color: INK,
            opacity: url,
          }}
        >
          Every peso, spoken for.
        </div>
        <div
          style={{
            fontFamily: BODY,
            fontSize: 32,
            color: "#fff",
            background: INK,
            borderRadius: 100,
            padding: "18px 44px",
            opacity: url,
            transform: `translateY(${interpolate(url, [0, 1], [24, 0])}px)`,
          }}
        >
          sobre-finance.vercel.app
        </div>
      </AbsoluteFill>
    </Stage>
  );
};
