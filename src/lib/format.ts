// Amounts are stored as integer centavos.
export function peso(centavos: number): string {
  const sign = centavos < 0 ? "-" : "";
  const abs = Math.abs(centavos);
  const whole = Math.floor(abs / 100).toLocaleString("en-PH");
  const cents = String(abs % 100).padStart(2, "0");
  return `${sign}₱${whole}.${cents}`;
}

export function toCentavos(input: string): number {
  const n = Number(String(input).replace(/[,\s₱]/g, ""));
  if (!Number.isFinite(n)) return NaN;
  return Math.round(n * 100);
}

export function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

// Card statement cut-off is the 20th of each month (owner's card).
export function lastCutoffISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth();
  const cutoff =
    d.getDate() > 20 ? new Date(y, m, 20) : new Date(y, m - 1, 20);
  const off = cutoff.getTimezoneOffset();
  return new Date(cutoff.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function prettyDate(iso: string): string {
  const [y, m, day] = iso.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}
