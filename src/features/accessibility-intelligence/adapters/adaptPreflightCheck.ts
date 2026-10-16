import type { AccessibilityCheckResult } from "@/features/accessibility/types/preflight";
import type { NormalizedAccessibilityFinding } from "@/features/accessibility-intelligence/types/normalizedFinding";
import type { AccessibilityEvidence } from "@/features/accessibility-intelligence/types/evidence";

function mapStatus(
  status: AccessibilityCheckResult["status"],
): NormalizedAccessibilityFinding["status"] {
  switch (status) {
    case "pass":
      return "pass";
    case "fail":
      return "issue";
    case "review":
      return "review";
    case "not_checked":
      return "not_checked";
    default:
      return "not_checked";
  }
}

function mapImpact(
  severity: AccessibilityCheckResult["severity"],
): NormalizedAccessibilityFinding["impact"] {
  if (severity === "error") return "serious";
  if (severity === "warning") return "moderate";
  return "minor";
}

export function adaptPreflightCheck(
  check: AccessibilityCheckResult,
): NormalizedAccessibilityFinding {
  const evidence: AccessibilityEvidence = {
    sourceType: "deterministic_rule",
    sourceId: check.id,
    engine: "phase1-preflight",
    evidenceText: check.summary,
    confidenceCategory: "deterministic",
  };
  return {
    id: `preflight::${check.id}`,
    sourceType: "deterministic_rule",
    category: check.category,
    title: check.title,
    status: mapStatus(check.status),
    impact: mapImpact(check.severity),
    priority: check.severity === "error" ? "high" : "medium",
    confidence: "high",
    description: check.summary,
    recommendation: check.recommendation,
    evidence: [evidence],
    humanReviewRequired: check.status === "review",
    ruleId: check.id,
  };
}
