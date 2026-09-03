/**
 * Deterministic generators for demo data.
 *
 * Everything here is a pure function of its inputs. That matters for two
 * reasons: the server and the browser must render byte-identical markup (no
 * hydration mismatch), and a usage chart must not change shape every time a
 * screen re-renders.
 *
 * Wall-clock time is quantised to the hour via `now()`, so a server render and
 * the client render that hydrates it agree. Live drift is applied only by the
 * mock's subscribe* timers, which run after mount.
 */

/** mulberry32 — small, fast, well-distributed enough for demo data. */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable 32-bit hash, so a string id can seed a generator. */
export function hashSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Current time, floored to the hour so SSR and hydration agree. */
export function now(): number {
  const HOUR = 3600_000;
  return Math.floor(Date.now() / HOUR) * HOUR;
}

export function isoAt(offsetMs: number): string {
  return new Date(now() + offsetMs).toISOString();
}

export const MINUTE = 60_000;
export const HOUR = 3600_000;
export const DAY = 86_400_000;

/**
 * Smooth pseudo-random value in [0,1] for a (subject, meter, bucket) triple.
 * Layered sine waves plus seeded jitter give a series that looks like real
 * telemetry — diurnal shape, not white noise — while staying reproducible.
 */
export function usageAt(
  subjectId: string,
  meterId: string,
  bucketIndex: number,
): number {
  const seed = hashSeed(`${subjectId}:${meterId}`);
  const phase = (seed % 1000) / 1000;
  const diurnal = 0.5 + 0.34 * Math.sin((bucketIndex / 24) * Math.PI * 2 + phase * 6.28);
  const weekly = 0.08 * Math.sin((bucketIndex / 168) * Math.PI * 2 + phase * 3.14);
  const jitter = (makeRng(seed + bucketIndex)() - 0.5) * 0.12;
  return Math.min(1, Math.max(0.02, diurnal + weekly + jitter));
}

/** Pick a deterministic element. */
export function pick<T>(items: readonly T[], seed: string): T {
  const r = makeRng(hashSeed(seed))();
  return items[Math.floor(r * items.length)] as T;
}

/** Deterministic integer in [min, max]. */
export function intBetween(seed: string, min: number, max: number): number {
  const r = makeRng(hashSeed(seed))();
  return min + Math.floor(r * (max - min + 1));
}

/**
 * Cheap, stable content hash for the audit chain. Not cryptographic — it
 * demonstrates the tamper-evident structure without pulling in a crypto
 * dependency for demo data.
 */
export function chainHash(previousHash: string, payload: string): string {
  const h1 = hashSeed(previousHash + payload);
  const h2 = hashSeed(payload + previousHash + String(h1));
  return (
    h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0")
  ).padEnd(16, "0");
}
