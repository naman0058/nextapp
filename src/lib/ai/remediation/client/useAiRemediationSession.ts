"use client";

import { useSyncExternalStore } from "react";

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `remediation-${Date.now().toString(36)}`;
}

let clientSessionId: string | null = null;

function getClientSessionId(): string {
  if (!clientSessionId) {
    clientSessionId = createSessionId();
  }
  return clientSessionId;
}

function subscribeNoop(): () => void {
  return () => {};
}

/** Stable browser-tab session id for shared remediation rate/cost caps. */
export function useAiRemediationSession(): {
  sessionId: string | null;
  ready: boolean;
} {
  const sessionId = useSyncExternalStore(
    subscribeNoop,
    getClientSessionId,
    () => null,
  );
  return { sessionId, ready: sessionId !== null };
}
