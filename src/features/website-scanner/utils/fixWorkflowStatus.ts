import type { RootCauseGroup } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type {
  DisplayFixTaskStatus,
  UserFixTaskStatus,
} from "@/features/website-scanner/types/resultUx";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { compareScanSnapshots } from "@/features/website-scanner/utils/compareScanSnapshots";

export function resolveDisplayFixStatus(input: {
  taskKey: string;
  userStatus: UserFixTaskStatus;
  ruleId: string;
  previousSnapshot: WebsitePageScanResult[] | null;
  currentPages: WebsitePageScanResult[];
  rootCauseGroup?: RootCauseGroup;
}): DisplayFixTaskStatus {
  const { userStatus, ruleId, previousSnapshot, currentPages, rootCauseGroup } =
    input;

  if (previousSnapshot && previousSnapshot.length > 0) {
    const comparison = compareScanSnapshots(previousSnapshot, currentPages);
    const ruleRows = comparison.rows.filter((r) => r.ruleId === ruleId);
    const resolved = ruleRows.filter((r) => r.status === "resolved").length;
    const persistent = ruleRows.filter(
      (r) => r.status === "persistent" || r.status === "changed",
    ).length;
    const changed = ruleRows.filter((r) => r.status === "changed").length;

    if (rootCauseGroup) {
      const prevOcc = estimatePreviousOccurrences(
        previousSnapshot,
        rootCauseGroup.ruleId,
      );
      const nowOcc = rootCauseGroup.totalOccurrences;
      if (prevOcc > 0 && nowOcc === 0 && resolved > 0) {
        return "Verified by Rescan";
      }
      if (prevOcc > nowOcc && nowOcc > 0) {
        return "Partially Improved";
      }
    }

    if (resolved > 0 && persistent === 0 && changed === 0) {
      return "Verified by Rescan";
    }
    if (resolved > 0 && (persistent > 0 || changed > 0)) {
      return "Partially Improved";
    }
    if (persistent > 0 || changed > 0) {
      return "Still Present";
    }
  }

  if (userStatus === "user_marked_fixed") return "User Marked Fixed";
  if (userStatus === "in_review") return "In Review";
  return "Not Started";
}

function estimatePreviousOccurrences(
  previous: WebsitePageScanResult[],
  ruleId: string,
): number {
  let n = 0;
  for (const page of previous) {
    for (const v of page.violations) {
      if (v.id === ruleId) n += v.totalNodeCount;
    }
  }
  return n;
}

export function formatFixPlanPlainText(
  items: {
    rank: number;
    title: string;
    priority: string;
    affectedElements: number;
    affectedPages: number;
  }[],
): string {
  return items
    .map(
      (i) =>
        `${i.rank}. ${i.title} — ${i.priority} — ${i.affectedElements} elements / ${i.affectedPages} pages`,
    )
    .join("\n");
}
