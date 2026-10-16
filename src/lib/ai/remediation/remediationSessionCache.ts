import "server-only";

import {
  REMEDIATION_SESSION_CACHE_MAX_ENTRIES,
  REMEDIATION_SESSION_CACHE_TTL_MS,
} from "@/lib/ai/remediation/constants";
import type { GenerateRemediationResult } from "@/lib/ai/remediation/types";

type CacheEntry = {
  result: GenerateRemediationResult;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

function evictExpired(now: number): void {
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
}

function evictOverflow(): void {
  while (cache.size > REMEDIATION_SESSION_CACHE_MAX_ENTRIES) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
    else break;
  }
}

export function remediationCacheKey(
  clientKey: string,
  sessionId: string | undefined,
  fingerprint: string,
): string {
  return `${clientKey}::${sessionId ?? "anon"}::${fingerprint}`;
}

export function getCachedRemediation(
  cacheKey: string,
): GenerateRemediationResult | undefined {
  const now = Date.now();
  evictExpired(now);
  const entry = cache.get(cacheKey);
  if (!entry || entry.expiresAt <= now) {
    cache.delete(cacheKey);
    return undefined;
  }
  return { ...entry.result, cached: true };
}

export function setCachedRemediation(
  cacheKey: string,
  result: GenerateRemediationResult,
): void {
  const now = Date.now();
  evictExpired(now);
  cache.set(cacheKey, {
    result: { ...result, cached: false },
    expiresAt: now + REMEDIATION_SESSION_CACHE_TTL_MS,
  });
  evictOverflow();
}

/** Test-only */
export function clearRemediationSessionCacheForTests(): void {
  cache.clear();
}
