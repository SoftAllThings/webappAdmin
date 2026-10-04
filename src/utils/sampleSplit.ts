/**
 * Splitting a requested total across Bristol types without ever asking for
 * more than a type has. All functions return whole numbers that sum to
 * min(total, sum(available)).
 */

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** Same number per type; a type that runs out hands its share to the others. */
export function splitEqual(total: number, available: number[]): number[] {
  const out = available.map(() => 0);
  let remaining = Math.min(Math.max(0, Math.floor(total)), sum(available));
  while (remaining > 0) {
    const open = out.map((_, i) => i).filter((i) => out[i]! < available[i]!);
    if (open.length === 0) break;
    const share = Math.max(1, Math.floor(remaining / open.length));
    for (const i of open) {
      const give = Math.min(share, available[i]! - out[i]!, remaining);
      out[i] = out[i]! + give;
      remaining -= give;
      if (remaining === 0) break;
    }
  }
  return out;
}

/** Mirrors the source's own distribution (largest-remainder rounding). */
export function splitProportional(total: number, available: number[]): number[] {
  const pool = sum(available);
  const target = Math.min(Math.max(0, Math.floor(total)), pool);
  if (pool === 0 || target === 0) return available.map(() => 0);
  const exact = available.map((a) => (a / pool) * target);
  const out = exact.map(Math.floor);
  const byRemainder = exact
    .map((x, i) => ({ i, r: x - Math.floor(x) }))
    .sort((a, b) => b.r - a.r);
  let left = target - sum(out);
  for (const { i } of byRemainder) {
    if (left === 0) break;
    if (out[i]! < available[i]!) {
      out[i] = out[i]! + 1;
      left -= 1;
    }
  }
  return out;
}
