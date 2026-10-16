import type { SocialPlatform } from "@/types";

const STORAGE_KEY = "preflight-publishing-confirmations";

export type PublishingConfirmationsByPlatform = Record<
  string,
  Record<string, boolean>
>;

function getSessionStorage(): Storage | null {
  try {
    if (typeof globalThis.sessionStorage === "undefined") return null;
    return globalThis.sessionStorage;
  } catch {
    return null;
  }
}

function readStore(): PublishingConfirmationsByPlatform {
  const storage = getSessionStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PublishingConfirmationsByPlatform;
  } catch {
    return {};
  }
}

function writeStore(store: PublishingConfirmationsByPlatform): void {
  const storage = getSessionStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // quota
  }
}

export function loadPublishingConfirmations(
  platform: SocialPlatform,
): Record<string, boolean> {
  const store = readStore();
  return { ...(store[platform] ?? {}) };
}

export function upsertPublishingConfirmation(
  platform: SocialPlatform,
  confirmationId: string,
  checked: boolean,
): Record<string, boolean> {
  const store = readStore();
  const nextPlatform = { ...(store[platform] ?? {}), [confirmationId]: checked };
  writeStore({ ...store, [platform]: nextPlatform });
  return nextPlatform;
}

export function clearPublishingConfirmations(platform: SocialPlatform): void {
  const store = readStore();
  if (!store[platform]) return;
  const next = { ...store };
  delete next[platform];
  writeStore(next);
}

export function clearAllPublishingConfirmations(): void {
  const storage = getSessionStorage();
  if (!storage) return;
  storage.removeItem(STORAGE_KEY);
}
