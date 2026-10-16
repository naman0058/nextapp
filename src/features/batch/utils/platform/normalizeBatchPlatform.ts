import type { SocialPlatform } from "@/types";

const PLATFORM_MAP: Record<string, SocialPlatform> = {
  instagram: "instagram",
  facebook: "facebook",
  linkedin: "linkedin",
  x: "x",
  twitter: "x",
};

export type PlatformNormalizeResult =
  | { ok: true; platform: SocialPlatform; warning?: string }
  | { ok: false; raw: string };

export function normalizeBatchPlatform(
  raw: string | undefined | null,
): PlatformNormalizeResult | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  const key = trimmed.toLowerCase();
  const platform = PLATFORM_MAP[key];
  if (!platform) {
    return { ok: false, raw: trimmed };
  }
  const warning =
    key === "twitter" ? "'twitter' was interpreted as X." : undefined;
  return { ok: true, platform, warning };
}
