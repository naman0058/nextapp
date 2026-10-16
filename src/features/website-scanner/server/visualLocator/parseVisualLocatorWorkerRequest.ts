import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";
import { validateAxeTargetBounds } from "@/features/website-scanner/server/visualLocator/validateAxeTargetBounds";
import type { WebsiteVisualLocatorRequest } from "@/features/website-scanner/types/visualLocator";

export function parseVisualLocatorWorkerRequest(
  body: unknown,
): WebsiteVisualLocatorRequest | null {
  if (!body || typeof body !== "object") return null;
  const r = body as Record<string, unknown>;
  const url = typeof r.url === "string" ? r.url.trim() : "";
  if (!url) return null;
  const vp = r.viewport as { id?: string; width?: number; height?: number } | undefined;
  const id = vp?.id === "mobile" ? "mobile" : "desktop";
  const viewport = SCAN_VIEWPORTS[id];
  const ruleId = typeof r.ruleId === "string" ? r.ruleId : "";
  const selectorLabel = typeof r.selectorLabel === "string" ? r.selectorLabel : "";
  const target = r.target;
  const bounds = validateAxeTargetBounds(target, selectorLabel);
  if (!bounds.ok || !ruleId) return null;
  const occurrenceIndex =
    typeof r.occurrenceIndex === "number" ? r.occurrenceIndex : 0;
  const ruleTitle = typeof r.ruleTitle === "string" ? r.ruleTitle : ruleId;
  const domSignature =
    typeof r.domSignature === "string" ? r.domSignature : undefined;
  return {
    url,
    viewport,
    ruleId,
    target,
    selectorLabel,
    domSignature,
    occurrenceIndex,
    ruleTitle,
  };
}
