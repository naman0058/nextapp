import { buildAiInputFingerprint } from "@/features/accessibility/utils/client/aiInputFingerprint";
import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import type { SocialPlatform } from "@/types";

export function computeBatchAiFingerprint(
  item: BatchAccessibilityItem,
): string | null {
  if (!item.image?.file?.size || !item.platform) return null;
  return buildAiInputFingerprint({
    platform: item.platform,
    caption: item.caption,
    altText: item.altText,
    file: item.image.file,
  });
}

export function markAiStaleIfNeeded(item: BatchAccessibilityItem): BatchAccessibilityItem {
  if (item.ai.status !== "success" || !item.ai.fingerprint) return item;
  const current = computeBatchAiFingerprint(item);
  if (current && current !== item.ai.fingerprint) {
    return {
      ...item,
      ai: { ...item.ai, status: "stale", analysis: item.ai.analysis },
    };
  }
  return item;
}

export function resolvePlatformForAi(item: BatchAccessibilityItem): SocialPlatform | null {
  return item.platform;
}
