import React from "react";
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AMBER, BODY, HEADING, INK, MUTED, PAPER, PRIMARY } from "./brand";

/** Rise-in wrapper: springs up from below at `delay` frames. */
export const Rise: React.FC<{
  delay: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 16, mass: 0.8 } });
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [46, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** The real Sobre V2 mark with the full LogoAnimated storyboard, frame-exact:
 *    0ms  amber tile pops in (scale .6 → 1, springy)
 *  140ms  envelope + flap rise in
 *  340ms  left eye pops   440ms  right eye pops
 *  700ms  pupils glance left → right → settle
 * 1150ms  "Sobre" letters stagger up, 70ms apart               */
const SW = 3.2;
const POP = { stiffness: 420, damping: 17 };
const RISE_SPRING = { stiffness: 300, damping: 24 };

const Eye: React.FC<{ cx: number; open: number; pupilShift: number }> = ({
  cx,
  open,
  pupilShift,
}) => (
  <g transform={`translate(${cx} 19) scale(${open}) translate(${-cx} -19)`}>
    <circle cx={cx} cy={19} r={5.5} fill={PAPER} stroke={INK} strokeWidth={SW} />
    <circle cx={cx + pupilShift} cy={19.8} r={5.5 * 0.62} fill={INK} />
  </g>
);

export const SobreLogo: React.FC<{ size?: number; delay?: number }> = ({
  size = 96,
  delay = 0,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame() - delay;
  const sec = (s: number) => s * fps;
  const sp = (
    start: number,
    config: { stiffness: number; damping: number }
  ) => spring({ frame: frame - start, fps, config });

  const tile = sp(0, POP);
  const body = sp(sec(0.14), RISE_SPRING);
  const eyeL = sp(sec(0.34), POP);
  const eyeR = sp(sec(0.44), POP);

  // glance: left, right, settle (matches the app's keyframes/times)
  const g = sec(0.7);
  const glanceDur = sec(0.9);
  const pupilShift = interpolate(
    frame,
    [g, g + glanceDur * 0.25, g + glanceDur * 0.65, g + glanceDur],
    [-1.2, -2, 1.8, -1.2],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (t) => 0.5 - Math.cos(Math.PI * t) / 2,
    }
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.2 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        style={{
          transform: `scale(${interpolate(tile, [0, 1], [0.6, 1])})`,
          opacity: tile,
          filter: "drop-shadow(0 10px 26px rgba(26,29,36,0.2))",
        }}
      >
        <rect width="48" height="48" rx="10" fill={AMBER} />
        <g
          transform={`translate(0 ${interpolate(body, [0, 1], [6, 0])})`}
          opacity={body}
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
        </g>
        <Eye cx={17.75} open={eyeL} pupilShift={pupilShift} />
        <Eye cx={30.25} open={eyeR} pupilShift={pupilShift} />
      </svg>
      <div
        style={{
          fontFamily: HEADING,
          fontWeight: 900,
          letterSpacing: "-0.02em",
          fontSize: size * 0.72,
          color: INK,
          display: "flex",
        }}
      >
        {"Sobre".split("").map((ch, i) => {
          const p = sp(sec(1.15 + i * 0.07), POP);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [10, 0])}px)`,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Left rail: step number + title + subtitle. */
export const StepTitle: React.FC<{
  step: string;
  title: string;
  body: string;
}> = ({ step, title, body }) => (
  <div style={{ width: 640 }}>
    <Rise delay={4}>
      <div
        style={{
          fontFamily: BODY,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: 6,
          color: PRIMARY,
          textTransform: "uppercase",
        }}
      >
        {step}
      </div>
    </Rise>
    <Rise delay={9}>
      <div
        style={{
          fontFamily: HEADING,
          fontWeight: 700,
          fontSize: 76,
          lineHeight: 1.08,
          color: INK,
          marginTop: 18,
        }}
      >
        {title}
      </div>
    </Rise>
    <Rise delay={15}>
      <div
        style={{
          fontFamily: BODY,
          fontSize: 30,
          lineHeight: 1.45,
          color: MUTED,
          marginTop: 22,
        }}
      >
        {body}
      </div>
    </Rise>
  </div>
);

/** Mock bank account card with a real brand logo. */
export const BankCard: React.FC<{
  logo: string;
  gradient: string;
  type: string;
  amount: string;
  logoHeight?: number;
}> = ({ logo, gradient, type, amount, logoHeight = 34 }) => (
  <div
    style={{
      width: 400,
      aspectRatio: "8/5",
      borderRadius: 26,
      background: gradient,
      padding: 26,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      boxShadow: "0 14px 34px rgba(26,29,36,0.22)",
    }}
  >
    <Img
      src={staticFile(`brands/${logo}`)}
      style={{ height: logoHeight, width: "auto", alignSelf: "flex-start", objectFit: "contain" }}
    />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <div
        style={{
          width: 52,
          height: 38,
          borderRadius: 8,
          background: "#e7c873",
          opacity: 0.92,
        }}
      />
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontFamily: BODY,
            fontSize: 17,
            letterSpacing: 3,
            color: "rgba(255,255,255,0.7)",
            textTransform: "uppercase",
          }}
        >
          {type}
        </div>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 34, color: "#fff" }}>
          {amount}
        </div>
      </div>
    </div>
  </div>
);

/** Envelope row inside the mock panel. */
export const EnvelopeRow: React.FC<{
  name: string;
  amount: string;
  red?: boolean;
}> = ({ name, amount, red }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 28px",
      borderBottom: "1px solid rgba(26,29,36,0.08)",
      fontFamily: BODY,
    }}
  >
    <span style={{ fontSize: 27, color: INK }}>{name}</span>
    <span
      style={{
        fontSize: 27,
        fontWeight: 700,
        color: red ? "#c0392b" : INK,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {amount}
    </span>
  </div>
);

/** White app panel container. */
export const Panel: React.FC<{ children: React.ReactNode; width?: number }> = ({
  children,
  width = 560,
}) => (
  <div
    style={{
      width,
      background: "#fff",
      borderRadius: 24,
      boxShadow: "0 18px 44px rgba(26,29,36,0.14)",
      overflow: "hidden",
    }}
  >
    {children}
  </div>
);
