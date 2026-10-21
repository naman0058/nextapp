"use client";

import { useEffect, useMemo, useState } from "react";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { buildHumanReviewProgress } from "@/features/human-review-workspace/buildHumanReviewProgress";
import { isCheckInRelevantQueue } from "@/features/human-review-workspace/applicability";
import type { HumanReviewStatus } from "@/features/human-review-workspace/types";
import { HUMAN_REVIEW_REGISTRY_V1 } from "@/features/human-review-workspace/registry/v1";
import { ensureHumanReviewRecords } from "@/features/human-review-workspace/ensureHumanReviewRecords";
type Props = { completedPages: WebsitePageScanResult[]; sampleMode?: boolean };

type StatusFilter = "all" | HumanReviewStatus;

export function HumanReviewWorkspacePanel({
  completedPages,
  sampleMode,
}: Props) {
  const { state, dispatch } = useWebsiteScanSession();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [liveMsg, setLiveMsg] = useState("");

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
  const showAll = state.showAllManualChecks;

  const queue = useMemo(() => {
    let list = showAll ? records : records.filter((r) => isCheckInRelevantQueue(r.applicability));
    if (statusFilter !== "all") list = list.filter((r) => r.status === statusFilter);
    if (categoryFilter !== "all")
      list = list.filter((r) => r.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.checkDefinitionId.toLowerCase().includes(q),
      );
    }
    const order: Record<HumanReviewStatus, number> = {
      needs_review: 0,
      not_reviewed: 1,
      passes: 2,
      not_applicable: 3,
    };
    return [...list].sort((a, b) => order[a.status] - order[b.status]);
  }, [records, showAll, statusFilter, categoryFilter, search]);

  const allReviewed =
    progress.relevant > 0 && progress.notReviewed === 0 && progress.needsReview === 0;

  useEffect(() => {
    const id = state.highlightHumanReviewCheckId;
    if (!id) return;
    const el = document.getElementById(`hr-check-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [state.highlightHumanReviewCheckId, queue.length]);

  function setStatus(checkDefinitionId: string, status: HumanReviewStatus, note?: string) {
    if (sampleMode) return;
    dispatch({
      type: "SET_MANUAL_REVIEW",
      itemId: checkDefinitionId,
      status,
      note,
    });
    setLiveMsg(`Review status saved: ${status.replace("_", " ")}. Reviewed in this session.`);
  }

  return (
    <div className="space-y-4">
      <section aria-labelledby="hr-progress-heading" className="rounded-lg border border-border p-4">
        <h3 id="hr-progress-heading" className="font-semibold">
          Human review progress
        </h3>
        <p className="mt-1 text-sm text-muted">
          {progress.reviewed} of {progress.relevant} relevant checks reviewed ·{" "}
          {progress.remainingOpen} remaining open
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
          <div>
            <dt className="text-muted">Relevant</dt>
            <dd className="font-medium">{progress.relevant}</dd>
          </div>
          <div>
            <dt className="text-muted">Passes</dt>
            <dd className="font-medium">{progress.passes}</dd>
          </div>
          <div>
            <dt className="text-muted">Needs review</dt>
            <dd className="font-medium">{progress.needsReview}</dd>
          </div>
          <div>
            <dt className="text-muted">Not applicable</dt>
            <dd className="font-medium">{progress.notApplicable}</dd>
          </div>
          <div>
            <dt className="text-muted">Not reviewed</dt>
            <dd className="font-medium">{progress.notReviewed}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-muted">
          Progress reflects workflow completion, not a compliance score.
        </p>
      </section>

      {allReviewed ? (
        <p className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
          All currently identified human-review procedures have been reviewed. This does not
          constitute accessibility certification.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 text-sm">
        <label className="flex items-center gap-1">
          Status
          <select
            className="rounded border border-border bg-background px-2 py-1 text-xs"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <option value="all">All</option>
            <option value="not_reviewed">Not reviewed</option>
            <option value="needs_review">Needs review</option>
            <option value="passes">Passes</option>
            <option value="not_applicable">N/A</option>
          </select>
        </label>
        <label className="flex items-center gap-1">
          Category
          <select
            className="rounded border border-border bg-background px-2 py-1 text-xs"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All</option>
            {[...new Set(HUMAN_REVIEW_REGISTRY_V1.map((d) => d.category))].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 min-w-[12rem] items-center gap-1">
          Search
          <input
            type="search"
            className="w-full rounded border border-border px-2 py-1 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {!sampleMode && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) =>
              dispatch({
                type: "SET_SHOW_ALL_MANUAL_CHECKS",
                value: e.target.checked,
              })
            }
          />
          Show all registry checks (including not applicable / unknown)
        </label>
      )}

      <ul className="space-y-4">
        {queue.map((record) => (
          <li
            id={`hr-check-${record.checkDefinitionId}`}
            key={record.reviewId}
            className="rounded-lg border border-border p-4 text-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="font-semibold">{record.title}</h4>
              <span className="rounded bg-muted px-2 py-0.5 text-xs capitalize">
                {record.applicability.replace("_", " ")}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">{record.category}</p>
            <section className="mt-2" aria-labelledby={`why-${record.reviewId}`}>
              <h5 id={`why-${record.reviewId}`} className="text-xs font-semibold">
                Why human review is needed
              </h5>
              <p className="text-muted">{record.whyHumanReviewRequired}</p>
            </section>
            <section className="mt-2" aria-labelledby={`proc-${record.reviewId}`}>
              <h5 id={`proc-${record.reviewId}`} className="text-xs font-semibold">
                Procedure
              </h5>
              <ol className="list-decimal pl-5 text-muted">
                {record.procedureSteps.map((s) => (
                  <li key={s.slice(0, 48)}>{s}</li>
                ))}
              </ol>
            </section>
            {record.applicableScope.representativeLabel ? (
              <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
                {record.applicableScope.representativeLabel}
              </p>
            ) : null}
            {record.relatedFindingIds.length > 0 && (
              <p className="mt-2 text-xs">
                Related automated finding IDs: {record.relatedFindingIds.join(", ")}
              </p>
            )}
            {record.relatedIncompleteRuleIds && record.relatedIncompleteRuleIds.length > 0 && (
              <p className="mt-1 text-xs text-muted">
                Related automated uncertainty: {record.relatedIncompleteRuleIds.join(", ")}
              </p>
            )}
            {record.relatedContributionIds.length > 0 && (
              <p className="mt-1 text-xs text-muted">
                Specialized evidence available ({record.relatedContributionIds.length}) — does
                not auto-complete this review.
              </p>
            )}
            <fieldset className="mt-3" disabled={sampleMode}>
              <legend className="text-xs font-semibold">Human review result</legend>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    ["not_reviewed", "Not reviewed"],
                    ["passes", "Passes"],
                    ["needs_review", "Needs review"],
                    ["not_applicable", "N/A"],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name={`hr-${record.reviewId}`}
                      checked={record.status === value}
                      onChange={() => setStatus(record.checkDefinitionId, value, record.notes)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="mt-2 block text-xs font-medium">
              Review notes
              <textarea
                className="mt-1 w-full rounded border border-border bg-background p-2 text-sm"
                rows={2}
                disabled={sampleMode}
                value={record.notes ?? ""}
                onChange={(e) =>
                  setStatus(record.checkDefinitionId, record.status, e.target.value)
                }
              />
            </label>
            {record.relatedFindingIds[0] && !sampleMode && (
              <button
                type="button"
                className="mt-2 text-xs font-medium text-primary underline"
                onClick={() =>
                  dispatch({
                    type: "FOCUS_FINDING",
                    findingId: record.relatedFindingIds[0]!,
                  })
                }
              >
                Open related automated finding
              </button>
            )}
          </li>
        ))}
      </ul>

      {liveMsg ? (
        <p className="text-sm" role="status" aria-live="polite">
          {liveMsg}
        </p>
      ) : null}
    </div>
  );
}
