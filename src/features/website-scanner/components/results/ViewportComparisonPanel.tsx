"use client";

import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";

export function ViewportComparisonPanel() {
  const { state } = useWebsiteScanSession();
  const summary = state.viewportComparisonSummary;
  if (state.viewportMode !== "compare" || !summary) {
    return null;
  }
  return (
    <section className="rounded-lg border border-border p-4 text-sm">
      <h3 className="font-semibold">Desktop vs mobile</h3>
      {summary.limitedComparison && (
        <p className="mt-1 text-amber-800">Limited comparison — one or more pages scanned partially.</p>
      )}
      <ul className="mt-2 grid gap-1 sm:grid-cols-2">
        <li>Pages compared: {summary.pagesCompared}</li>
        <li>Issues in both: {summary.issuesInBoth}</li>
        <li>Desktop-only: {summary.desktopOnly}</li>
        <li>Mobile-only: {summary.mobileOnly}</li>
        <li>Changed occurrence counts: {summary.changedOccurrenceCounts}</li>
      </ul>
    </section>
  );
}
