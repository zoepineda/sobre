// Brand logo lookup for PH banks/e-wallets, matched by account name (same
// spirit as cardStyles). Files live in public/brands/; chip says which
// background the mark reads best on.
export type BrandHit = { logo: string; chip: "light" | "dark" | "red" };

const BRANDS: { match: RegExp; logo: string; chip?: BrandHit["chip"] }[] = [
  { match: /\bbpi\b/i, logo: "bpi.svg" },
  { match: /\bbdo\b/i, logo: "bdo.svg" },
  { match: /metrobank|metro\s*bank/i, logo: "metrobank.svg" },
  { match: /landbank|land\s*bank/i, logo: "landbank.svg" },
  { match: /security\s*bank/i, logo: "security-bank.svg" },
  { match: /\bpnb\b/i, logo: "pnb.svg" },
  { match: /\brcbc\b/i, logo: "rcbc.svg" },
  { match: /union\s*bank/i, logo: "unionbank.svg" },
  { match: /\bcimb\b/i, logo: "cimb.svg", chip: "red" },
  { match: /maribank|mari\s*bank/i, logo: "maribank.svg" },
  { match: /gotyme|go\s*tyme/i, logo: "gotyme.svg" },
  { match: /tonik/i, logo: "tonik.svg" },
  { match: /seabank|sea\s*bank/i, logo: "seabank.svg" },
  { match: /\buno\b/i, logo: "uno.svg" },
  { match: /ownbank|own\s*bank/i, logo: "ownbank.svg", chip: "dark" },
  { match: /komo/i, logo: "komo.svg" },
  { match: /gcash/i, logo: "gcash.svg" },
  { match: /maya/i, logo: "maya.svg", chip: "dark" },
  { match: /grab/i, logo: "grabpay.svg" },
  { match: /shopee/i, logo: "shopeepay.svg" },
  { match: /coins/i, logo: "coins-ph.svg" },
];

export function brandLogo(name: string): BrandHit | null {
  const hit = BRANDS.find((b) => b.match.test(name));
  return hit ? { logo: hit.logo, chip: hit.chip ?? "light" } : null;
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
