/** Caché genérica en localStorage con TTL (hooks Stage 2). */

export interface CachedEnvelope<T> {
  v: number;
  data: T;
  cachedAt: number;
}

const CACHE_VERSION = 1;

export function readLocalCache<T>(
  key: string,
  ttlMs: number,
): { data: T; stale: boolean; cachedAt: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedEnvelope<T>;
    if (parsed.v !== CACHE_VERSION || parsed.cachedAt == null) return null;
    const age = Date.now() - parsed.cachedAt;
    const stale = age >= ttlMs;
    return { data: parsed.data, stale, cachedAt: parsed.cachedAt };
  } catch {
    return null;
  }
}

export function writeLocalCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const envelope: CachedEnvelope<T> = {
      v: CACHE_VERSION,
      data,
      cachedAt: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    // Quota u otro error: ignorar.
  }
}
