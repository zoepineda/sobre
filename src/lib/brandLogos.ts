// Brand logo lookup for PH banks/e-wallets, matched by account name (same
// spirit as cardStyles). Files live in public/brands/; chip says which
// background the mark reads best on.
export type BrandHit = { logo: string; chip: "light" | "dark" | "red" };

const BRANDS: {
  match: RegExp;
  logo: string;
  color: string; // representative solid brand color, for tints
  chip?: BrandHit["chip"];
  raster?: true; // embedded bitmap — can't be recolored via CSS filters
  cardH?: number; // knockout height on cards (px) — compact marks get a boost
  nativeCard?: true; // render in its own color on cards (skip the white knockout)
}[] = [
  { match: /\bbpi\b/i, logo: "bpi.svg", color: "#b11116", cardH: 20 },
  { match: /\bbdo\b/i, logo: "bdo.svg", color: "#0b2972" },
  { match: /metrobank|metro\s*bank/i, logo: "metrobank.svg", color: "#023184" },
  { match: /landbank|land\s*bank/i, logo: "landbank.svg", color: "#1cb14d", cardH: 26 },
  { match: /security\s*bank/i, logo: "security-bank.svg", color: "#0168b3" },
  { match: /\bpnb\b/i, logo: "pnb.svg", color: "#10357f" },
  { match: /\brcbc\b/i, logo: "rcbc.svg", color: "#4892cf", cardH: 26 },
  { match: /union\s*bank/i, logo: "unionbank.svg", color: "#f26722" },
  { match: /\bcimb\b/i, logo: "cimb.svg", color: "#dc241f", chip: "red", cardH: 26 },
  { match: /maribank|mari\s*bank/i, logo: "maribank.svg", color: "#ff7a1a" },
  { match: /gotyme|go\s*tyme/i, logo: "gotyme.svg", color: "#00c9c0" },
  { match: /tonik/i, logo: "tonik.svg", color: "#7657f8" },
  { match: /seabank|sea\s*bank/i, logo: "seabank.svg", color: "#ee4d2d" },
  { match: /\buno\b/i, logo: "uno.svg", color: "#7a4ff5", raster: true },
  { match: /ownbank|own\s*bank/i, logo: "ownbank.svg", color: "#30ec5d", chip: "dark" },
  { match: /komo/i, logo: "komo.svg", color: "#b91372", raster: true },
  { match: /gcash/i, logo: "gcash.svg", color: "#007dfe" },
  { match: /maya/i, logo: "maya.svg", color: "#2fdf75", chip: "dark", nativeCard: true },
  { match: /grab/i, logo: "grabpay.svg", color: "#00b14f" },
  { match: /shopee/i, logo: "shopeepay.svg", color: "#ee4d2d" },
  { match: /coins/i, logo: "coins-ph.svg", color: "#2f6fdb" },
];

const TYPE_COLORS: Record<string, string> = {
  bank: "#50647c",
  ewallet: "#5b57cf",
  cash: "#8a6a48",
  credit_card: "#34343f",
};

export function brandLogo(name: string): BrandHit | null {
  const hit = BRANDS.find((b) => b.match.test(name));
  return hit ? { logo: hit.logo, chip: hit.chip ?? "light" } : null;
}

// logo usable as a white-knockout mark on card gradients (pure vector only —
// raster-embedded logos would turn into solid white blobs under the filter)
export function brandCardLogo(
  name: string,
  type?: string
): { logo: string; height: number; knockout: boolean } | null {
  const hit = BRANDS.find((b) => b.match.test(name));
  if (!hit || hit.raster) return null;
  // native color only where the brand's own mark reads on the card
  // (e.g. Maya's mint green on the black wallet card — but the credit
  // card variant stays a white knockout to match its muted styling)
  const knockout = !(hit.nativeCard && type !== "credit_card");
  return { logo: hit.logo, height: hit.cardH ?? 18, knockout };
}

export function brandColor(name: string, type: string): string {
  return (
    BRANDS.find((b) => b.match.test(name))?.color ??
    TYPE_COLORS[type] ??
    TYPE_COLORS.bank
  );
}

// faded rgba version of a brand color, for row tints
export function brandTint(name: string, type: string, alpha = 0.13): string {
  const hex = brandColor(name, type);
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export const CHIP_BG: Record<BrandHit["chip"], string> = {
  light: "bg-white border border-border/60",
  dark: "bg-[#101014]",
  red: "bg-[#DC241F]",
};

// monogram fallback for unbranded names — capitals in the name (GCash → GC)
export function brandMark(name: string) {
  if (name.length <= 4) return name.toUpperCase();
  const caps = name.replace(/[^A-Z]/g, "");
  return (caps.length >= 2 ? caps : name.slice(0, 2).toUpperCase()).slice(0, 3);
}
