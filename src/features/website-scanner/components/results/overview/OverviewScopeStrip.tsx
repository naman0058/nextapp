"use client";

import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";

const SOURCE_LABEL: Record<string, string> = {
  current: "Current page",
  crawl: "Crawl",
  sitemap: "Sitemap",
  mixed: "Mixed",
};

export function OverviewScopeStrip() {
  const { state } = useWebsiteScanSession();
  const scope = state.scanScope;
  const viewportLabel =
    state.viewportMode === "compare"
      ? "Desktop + Mobile"
      : state.viewportMode === "mobile"
        ? "Mobile"
        : "Desktop";

  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs sm:text-sm">
      <p className="font-medium">Scan scope</p>
      <p className="mt-1 text-muted">
        {SOURCE_LABEL[scope.discoverySource] ?? scope.discoverySource} ·{" "}
        {viewportLabel} · Selected {scope.urlsSelected} · Scanned{" "}
        {scope.pagesCompleted}
        {scope.urlsNotScanned > 0 && ` · Not scanned ${scope.urlsNotScanned}`}
        {scope.urlsDiscovered > 0 &&
          scope.urlsDiscovered !== scope.urlsSelected &&
          ` · Discovered ${scope.urlsDiscovered}`}
      </p>
    </div>
  );
}
