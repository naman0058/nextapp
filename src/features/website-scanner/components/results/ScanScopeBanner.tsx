"use client";

import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";

const SOURCE_LABEL: Record<string, string> = {
  current: "Current page",
  crawl: "Crawl discovery",
  sitemap: "Sitemap",
  mixed: "Mixed",
};

export function ScanScopeBanner() {
  const { state } = useWebsiteScanSession();
  const scope = state.scanScope;
  const viewportLabel =
    state.viewportMode === "compare"
      ? "Desktop + Mobile (compared)"
      : state.viewportMode === "mobile"
        ? "Mobile viewport"
        : "Desktop";
  return (
    <div className="rounded-lg border border-border bg-background p-4 text-sm">
      <h3 className="font-semibold">Scan scope</h3>
      <dl className="mt-2 grid gap-1 sm:grid-cols-2">
        <div>
          <dt className="text-muted">Source</dt>
          <dd>{SOURCE_LABEL[scope.discoverySource] ?? scope.discoverySource}</dd>
        </div>
        <div>
          <dt className="text-muted">Viewport</dt>
          <dd>{viewportLabel}</dd>
        </div>
        <div>
          <dt className="text-muted">URLs discovered</dt>
          <dd>{scope.urlsDiscovered}</dd>
        </div>
        <div>
          <dt className="text-muted">URLs selected</dt>
          <dd>{scope.urlsSelected}</dd>
        </div>
        <div>
          <dt className="text-muted">Pages successfully scanned</dt>
          <dd>{scope.pagesCompleted}</dd>
        </div>
        <div>
          <dt className="text-muted">URLs not scanned in this review</dt>
          <dd>{scope.urlsNotScanned}</dd>
        </div>
      </dl>
      {scope.urlsDiscovered > scope.urlsSelected && (
        <p className="mt-2 text-xs text-muted">
          {scope.pagesCompleted} page(s) scanned · {scope.urlsDiscovered} URL(s)
          discovered · {Math.max(0, scope.urlsDiscovered - scope.pagesCompleted)}{" "}
          not scanned in this review. This is not a full-site audit.
        </p>
      )}
      {(state.status === "partial" || state.status === "stopping") && (
        <p className="mt-2 font-medium text-amber-800" role="alert">
          Partial scan — completed {scope.pagesCompleted} of {scope.urlsSelected}{" "}
          selected page(s).
        </p>
      )}
    </div>
  );
}
