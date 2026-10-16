import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import type {
  BatchFilterId,
  BatchSortState,
} from "@/features/batch/types/batchSession";
import type { SocialPlatform } from "@/types";

export function filterBatchItems(
  items: BatchAccessibilityItem[],
  filter: BatchFilterId,
  platformFilter: SocialPlatform | "all",
  searchQuery: string,
): BatchAccessibilityItem[] {
  const q = searchQuery.trim().toLowerCase();
  return items.filter((item) => {
    if (platformFilter !== "all" && item.platform !== platformFilter) {
      return false;
    }
    if (q) {
      const hay = [
        item.id,
        item.contentName,
        item.client,
        item.campaign,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    switch (filter) {
      case "ready":
        return item.overallStatus === "Ready for Review";
      case "review":
        return item.overallStatus === "Needs Review";
      case "attention":
        return item.overallStatus === "Attention Required";
      case "failed":
        return item.overallStatus === "Failed";
      case "has_image":
        return Boolean(item.image?.file?.size);
      case "missing_alt":
        return Boolean(item.image?.file?.size) && !item.altText.trim();
      case "ai_not_run":
        return item.ai.status === "not_run" || item.ai.status === "stale";
      case "ai_completed":
        return item.ai.status === "success";
      case "image_missing":
        return Boolean(item.imageFilename) && !item.image?.file?.size;
      default:
        return true;
    }
  });
}

export function sortBatchItems(
  items: BatchAccessibilityItem[],
  sort: BatchSortState,
): BatchAccessibilityItem[] {
  const dir = sort.direction === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    switch (sort.field) {
      case "platform":
        return (
          (a.platform ?? "").localeCompare(b.platform ?? "") * dir
        );
      case "score":
        return (
          ((a.localAnalysis?.phase1.score ?? -1) -
            (b.localAnalysis?.phase1.score ?? -1)) *
          dir
        );
      case "status":
        return a.overallStatus.localeCompare(b.overallStatus) * dir;
      case "issue_count":
        return (
          ((a.localAnalysis?.issueCount ?? 0) -
            (b.localAnalysis?.issueCount ?? 0)) *
          dir
        );
      case "human_review":
        return (
          ((a.humanReviewItems.length ?? 0) -
            (b.humanReviewItems.length ?? 0)) *
          dir
        );
      case "id":
      default:
        return a.id.localeCompare(b.id) * dir;
    }
  });
}

export function paginateBatchItems<T>(
  items: T[],
  page: number,
  pageSize: number,
): { pageItems: T[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    pageItems: items.slice(start, start + pageSize),
    totalPages,
  };
}
