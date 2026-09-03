/**
 * Money is integer paisa everywhere in this codebase. 1 NPR = 100 paisa.
 *
 * Floats are never used for money: per-second GPU metering aggregated over a
 * month is ~2.6M additions, and float drift there is measured in rupees. All
 * arithmetic stays in integers; formatting happens only at the render edge.
 */
export type Paisa = number;

/** Rupees -> paisa. Accepts fractional rupees (NPR 6.5 -> 650 paisa). */
export function NPR(rupees: number): Paisa {
  return Math.round(rupees * 100);
}

/** Indicative USD display. Never a settlement rate — see CATALOG.meta. */
export const USD_DISPLAY = {
  nprPerUsd: 139.2,
  rateAsOf: "2026-09-01",
  disclaimer: "Indicative display conversion only. All charges settle in NPR.",
} as const;

export function paisaToUsd(paisa: Paisa): number {
  return paisa / 100 / USD_DISPLAY.nprPerUsd;
}

const nprFormatter = new Intl.NumberFormat("en-NP", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const nprWholeFormatter = new Intl.NumberFormat("en-NP", {
  maximumFractionDigits: 0,
});

/** "NPR 1,150.00". Pass `compact` for whole rupees on dense surfaces. */
export function formatNpr(paisa: Paisa, opts?: { compact?: boolean }): string {
  const rupees = paisa / 100;
  return opts?.compact
    ? `NPR ${nprWholeFormatter.format(Math.round(rupees))}`
    : `NPR ${nprFormatter.format(rupees)}`;
}

/** "$8.26" — always render the USD_DISPLAY disclaimer nearby. */
export function formatUsd(paisa: Paisa): string {
  return `$${paisaToUsd(paisa).toFixed(2)}`;
}

export type Currency = "NPR" | "USD";

export function formatMoney(paisa: Paisa, currency: Currency): string {
  return currency === "NPR" ? formatNpr(paisa) : formatUsd(paisa);
}

/** Nepal VAT, applied to invoice subtotals. */
export const VAT_RATE_PERCENT = 13;

export function applyVat(subtotal: Paisa): { vat: Paisa; total: Paisa } {
  const vat = Math.round((subtotal * VAT_RATE_PERCENT) / 100);
  return { vat, total: subtotal + vat };
}
