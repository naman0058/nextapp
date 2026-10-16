import type { SocialPlatform } from "@/types";
import type { AltTextSource } from "@/features/accessibility/types/screenReaderPreview";

const SESSION_KEY = "preflight-checker-text-session";

export type CheckerTextSession = {
  platform: SocialPlatform;
  caption: string;
  workingCaption: string;
  altText: string;
  altTextSource: AltTextSource;
};

export function loadCheckerTextSession(): CheckerTextSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CheckerTextSession;
  } catch {
    return null;
  }
}

export function saveCheckerTextSession(session: CheckerTextSession): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore quota errors
  }
}

export function clearCheckerTextSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}
