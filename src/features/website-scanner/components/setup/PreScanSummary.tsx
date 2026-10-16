"use client";

import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";

export function PreScanSummary() {
  const { state } = useWebsiteScanSession();
  const patterns = state.urlPatternGroups.filter((g) =>
    g.representativeUrls.some((u) =>
      state.selectedUrlKeys.includes(
        state.discoveredUrls.find((d) => d.url === u)?.normalizedKey ?? "",
      ),
    ),
  ).length;
  return (
    <div className="rounded-lg bg-muted/30 p-3 text-sm">
      <p>
        <strong>{state.selectedUrlKeys.length}</strong> page(s) selected ·{" "}
        <strong>{patterns}</strong> URL pattern(s) represented ·{" "}
        <strong>
          {Math.max(0, state.discoveredUrls.length - state.selectedUrlKeys.length)}
        </strong>{" "}
        discovered URL(s) not included
      </p>
      <p className="mt-1 text-muted">
        Estimated browser page evaluations:{" "}
        {state.scanWorkload.totalPageEvaluations || state.selectedUrlKeys.length}
        {state.viewportMode === "compare" &&
          ` (${state.selectedUrlKeys.length} pages × 2 viewports)`}
      </p>
    </div>
  );
}
