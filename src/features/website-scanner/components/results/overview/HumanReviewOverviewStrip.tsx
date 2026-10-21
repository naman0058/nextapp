"use client";

import { useMemo } from "react";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import { buildHumanReviewProgress } from "@/features/human-review-workspace/buildHumanReviewProgress";
import { ensureHumanReviewRecords } from "@/features/human-review-workspace/ensureHumanReviewRecords";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

type Props = { completedPages: WebsitePageScanResult[] };

export function HumanReviewOverviewStrip({ completedPages }: Props) {
  const { state, dispatch } = useWebsiteScanSession();
  const records = useMemo(
    () =>
      ensureHumanReviewRecords({
        records: state.accessibilityWorkspace.humanReviewRecords ?? [],
        manualReview: state.manualReview,
        completedPages,
        intel: state.siteIntelligence,
        contributions: state.accessibilityWorkspace.contributions,
        urlsSelected: state.scanScope.urlsSelected,
      }),
    [
      state.accessibilityWorkspace.humanReviewRecords,
      state.manualReview,
      completedPages,
      state.siteIntelligence,
      state.accessibilityWorkspace.contributions,
      state.scanScope.urlsSelected,
    ],
  );
  const progress = useMemo(() => buildHumanReviewProgress(records), [records]);

  if (records.length === 0 && completedPages.length === 0) return null;

  return (
    <section
      aria-labelledby="overview-hr-heading"
      className="rounded-lg border border-border p-4"
    >
      <h3 id="overview-hr-heading" className="font-semibold">
        Human review
      </h3>
      <p className="mt-1 text-sm text-muted">
        {progress.reviewed} of {progress.relevant} relevant checks reviewed ·{" "}
        {progress.remainingOpen} remaining open
      </p>
      <button
        type="button"
        className="mt-2 rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary"
        onClick={() => {
          dispatch({ type: "SET_RESULT_VIEW", view: "human-review" });
          dispatch({
            type: "SET_SHOW_ALL_MANUAL_CHECKS",
            value: false,
          });
        }}
      >
        Open human review workspace
      </button>
    </section>
  );
}
