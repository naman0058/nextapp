import { createHash } from "node:crypto";
import type { LandmarkContext } from "@/features/website-scanner/types/scanTypes";
import { normalizeSelectorForGrouping } from "@/features/accessibility-intelligence/grouping/normalizeSelectorForGrouping";

export function buildDomSignature(input: {
  ruleId: string;
  selectorLabel: string;
  tag?: string;
  role?: string;
  stableClasses?: string[];
  landmark?: LandmarkContext;
}): string {
  const normalized = normalizeSelectorForGrouping(input.selectorLabel);
  const classes = (input.stableClasses ?? []).slice(0, 5).sort().join(",");
  const payload = [
    input.ruleId,
    input.tag ?? "",
    input.role ?? "",
    classes,
    input.landmark ?? "unknown",
    normalized,
  ].join("|");
  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}
