// Brand-inspired card backgrounds for PH banks/e-wallets, matched by account
// name. Colors approximate each brand's real debit card; no logos are used.
export type CardStyle = {
  bg: string; // CSS background
  fg: string; // main text color
  sub: string; // secondary text color
  chip: string; // chip color
};

const styles: { match: RegExp; type?: string; style: CardStyle }[] = [
  {
    // Maya credit card — black with muted white text (the wallet keeps green)
    match: /maya/i,
    type: "credit_card",
    style: {
      bg: "linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 60%, #103324 100%)",
      fg: "rgba(255,255,255,0.85)",
      sub: "rgba(255,255,255,0.55)",
      chip: "#2fdf75",
    },
  },
  {
    // BPI — signature red debit Mastercard
    match: /bpi/i,
    style: {
      bg: "linear-gradient(135deg, #7d0c10 0%, #b11116 55%, #d3252b 100%)",
      fg: "#ffffff",
      sub: "rgba(255,255,255,0.75)",
      chip: "#e7c873",
    },
  },
  {
    // Maya — minimalist black card with neon green
    match: /maya/i,
    style: {
      bg: "linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 60%, #103324 100%)",
      fg: "#2fdf75",
      sub: "rgba(255,255,255,0.65)",
      chip: "#2fdf75",
    },
  },
  {
    // GoTyme — navy with bright teal
    match: /gotyme/i,
    style: {
      bg: "linear-gradient(135deg, #071d3a 0%, #0a2a52 45%, #00c9c0 130%)",
      fg: "#ffffff",
      sub: "rgba(255,255,255,0.7)",
      chip: "#00c9c0",
    },
  },
  {
    // Tonik — purple card, white text
    match: /tonik/i,
    style: {
      bg: "linear-gradient(135deg, #5c3ad6 0%, #7657f8 55%, #8f75ff 100%)",
      fg: "#ffffff",
      sub: "rgba(255,255,255,0.78)",
      chip: "#e9e2ff",
    },
  },
  {
    // GCash — bright blue
    match: /gcash/i,
    style: {
      bg: "linear-gradient(135deg, #0057d8 0%, #007dfe 60%, #2f9bff 100%)",
      fg: "#ffffff",
      sub: "rgba(255,255,255,0.75)",
      chip: "#cfe6ff",
    },
  },
  {
    // BDO — deep blue
    match: /bdo/i,
    style: {
      bg: "linear-gradient(135deg, #002446 0%, #003a70 60%, #0a5aa0 100%)",
      fg: "#ffffff",
      sub: "rgba(255,255,255,0.72)",
      chip: "#e7c873",
    },
  },
  {
    // UnionBank — orange
    match: /union\s*bank|ub\b/i,
    style: {
      bg: "linear-gradient(135deg, #d84a05 0%, #f26722 60%, #ff8a3d 100%)",
      fg: "#ffffff",
      sub: "rgba(255,255,255,0.78)",
      chip: "#ffe1cc",
    },
  },
  {
    // CIMB — dark red
    match: /cimb/i,
    style: {
      bg: "linear-gradient(135deg, #5e0b15 0%, #ec1c24 70%, #ff4048 110%)",
      fg: "#ffffff",
      sub: "rgba(255,255,255,0.75)",
      chip: "#ffd9db",
    },
  },
  {
    // MariBank (formerly SeaBank PH) — vibrant orange
    match: /maribank|mari\s*bank/i,
    style: {
      bg: "linear-gradient(135deg, #e85d04 0%, #ff7a1a 55%, #ffa94d 100%)",
      fg: "#ffffff",
      sub: "rgba(255,255,255,0.8)",
      chip: "#ffe8cc",
    },
  },
  {
    // SeaBank — orange/red
    match: /seabank/i,
    style: {
      bg: "linear-gradient(135deg, #d5310a 0%, #ee4d2d 60%, #ff7a50 100%)",
      fg: "#ffffff",
      sub: "rgba(255,255,255,0.78)",
      chip: "#ffe3d9",
    },
  },
  {
    // Metrobank — navy + gold
    match: /metrobank|metro\s*bank/i,
    style: {
      bg: "linear-gradient(135deg, #0b1f4b 0%, #123072 60%, #1c4aa8 100%)",
      fg: "#ffffff",
      sub: "rgba(255,255,255,0.72)",
      chip: "#e7c873",
    },
  },
  {
    // Landbank — green
    match: /landbank|land\s*bank/i,
    style: {
      bg: "linear-gradient(135deg, #0b3d1f 0%, #146c34 60%, #1f9a4b 100%)",
      fg: "#ffffff",
      sub: "rgba(255,255,255,0.75)",
      chip: "#ffd34d",
    },
  },
  {
    // Security Bank — dark green/teal
    match: /security\s*bank/i,
    style: {
      bg: "linear-gradient(135deg, #003b2f 0%, #00594a 60%, #0a7d68 100%)",
      fg: "#ffffff",
      sub: "rgba(255,255,255,0.72)",
      chip: "#8fe3cf",
    },
  },
  {
    // Wallet cash — warm leather wallet
    match: /cash|wallet/i,
    style: {
      bg: "linear-gradient(135deg, #4e3b2b 0%, #6b5138 60%, #8a6a48 100%)",
      fg: "#f5ead9",
      sub: "rgba(245,234,217,0.72)",
      chip: "#d9b98a",
    },
  },
];

const fallbacks: Record<string, CardStyle> = {
  bank: {
    bg: "linear-gradient(135deg, #26303c 0%, #3a4a5c 60%, #50647c 100%)",
    fg: "#ffffff",
    sub: "rgba(255,255,255,0.72)",
    chip: "#c9d4e0",
  },
  ewallet: {
    bg: "linear-gradient(135deg, #2c2a63 0%, #43409a 60%, #5b57cf 100%)",
    fg: "#ffffff",
    sub: "rgba(255,255,255,0.75)",
    chip: "#cfcdf5",
  },
  cash: {
    bg: "linear-gradient(135deg, #4e3b2b 0%, #6b5138 60%, #8a6a48 100%)",
    fg: "#f5ead9",
    sub: "rgba(245,234,217,0.72)",
    chip: "#d9b98a",
  },
  credit_card: {
    bg: "linear-gradient(135deg, #101014 0%, #23232b 60%, #34343f 100%)",
    fg: "#ffffff",
    sub: "rgba(255,255,255,0.65)",
    chip: "#e7c873",
  },
};

export function cardStyle(name: string, type: string): CardStyle {
  const hit = styles.find(
    (s) => s.match.test(name) && (!s.type || s.type === type)
  );
  return hit ? hit.style : (fallbacks[type] ?? fallbacks.bank);
}
