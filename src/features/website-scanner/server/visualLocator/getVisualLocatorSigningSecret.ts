import "server-only";

export function getVisualLocatorSigningSecret(): string | null {
  const raw = process.env.VISUAL_LOCATOR_SIGNING_SECRET?.trim();
  if (raw && raw.length >= 16) return raw;
  if (process.env.NODE_ENV !== "production") {
    return "dev-visual-locator-secret-min-16-chars";
  }
  return null;
}

export function isVisualLocatorConfigured(): boolean {
  return getVisualLocatorSigningSecret() !== null;
}
