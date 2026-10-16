import { saveCheckerTextSession } from "@/features/accessibility/utils/checkerSessionStorage";
import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import type { SocialPlatform } from "@/types";

type HandoffPayload = {
  file: File;
  platform: SocialPlatform;
};

const handoffStore = new Map<string, HandoffPayload>();

export function createBatchCheckerHandoff(item: BatchAccessibilityItem): string {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `ho-${Date.now()}`;
  const platform = item.platform ?? "instagram";
  saveCheckerTextSession({
    platform,
    caption: item.caption,
    workingCaption: item.caption,
    altText: item.altText,
    altTextSource: item.altTextSource === "none" ? "none" : item.altTextSource,
  });
  if (item.image?.file?.size) {
    handoffStore.set(id, { file: item.image.file, platform });
  }
  return id;
}

export function takeBatchCheckerHandoff(
  handoffId: string,
): HandoffPayload | null {
  const payload = handoffStore.get(handoffId);
  if (!payload) return null;
  handoffStore.delete(handoffId);
  return payload;
}

export function checkerHandoffPath(handoffId: string): string {
  return `/social-media-accessibility-checker?handoff=${encodeURIComponent(handoffId)}`;
}
