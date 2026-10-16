import type {
  ScanCompletenessLevel,
  WebsitePageScanResult,
} from "@/features/website-scanner/types/scanTypes";

export function aggregateScanCompleteness(
  pages: WebsitePageScanResult[],
): ScanCompletenessLevel {
  if (pages.some((p) => p.scanCompleteness === "failed")) return "failed";
  if (pages.some((p) => p.scanCompleteness === "partial")) return "partial";
  if (pages.some((p) => p.scanCompleteness === "limited")) return "limited";
  return "complete";
}

export function scanCompletenessLabel(level: ScanCompletenessLevel): string {
  switch (level) {
    case "complete":
      return "Complete";
    case "partial":
      return "Partial";
    case "limited":
      return "Limited";
    case "failed":
      return "Failed";
    default:
      return level;
  }
}
