"use client";

import { useMemo } from "react";
import { buildRelevantManualReviews } from "@/features/accessibility-intelligence/manual/manualReviewRelevance";
import { MANUAL_REVIEW_LIBRARY } from "@/features/accessibility-intelligence/manual/manualReviewLibrary";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { ManualReviewStatus } from "@/features/website-scanner/types/websiteSession";
import { mergePageMetadata } from "@/features/website-scanner/utils/issuesListUtils";

type Props = { completedPages: WebsitePageScanResult[]; sampleMode?: boolean };

export function HumanReviewTab({ completedPages, sampleMode }: Props) {
  const { state, dispatch, sampleMode: ctxSample } = useWebsiteScanSession();
  const isSample = sampleMode ?? ctxSample;
  const metadata = useMemo(
    () => mergePageMetadata(completedPages),
    [completedPages],
  );

  const relevant = useMemo(
    () =>
      buildRelevantManualReviews(metadata).filter(
        (r) => r.relevance !== "not_applicable",
      ),
    [metadata],
  );

  const items = state.showAllManualChecks
    ? MANUAL_REVIEW_LIBRARY.map((def) => ({
        ...def,
        relevance: "medium" as const,
      }))
    : relevant;

  const reviewedCount = items.filter((item) => {
    const entry = state.manualReview.find((m) => m.itemId === item.id);
    return entry && entry.status !== "not_reviewed";
  }).length;

  function statusFor(id: string): ManualReviewStatus {
    return (
      state.manualReview.find((m) => m.itemId === id)?.status ?? "not_reviewed"
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Progress: {reviewedCount} of {items.length} relevant checks reviewed.
        Keyboard, zoom, and media checks still need human judgment.
      </p>
      {isSample ? (
        <p className="rounded-lg border border-amber-600/40 bg-amber-50 p-3 text-sm dark:bg-amber-950/20">
          Manual review statuses shown below are fictional sample values for demonstration only.
        </p>
      ) : (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={state.showAllManualChecks}
            onChange={(e) =>
              dispatch({
                type: "SET_SHOW_ALL_MANUAL_CHECKS",
                value: e.target.checked,
              })
            }
          />
          Show all manual checks (not just relevant)
        </label>
      )}
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-border p-4 text-sm"
          >
            <h4 className="font-semibold">{item.title}</h4>
            <p className="mt-1 text-muted">{item.whyHumanReview}</p>
            <ol className="mt-2 list-decimal pl-5 text-muted">
              {item.testSteps.map((s) => (
                <li key={s.slice(0, 40)}>{s}</li>
              ))}
            </ol>
            <fieldset className="mt-3" disabled={isSample}>
              <legend className="sr-only">Review status for {item.title}</legend>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    ["not_reviewed", "Not reviewed"],
                    ["passes", "Passes"],
                    ["needs_review", "Needs review"],
                    ["not_applicable", "N/A"],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name={`manual-${item.id}`}
                      checked={statusFor(item.id) === value}
                      readOnly={isSample}
                      onChange={() =>
                        dispatch({
                          type: "SET_MANUAL_REVIEW",
                          itemId: item.id,
                          status: value,
                        })
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          </li>
        ))}
      </ul>
    </div>
  );
}
