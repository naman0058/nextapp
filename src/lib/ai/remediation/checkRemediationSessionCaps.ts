import "server-only";

import {
  getMaxAiRemediationsPerScan,
  getMaxAiRemediationsPerSession,
} from "@/lib/openai/config";

type CounterMap = Map<string, number[]>;

const sessionHits: CounterMap = new Map();
const scanHits: CounterMap = new Map();
const WINDOW_MS = 24 * 60 * 60 * 1000;

function prune(key: string, map: CounterMap, windowMs: number): number {
  const now = Date.now();
  const list = (map.get(key) ?? []).filter((t) => t > now - windowMs);
  map.set(key, list);
  return list.length;
}

function record(key: string, map: CounterMap): void {
  const list = map.get(key) ?? [];
  list.push(Date.now());
  map.set(key, list);
}

export type SessionCapResult = { allowed: true } | { allowed: false; reason: "session" | "scan" };

export function checkRemediationSessionCaps(
  sessionId: string | undefined,
  scanId: string | undefined,
): SessionCapResult {
  if (sessionId) {
    const key = sessionId;
    const count = prune(key, sessionHits, WINDOW_MS);
    if (count >= getMaxAiRemediationsPerSession()) {
      return { allowed: false, reason: "session" };
    }
  }
  if (scanId) {
    const key = scanId;
    const count = prune(key, scanHits, WINDOW_MS);
    if (count >= getMaxAiRemediationsPerScan()) {
      return { allowed: false, reason: "scan" };
    }
  }
  return { allowed: true };
}

export function recordRemediationSessionCapHit(
  sessionId: string | undefined,
  scanId: string | undefined,
): void {
  if (sessionId) record(sessionId, sessionHits);
  if (scanId) record(scanId, scanHits);
}

export function clearRemediationSessionCapsForTests(): void {
  sessionHits.clear();
  scanHits.clear();
}
