import type { VisualPreflightSessionData } from "@/features/reports/types/reportSource";

const KEY = "acps-visual-preflight-session";

export function loadVisualPreflightSession(): VisualPreflightSessionData | null {
  if (typeof globalThis.sessionStorage === "undefined") return null;
  try {
    const raw = globalThis.sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VisualPreflightSessionData;
  } catch {
    return null;
  }
}

export function saveVisualPreflightSession(data: VisualPreflightSessionData): void {
  if (typeof globalThis.sessionStorage === "undefined") return;
  try {
    globalThis.sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* quota */
  }
}

export function clearVisualPreflightSession(): void {
  if (typeof globalThis.sessionStorage === "undefined") return;
  globalThis.sessionStorage.removeItem(KEY);
}
