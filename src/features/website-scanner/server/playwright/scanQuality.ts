import type {
  PageScanQuality,
  ScanCompletenessLevel,
  WebsitePageScanResult,
} from "@/features/website-scanner/types/scanTypes";

export function deriveScanCompleteness(input: {
  warnings: string[];
  domTooLarge?: boolean;
  networkBudgetExceeded: boolean;
  nodeEvidenceTruncated: boolean;
  scanTimeout: boolean;
}): ScanCompletenessLevel {
  if (input.scanTimeout || input.domTooLarge) return "failed";
  if (
    input.networkBudgetExceeded ||
    input.nodeEvidenceTruncated ||
    input.warnings.some((w) => w.includes("incomplete"))
  ) {
    return "partial";
  }
  if (input.warnings.length > 0) return "limited";
  return "complete";
}

export function buildPageNodeReporting(
  violations: WebsitePageScanResult["violations"],
  examplesShown: number,
): { totalOccurrences: number; examplesShown: number; truncated: boolean } {
  const totalOccurrences = violations.reduce(
    (n, v) => n + v.totalNodeCount,
    0,
  );
  return {
    totalOccurrences,
    examplesShown,
    truncated: examplesShown < totalOccurrences,
  };
}

export function assembleScanQuality(input: {
  networkBudgetExceeded: boolean;
  domTooLarge: boolean;
  nodeEvidenceTruncated: boolean;
  iframeCount: number;
  lazyLimited: boolean;
  timings: {
    domContentLoadedMs?: number;
    settleMs?: number;
    axeDurationMs?: number;
    totalDurationMs?: number;
  };
  scanTimeout: boolean;
}): PageScanQuality {
  return {
    pageFullyLoaded: !input.scanTimeout,
    resourceBudgetExceeded: input.networkBudgetExceeded,
    domTruncated: input.domTooLarge,
    nodeEvidenceTruncated: input.nodeEvidenceTruncated,
    crossOriginFrameLimitations: input.iframeCount > 0,
    lazyContentSampling: input.lazyLimited ? "limited" : "completed",
    scanTimeout: input.scanTimeout,
    ...input.timings,
  };
}
