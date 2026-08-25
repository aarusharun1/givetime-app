/**
 * Local calendar date as YYYY-MM-DD.
 *
 * new Date().toISOString().split("T")[0] returns the UTC date, which is
 * already tomorrow for anyone in the US after 8pm ET. That made date inputs
 * default to tomorrow and allowed a "future" date past the max attribute.
 * This builds the string from local getters instead.
 */
export function localDateStr(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Format an hours number without trailing zeros: 400, 12.5, 0.25. */
export function fmtHours(n: number): string {
  return Number(n.toFixed(2)).toString();
}

/** Round to 2 decimals to match the numeric(7,2) column. */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
