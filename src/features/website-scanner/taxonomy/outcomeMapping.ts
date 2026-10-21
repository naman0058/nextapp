import type {
  AxeEngineBucket,
  ScanResultOutcome,
  ScanResultSource,
} from "@/features/website-scanner/taxonomy/types";

export function sourceForRule(isBestPractice: boolean): ScanResultSource {
  return isBestPractice ? "AXE_BEST_PRACTICE" : "AXE_WCAG";
}

export function outcomeFromAxeBucket(
  bucket: AxeEngineBucket,
  options: {
    isBestPractice: boolean;
    excludedFromViolations?: boolean;
    hasWcagFailureOnSamePage: boolean;
  },
): ScanResultOutcome {
  if (options.excludedFromViolations) {
    return "NOT_APPLICABLE";
  }
  switch (bucket) {
    case "violation":
      return options.isBestPractice ? "FAIL" : "FAIL";
    case "incomplete":
      return "INCOMPLETE";
    case "pass":
      return "PASS";
    case "inapplicable":
      return "NOT_APPLICABLE";
    default:
      return "NOT_APPLICABLE";
  }
}

export function includedInUserReport(outcome: ScanResultOutcome): boolean {
  return (
    outcome === "FAIL" ||
    outcome === "INCOMPLETE" ||
    outcome === "PASS" ||
    outcome === "NOT_APPLICABLE"
  );
}
