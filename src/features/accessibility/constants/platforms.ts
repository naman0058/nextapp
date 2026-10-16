import { SOCIAL_PLATFORM_LABELS } from "@/constants";
import type { SocialPlatform } from "@/types";

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  "instagram",
  "facebook",
  "linkedin",
  "x",
  "tiktok",
  "youtube",
];

/** Platforms supported by the Phase 1 checker UI. */
export const PHASE1_SOCIAL_PLATFORMS: SocialPlatform[] = [
  "instagram",
  "facebook",
  "linkedin",
  "x",
];

export const DEFAULT_PHASE1_PLATFORM: SocialPlatform = "instagram";

export { SOCIAL_PLATFORM_LABELS };
