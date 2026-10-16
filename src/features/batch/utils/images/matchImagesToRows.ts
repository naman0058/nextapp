import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import type { ExtractedZipImage } from "@/features/batch/utils/zip/extractBatchZipImages";
import { createBatchThumbnail } from "@/features/batch/utils/images/createBatchThumbnail";

function basenameKey(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? name;
  return base.toLowerCase();
}

export async function attachZipImagesToItems(
  items: BatchAccessibilityItem[],
  zipImages: ExtractedZipImage[],
): Promise<BatchAccessibilityItem[]> {
  const byBase = new Map<string, ExtractedZipImage[]>();
  for (const img of zipImages) {
    const key = basenameKey(img.baseName);
    const list = byBase.get(key) ?? [];
    list.push(img);
    byBase.set(key, list);
  }

  const next: BatchAccessibilityItem[] = [];
  for (const item of items) {
    const fn = item.imageFilename?.trim();
    if (!fn) {
      next.push({
        ...item,
        image: null,
      });
      continue;
    }

    const key = basenameKey(fn);
    const candidates = byBase.get(key) ?? [];

    if (candidates.length === 0) {
      next.push({
        ...item,
        image: null,
        validation: {
          ...item.validation,
          messages: [
            ...item.validation.messages,
            `Image "${fn}" was not found in the ZIP.`,
          ],
          severity:
            item.validation.severity === "invalid"
              ? "invalid"
              : "needs_review",
        },
      });
      continue;
    }

    if (candidates.length > 1) {
      next.push({
        ...item,
        image: {
          file: candidates[0].file,
          fileName: candidates[0].baseName,
          thumbnailUrl: null,
          matchStatus: "ambiguous",
          ambiguousCandidates: candidates.map((c) => c.zipPath),
          selectedZipPath: candidates[0].zipPath,
        },
      });
      continue;
    }

    const chosen = candidates[0];
    const thumbnailUrl = await createBatchThumbnail(chosen.file);
    next.push({
      ...item,
      image: {
        file: chosen.file,
        fileName: chosen.baseName,
        thumbnailUrl,
        matchStatus: "matched",
        selectedZipPath: chosen.zipPath,
      },
    });
  }

  return next;
}

export function computeImageImportCounts(items: BatchAccessibilityItem[]) {
  let imagesMatched = 0;
  let imagesMissing = 0;
  let imagesAmbiguous = 0;
  for (const item of items) {
    if (!item.imageFilename?.trim()) continue;
    const status = item.image?.matchStatus ?? "missing";
    if (status === "matched") imagesMatched++;
    else if (status === "ambiguous") imagesAmbiguous++;
    else imagesMissing++;
  }
  return { imagesMatched, imagesMissing, imagesAmbiguous };
}
