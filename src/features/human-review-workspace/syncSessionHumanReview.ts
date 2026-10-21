import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { AccessibilityWorkspaceState } from "@/features/accessibility-workspace/types";
import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { ManualReviewEntry } from "@/features/website-scanner/types/websiteSession";
import { collectPageScanResults } from "@/features/website-scanner/utils/collectPageScanResults";
import { createInitialAccessibilityWorkspace } from "@/features/accessibility-workspace/createInitialWorkspace";
import { buildHumanReviewProgress } from "@/features/human-review-workspace/buildHumanReviewProgress";
import {
  applyHumanReviewStatusUpdate,
  ensureHumanReviewRecords,
} from "@/features/human-review-workspace/ensureHumanReviewRecords";

export function syncSessionHumanReview(input: {
  session: WebsiteScanSessionState;
  completedPages: WebsitePageScanResult[];
  intel: SiteScanIntelligence | null;
}): {
  workspace: AccessibilityWorkspaceState;
  humanReviewOpenCount: number;
} {
  const ws = input.session.accessibilityWorkspace ?? {
    workspaceId: "",
    createdAt: "",
    updatedAt: "",
    contributions: [],
    returnToFinding: null,
    humanReviewRecords: [],
  };
  const records = ensureHumanReviewRecords({
    records: ws.humanReviewRecords ?? [],
    manualReview: input.session.manualReview,
    completedPages: input.completedPages,
    intel: input.intel,
    contributions: ws.contributions,
    urlsSelected: input.session.scanScope.urlsSelected,
  });
  const progress = buildHumanReviewProgress(records);
  return {
    workspace: {
      ...ws,
      humanReviewRecords: records,
      updatedAt: new Date().toISOString(),
    },
    humanReviewOpenCount: progress.remainingOpen,
  };
}

export function patchManualReviewAndRecords(
  session: WebsiteScanSessionState,
  itemId: string,
  status: ManualReviewEntry["status"],
  note?: string,
): AccessibilityWorkspaceState {
  const ws =
    session.accessibilityWorkspace ?? createInitialAccessibilityWorkspace();
  const patched = applyHumanReviewStatusUpdate(
    ws.humanReviewRecords ?? [],
    itemId,
    status,
    note,
  );
  const completedPages = collectPageScanResults(
    session.pages.filter((p) => p.status === "complete"),
  );
  const records = ensureHumanReviewRecords({
    records: patched,
    manualReview: session.manualReview,
    completedPages,
    intel: session.siteIntelligence,
    contributions: ws.contributions,
    urlsSelected: session.scanScope.urlsSelected,
  });
  return {
    ...ws,
    humanReviewRecords: records,
    updatedAt: new Date().toISOString(),
  };
}
