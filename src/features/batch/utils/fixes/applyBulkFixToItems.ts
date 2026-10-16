import { applyAutoFix } from "@/features/accessibility/utils/autoFix/applyAutoFix";
import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import { analyzeBatchItemLocal } from "@/features/batch/utils/analysis/analyzeBatchItemLocal";

export type BulkFixId =
  | "reduce-punctuation"
  | "reduce-emoji-runs"
  | "fancy-unicode-normalize";

export function previewBulkFix(
  items: BatchAccessibilityItem[],
  fixId: BulkFixId,
): { id: string; before: string; after: string }[] {
  const previews: { id: string; before: string; after: string }[] = [];
  for (const item of items) {
    const result = applyAutoFix(item.caption, fixId);
    if (result && result.nextCaption !== item.caption) {
      previews.push({
        id: item.id,
        before: item.caption.slice(0, 120),
        after: result.nextCaption.slice(0, 120),
      });
    }
  }
  return previews;
}

export function applyBulkFix(
  items: BatchAccessibilityItem[],
  ids: string[],
  fixId: BulkFixId,
): { items: BatchAccessibilityItem[]; undo: { id: string; caption: string }[] } {
  const idSet = new Set(ids);
  const undo: { id: string; caption: string }[] = [];
  const next = items.map((item) => {
    if (!idSet.has(item.id)) return item;
    const result = applyAutoFix(item.caption, fixId);
    if (!result) return item;
    undo.push({ id: item.id, caption: item.caption });
    let updated = { ...item, caption: result.nextCaption };
    if (updated.localAnalysis) {
      updated = analyzeBatchItemLocal(updated);
    }
    return updated;
  });
  return { items: next, undo };
}

export function undoBulkFix(
  items: BatchAccessibilityItem[],
  undo: { id: string; caption: string }[],
): BatchAccessibilityItem[] {
  const map = new Map(undo.map((u) => [u.id, u.caption]));
  return items.map((item) => {
    const caption = map.get(item.id);
    if (caption === undefined) return item;
    let updated = { ...item, caption };
    if (updated.localAnalysis) {
      updated = analyzeBatchItemLocal(updated);
    }
    return updated;
  });
}
