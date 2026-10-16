import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";

export function revokeItemImageUrls(item: BatchAccessibilityItem): void {
  const thumb = item.image?.thumbnailUrl;
  if (thumb?.startsWith("blob:")) {
    URL.revokeObjectURL(thumb);
  }
}

export function revokeAllBatchImageUrls(items: BatchAccessibilityItem[]): void {
  for (const item of items) {
    revokeItemImageUrls(item);
  }
}
