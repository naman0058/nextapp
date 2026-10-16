import "server-only";

import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";
import { VISUAL_LOCATOR_TOKEN_TTL_SECONDS } from "@/features/website-scanner/constants/visualLocatorLimits";
import type { VisualLocatorPayload } from "@/features/website-scanner/types/visualLocator";
import type { ParsedVisualLocatorMint } from "@/features/website-scanner/server/visualLocator/parseVisualLocatorMintRequest";

export function buildVisualLocatorPayload(
  mint: ParsedVisualLocatorMint,
): VisualLocatorPayload {
  const issuedAt = Date.now();
  return {
    version: 1,
    url: mint.url,
    viewport: SCAN_VIEWPORTS[mint.viewportId],
    ruleId: mint.ruleId,
    issueFingerprint: mint.issueFingerprint,
    target: mint.target,
    selectorLabel: mint.selectorLabel,
    domSignature: mint.domSignature,
    occurrenceIndex: mint.occurrenceIndex,
    occurrenceTotal: mint.occurrenceTotal,
    ruleTitle: mint.ruleTitle,
    issuedAt,
    expiresAt: issuedAt + VISUAL_LOCATOR_TOKEN_TTL_SECONDS * 1000,
  };
}
