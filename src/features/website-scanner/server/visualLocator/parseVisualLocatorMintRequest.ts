import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";
import type { ScanViewportId } from "@/features/website-scanner/constants/viewports";
import { validateAxeTargetBounds } from "@/features/website-scanner/server/visualLocator/validateAxeTargetBounds";
import { isNodeVisuallyLocatable } from "@/features/website-scanner/utils/visualLocator/isFindingVisuallyLocatable";

const MAX_URL_LENGTH = 2048;

export type ParsedVisualLocatorMint = {
  url: string;
  viewportId: ScanViewportId;
  ruleId: string;
  issueFingerprint: string;
  target: unknown;
  selectorLabel: string;
  domSignature?: string;
  occurrenceIndex: number;
  occurrenceTotal: number;
  ruleTitle: string;
};

export function parseVisualLocatorMintRequest(
  body: unknown,
): ParsedVisualLocatorMint | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body." };
  }
  const r = body as Record<string, unknown>;
  const url = typeof r.url === "string" ? r.url.trim() : "";
  if (!url || url.length > MAX_URL_LENGTH) {
    return { error: "Invalid page URL." };
  }
  const viewportRaw = r.viewportId === "mobile" ? "mobile" : "desktop";
  if (!SCAN_VIEWPORTS[viewportRaw]) {
    return { error: "Unsupported viewport." };
  }
  const ruleId = typeof r.ruleId === "string" ? r.ruleId.trim() : "";
  if (!ruleId || ruleId.length > 128) {
    return { error: "Invalid rule." };
  }
  const issueFingerprint =
    typeof r.issueFingerprint === "string" ? r.issueFingerprint.trim() : "";
  if (!issueFingerprint || issueFingerprint.length > 64) {
    return { error: "Invalid issue reference." };
  }
  const selectorLabel =
    typeof r.selectorLabel === "string" ? r.selectorLabel.trim() : "";
  const target = r.target;
  const bounds = validateAxeTargetBounds(target, selectorLabel);
  if (!bounds.ok) return { error: bounds.error };
  if (!isNodeVisuallyLocatable({ ruleId, target, selectorLabel })) {
    return { error: "This issue does not support visual location." };
  }
  const occurrenceIndex =
    typeof r.occurrenceIndex === "number" ? r.occurrenceIndex : 0;
  const occurrenceTotal =
    typeof r.occurrenceTotal === "number" ? r.occurrenceTotal : 1;
  if (occurrenceIndex < 0 || occurrenceTotal < 1 || occurrenceIndex >= occurrenceTotal) {
    return { error: "Invalid occurrence index." };
  }
  const ruleTitle =
    typeof r.ruleTitle === "string" ? r.ruleTitle.trim().slice(0, 200) : ruleId;
  const domSignature =
    typeof r.domSignature === "string" ? r.domSignature.slice(0, 256) : undefined;

  return {
    url,
    viewportId: viewportRaw,
    ruleId,
    issueFingerprint,
    target,
    selectorLabel,
    domSignature,
    occurrenceIndex,
    occurrenceTotal,
    ruleTitle,
  };
}
