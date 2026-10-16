import { facebookPlatformConfig } from "@/features/accessibility/config/platformAccessibility/facebook";
import { instagramPlatformConfig } from "@/features/accessibility/config/platformAccessibility/instagram";
import { linkedinPlatformConfig } from "@/features/accessibility/config/platformAccessibility/linkedin";
import type { PlatformAccessibilityConfig } from "@/features/accessibility/config/platformAccessibility/types";
import { xPlatformConfig } from "@/features/accessibility/config/platformAccessibility/x";
import type { SocialPlatform } from "@/types";

export const PHASE5_PLATFORMS = [
  "instagram",
  "facebook",
  "linkedin",
  "x",
] as const satisfies readonly SocialPlatform[];

export type Phase5Platform = (typeof PHASE5_PLATFORMS)[number];

const CONFIG_BY_PLATFORM: Record<Phase5Platform, PlatformAccessibilityConfig> = {
  instagram: instagramPlatformConfig,
  facebook: facebookPlatformConfig,
  linkedin: linkedinPlatformConfig,
  x: xPlatformConfig,
};

export const PLATFORM_CHECKER_PATHS: Record<Phase5Platform, string> = {
  instagram: "/instagram-accessibility-checker",
  facebook: "/facebook-accessibility-checker",
  linkedin: "/linkedin-accessibility-checker",
  x: "/x-accessibility-checker",
};

export function getPlatformAccessibilityConfig(
  platform: SocialPlatform,
): PlatformAccessibilityConfig | null {
  if (!(PHASE5_PLATFORMS as readonly string[]).includes(platform)) {
    return null;
  }
  return CONFIG_BY_PLATFORM[platform as Phase5Platform];
}

export function getPlatformCheckerPath(platform: SocialPlatform): string | null {
  if (!(PHASE5_PLATFORMS as readonly string[]).includes(platform)) {
    return null;
  }
  return PLATFORM_CHECKER_PATHS[platform as Phase5Platform];
}

export function warnIfPlatformConfigIncomplete(
  config: PlatformAccessibilityConfig,
): void {
  if (process.env.NODE_ENV === "production") return;
  if (!config.sourceMetadata.lastReviewed) {
    console.warn(`[platform config] ${config.id}: missing lastReviewed`);
  }
  if (config.sourceMetadata.sourceLabels.length === 0) {
    console.warn(`[platform config] ${config.id}: missing source labels`);
  }
  for (const cap of Object.values(config.capabilities)) {
    if (cap.status === "unknown") {
      console.warn(`[platform config] ${config.id}: unknown capability ${cap.label}`);
    }
  }
  const reviewed = new Date(config.sourceMetadata.lastReviewed);
  if (!Number.isNaN(reviewed.getTime())) {
    const months =
      (Date.now() - reviewed.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (months > 12) {
      console.warn(
        `[platform config] ${config.id}: guidance should be reviewed (lastReviewed > 12 months)`,
      );
    }
  }
}

export * from "@/features/accessibility/config/platformAccessibility/types";
