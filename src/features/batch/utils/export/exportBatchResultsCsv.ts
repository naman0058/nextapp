import Papa from "papaparse";
import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import { sanitizeCsvCellForSpreadsheet } from "@/features/batch/utils/export/sanitizeCsvCellForSpreadsheet";

export type BatchExportPrivacy = {
  includeCaptions: boolean;
  includeAltText: boolean;
  includeAiSuggestions: boolean;
  includeClientMetadata: boolean;
  includeInternalNotes: boolean;
};

export function buildBatchResultsCsv(
  items: BatchAccessibilityItem[],
  privacy: BatchExportPrivacy,
): string {
  const rows = items.map((item) => {
    const la = item.localAnalysis;
    const ai = item.ai.analysis;
    const row: Record<string, string | number> = {
      id: item.id,
      platform: item.platform ?? "",
      content_name: privacy.includeClientMetadata
        ? (item.contentName ?? "")
        : "",
      client: privacy.includeClientMetadata ? (item.client ?? "") : "",
      campaign: privacy.includeClientMetadata ? (item.campaign ?? "") : "",
      caption: privacy.includeCaptions ? item.caption : "",
      alt_text: privacy.includeAltText ? item.altText : "",
      local_readiness_score: la?.phase1.score ?? "",
      overall_status: item.overallStatus,
      issue_count: la?.issueCount ?? "",
      caption_issue_count: la?.captionIssueCount ?? "",
      missing_alt_text:
        item.image?.file?.size && !item.altText.trim() ? "yes" : "no",
      screen_reader_summary: la?.screenReaderSummary.label ?? "",
      ai_review_status: item.ai.status,
      ai_image_purpose: privacy.includeAiSuggestions
        ? (ai?.imagePurpose ?? "")
        : "",
      ai_suggested_alt_text: privacy.includeAiSuggestions
        ? (ai?.suggestedAltText ?? "")
        : "",
      important_visible_text: privacy.includeAiSuggestions
        ? (ai?.visibleText.join("; ") ?? "")
        : "",
      human_review_count: item.humanReviewItems.length,
      contrast_status: item.visualStatus.contrast,
      platform_ready_count:
        la?.platformChecklist.filter((c) => c.status === "ready").length ?? "",
      platform_review_count:
        la?.platformChecklist.filter((c) => c.status === "review").length ?? "",
      notes: privacy.includeInternalNotes ? (item.notes ?? "") : "",
    };
    for (const key of Object.keys(row)) {
      const v = row[key];
      if (typeof v === "string") {
        row[key] = sanitizeCsvCellForSpreadsheet(v);
      }
    }
    return row;
  });

  return Papa.unparse(rows);
}

export function downloadBatchResultsCsv(
  items: BatchAccessibilityItem[],
  privacy: BatchExportPrivacy,
  filename = "batch-results.csv",
): void {
  const csv = buildBatchResultsCsv(items, privacy);
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
