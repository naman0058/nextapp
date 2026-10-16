import type { BatchDefaultPlatformMode } from "@/features/batch/types/batchSession";
import type { BatchCsvRow, BatchImportError } from "@/features/batch/types/batchImport";
import type {
  BatchAccessibilityItem,
  BatchValidationSeverity,
} from "@/features/batch/types/batchItem";
import type { BatchMetadata } from "@/features/batch/types/batchSession";
import { createBatchItemId } from "@/features/batch/utils/items/createBatchItemId";
import { defaultBatchRemediationState } from "@/features/batch/utils/items/defaultBatchRemediationState";
import { normalizeBatchPlatform } from "@/features/batch/utils/platform/normalizeBatchPlatform";
import type { SocialPlatform } from "@/types";

function defaultPlatformFromMode(
  mode: BatchDefaultPlatformMode,
): SocialPlatform | null {
  if (mode === "use_csv") return null;
  return mode;
}

export function validateDuplicateIds(rows: BatchCsvRow[]): BatchImportError[] {
  const seen = new Map<string, number>();
  const errors: BatchImportError[] = [];
  for (const row of rows) {
    if (!row.id?.trim()) continue;
    const id = row.id.trim();
    if (seen.has(id)) {
      errors.push({
        row: row.sourceRow,
        field: "id",
        error: `Duplicate id "${id}" (also on row ${seen.get(id)}).`,
        originalId: id,
      });
    } else {
      seen.set(id, row.sourceRow);
    }
  }
  return errors;
}

export function buildItemsFromCsvRows(options: {
  rows: BatchCsvRow[];
  defaultPlatformMode: BatchDefaultPlatformMode;
  batchMetadata: BatchMetadata;
}): { items: BatchAccessibilityItem[]; errors: BatchImportError[] } {
  const errors = validateDuplicateIds(options.rows);
  const duplicateIds = new Set(
    errors.map((e) => e.originalId).filter(Boolean) as string[],
  );

  const defaultPlatform = defaultPlatformFromMode(options.defaultPlatformMode);
  const items: BatchAccessibilityItem[] = [];

  for (const row of options.rows) {
    const importWarnings: string[] = [];
    let platform: SocialPlatform | null = null;
    let platformSource: BatchAccessibilityItem["platformSource"] = "unspecified";

    if (row.id && duplicateIds.has(row.id.trim())) {
      items.push(createInvalidItem(row, "Duplicate id — fix CSV or remove row."));
      continue;
    }

    const normalized = normalizeBatchPlatform(row.platform);
    if (normalized === null) {
      if (defaultPlatform) {
        platform = defaultPlatform;
        platformSource = "default";
      } else {
        platformSource = "unspecified";
      }
    } else if (normalized.ok) {
      platform = normalized.platform;
      platformSource = "csv";
      if (normalized.warning) importWarnings.push(normalized.warning);
    } else {
      platform = null;
      platformSource = "unspecified";
      importWarnings.push(
        `Unknown platform "${normalized.raw}". Select a platform manually.`,
      );
    }

    const caption = row.caption ?? "";
    const altText = row.alt_text ?? "";
    const imageFilename = row.image_filename?.trim() || undefined;

    const validationMessages: string[] = [...importWarnings];
    let severity: BatchValidationSeverity = "valid";

    if (importWarnings.some((w) => w.includes("Unknown platform"))) {
      severity = "needs_review";
    }
    if (altText && !imageFilename) {
      validationMessages.push(
        "Alt text provided but no image is linked to this row.",
      );
      severity = "needs_review";
    }

    const client = row.client?.trim() || options.batchMetadata.client || undefined;
    const campaign =
      row.campaign?.trim() || options.batchMetadata.campaign || undefined;

    items.push({
      id: createBatchItemId(row.id),
      sourceRow: row.sourceRow,
      platform,
      platformSource,
      caption,
      altText,
      altTextSource: altText.trim() ? "user" : "none",
      image: null,
      imageFilename,
      contentName: row.content_name,
      client,
      campaign,
      notes: row.notes,
      validation: {
        severity,
        messages: validationMessages,
        canAnalyze: true,
      },
      ai: {
        status: "not_run",
        analysis: null,
        fingerprint: null,
      },
      remediation: defaultBatchRemediationState(),
      visualStatus: { contrast: "not_checked" },
      humanReviewItems: [],
      rowReview: {
        altTextVerified: false,
        imageTextVerified: false,
        platformPublishingReviewed: false,
      },
      overallStatus: "Incomplete",
      processingState: "unprocessed",
      importWarnings,
    });
  }

  return { items, errors };
}

function createInvalidItem(
  row: BatchCsvRow,
  message: string,
): BatchAccessibilityItem {
  return {
    id: createBatchItemId(row.id),
    sourceRow: row.sourceRow,
    platform: null,
    platformSource: "unspecified",
    caption: row.caption ?? "",
    altText: row.alt_text ?? "",
    altTextSource: "none",
    image: null,
    imageFilename: row.image_filename,
    validation: {
      severity: "invalid",
      messages: [message],
      canAnalyze: false,
    },
    ai: { status: "not_run", analysis: null, fingerprint: null },
    remediation: defaultBatchRemediationState(),
    visualStatus: { contrast: "not_checked" },
    humanReviewItems: [],
    rowReview: {
      altTextVerified: false,
      imageTextVerified: false,
      platformPublishingReviewed: false,
    },
    overallStatus: "Failed",
    processingState: "failed",
    importWarnings: [message],
  };
}
