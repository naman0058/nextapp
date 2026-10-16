import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import type { BatchMetadata, BatchSessionSummary } from "@/features/batch/types/batchSession";

export type BatchJsonExport = {
  sessionId: string;
  exportedAt: string;
  metadata: BatchMetadata;
  summary: BatchSessionSummary;
  items: SerializableBatchItem[];
};

type SerializableBatchItem = Omit<
  BatchAccessibilityItem,
  "image"
> & {
  image: {
    fileName: string | null;
    matchStatus: string | null;
  } | null;
};

function serializeItem(item: BatchAccessibilityItem): SerializableBatchItem {
  const { image, ...rest } = item;
  return {
    ...rest,
    image: image
      ? {
          fileName: image.fileName,
          matchStatus: image.matchStatus,
        }
      : null,
  };
}

export function buildBatchJsonExport(options: {
  sessionId: string;
  metadata: BatchMetadata;
  summary: BatchSessionSummary;
  items: BatchAccessibilityItem[];
}): string {
  const payload: BatchJsonExport = {
    sessionId: options.sessionId,
    exportedAt: new Date().toISOString(),
    metadata: options.metadata,
    summary: options.summary,
    items: options.items.map(serializeItem),
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadBatchJson(
  options: Parameters<typeof buildBatchJsonExport>[0],
  filename = "batch-export.json",
): void {
  const blob = new Blob([buildBatchJsonExport(options)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
