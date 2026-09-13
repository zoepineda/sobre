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

/** The Sobre mark: amber tile, peeking eyes, wordmark. */
export const SobreLogo: React.FC<{ size?: number; delay?: number }> = ({
  size = 96,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - delay, fps, config: { damping: 12 } });
  const eyes = spring({ frame: frame - delay - 8, fps, config: { damping: 14 } });
  const eye = (x: number) => (
    <div
      style={{
        position: "absolute",
        top: size * 0.3,
        left: x,
        width: size * 0.22,
        height: size * 0.3,
        borderRadius: "50%",
        background: PAPER,
        border: `${size * 0.045}px solid ${INK}`,
        transform: `scaleY(${eyes})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: size * 0.03,
          left: "50%",
          transform: "translateX(-50%)",
          width: size * 0.09,
          height: size * 0.09,
          borderRadius: "50%",
          background: INK,
        }}
      />
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.28 }}>
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: size * 0.22,
          background: AMBER,
          transform: `scale(${pop})`,
          boxShadow: "0 10px 30px rgba(26,29,36,0.18)",
        }}
      >
        {eye(size * 0.2)}
        {eye(size * 0.56)}
        <div
          style={{
            position: "absolute",
            left: size * 0.12,
            right: size * 0.12,
            top: size * 0.62,
            height: size * 0.04,
            borderRadius: size,
            background: INK,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: HEADING,
          fontWeight: 700,
          fontSize: size * 0.75,
          color: INK,
          opacity: eyes,
        }}
      >
        Sobre
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
