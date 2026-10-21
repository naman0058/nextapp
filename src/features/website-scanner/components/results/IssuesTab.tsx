"use client";

import { useEffect, useMemo, useState } from "react";
import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { ExplanationLevelToggle } from "@/features/website-scanner/components/results/ExplanationLevelToggle";
import { FindingDetailCard } from "@/features/website-scanner/components/results/FindingDetailCard";
import {
  ALL_PRODUCT_CATEGORIES,
  filterFindingDetails,
} from "@/features/website-scanner/findingDetail/filterFindingDetails";
import {
  groupFindingDetails,
  sortFindingDetails,
} from "@/features/website-scanner/findingDetail/groupFindingDetails";
import {
  DEFAULT_ISSUES_FILTER,
  type IssuesSortKey,
} from "@/features/website-scanner/utils/issuesListUtils";

type Props = {
  intel: SiteScanIntelligence | null;
  completedPages: WebsitePageScanResult[];
  sampleMode?: boolean;
};

export function IssuesTab({ intel, completedPages, sampleMode }: Props) {
  const { state, dispatch, sampleMode: ctxSample } = useWebsiteScanSession();
  const isSample = sampleMode ?? ctxSample;
  const showViewportFilter = state.viewportMode === "compare";
  const filter = state.issuesFilter;
  const setFilter = (
    next:
      | typeof DEFAULT_ISSUES_FILTER
      | ((prev: typeof DEFAULT_ISSUES_FILTER) => typeof DEFAULT_ISSUES_FILTER),
  ) => {
    const resolved = typeof next === "function" ? next(state.issuesFilter) : next;
    dispatch({ type: "SET_ISSUES_FILTER", filter: resolved });
  };
  const [sortKey, setSortKey] = useState<IssuesSortKey>("priority");

  const fixPlanRanks = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of intel?.fixPlan ?? []) {
      if (item.rootCauseGroupId) map.set(item.rootCauseGroupId, item.rank);
    }
    return map;
  }, [intel?.fixPlan]);

  const filteredDetails = useMemo(() => {
    const base = intel?.findingDetails ?? [];
    const filtered = filterFindingDetails(base, filter);
    return sortFindingDetails(filtered, sortKey, fixPlanRanks);
  }, [intel, filter, sortKey, fixPlanRanks]);

  const pageUrls = useMemo(
    () => [...new Set(completedPages.map((p) => p.finalUrl))],
    [completedPages],
  );

  const sharedRootCauseCount =
    intel?.summary.sharedRootCauses ?? intel?.summary.likelyRootCauses ?? 0;
  const rootCauseGroupByLabel =
    sharedRootCauseCount > 0 ? "Root cause" : "Remediation group";

  const grouped = useMemo(
    () => groupFindingDetails(filteredDetails, state.issuesGroupBy),
    [filteredDetails, state.issuesGroupBy],
  );

  function rootCauseFor(detail: (typeof filteredDetails)[0]) {
    if (!detail.remediationGroupId) return undefined;
    return intel?.rootCauseGroups.find((g) => g.id === detail.remediationGroupId);
  }

  const flatMode =
    state.issuesGroupBy === "root-cause" ||
    state.issuesGroupBy === "rule";

  useEffect(() => {
    if (!state.highlightFindingId) return;
    const el = document.getElementById(`finding-${state.highlightFindingId}`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [state.highlightFindingId, filteredDetails.length]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <fieldset>
          <legend className="text-sm font-medium">Group by</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {(
              [
                ["root-cause", rootCauseGroupByLabel],
                ["rule", "Rule"],
                ["page", "Page"],
                ["category", "Category"],
                ["wcag", "WCAG criterion"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={state.issuesGroupBy === id}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  state.issuesGroupBy === id
                    ? "border-primary bg-primary/10 font-semibold"
                    : "border-border"
                }`}
                onClick={() =>
                  dispatch({ type: "SET_ISSUES_GROUP_BY", groupBy: id })
                }
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
        <ExplanationLevelToggle
          level={state.explanationLevel}
          onChange={(level) =>
            dispatch({ type: "SET_EXPLANATION_LEVEL", level })
          }
        />
      </div>

      <details className="rounded-lg border border-border p-3 sm:hidden">
        <summary className="cursor-pointer font-medium">Filters</summary>
        <FilterControls
          filter={filter}
          setFilter={setFilter}
          pageUrls={pageUrls}
          sortKey={sortKey}
          setSortKey={setSortKey}
          showViewportFilter={showViewportFilter}
        />
      </details>
      <div className="hidden sm:block">
        <FilterControls
          filter={filter}
          setFilter={setFilter}
          pageUrls={pageUrls}
          sortKey={sortKey}
          setSortKey={setSortKey}
          showViewportFilter={showViewportFilter}
        />
      </div>

      {filteredDetails.length === 0 && (
        <p className="text-sm text-muted">No issues match your filters.</p>
      )}

      {flatMode && (
        <ul className="space-y-3">
          {filteredDetails.map((d) => (
            <FindingDetailCard
              key={`${state.issuesGroupBy}-${d.findingId}`}
              detail={d}
              level={state.explanationLevel}
              completedPages={completedPages}
              rootCauseGroup={rootCauseFor(d)}
              sampleMode={isSample}
              defaultExpanded={state.highlightFindingId === d.findingId}
            />
          ))}
        </ul>
      )}

      {!flatMode && (
        <ul className="space-y-4">
          {grouped.map((grp) => (
            <li key={grp.key}>
              <h4 className="break-all font-semibold">{grp.label}</h4>
              <ul className="mt-2 space-y-3">
                {grp.details.map((d) => (
                  <FindingDetailCard
                    key={`${grp.key}-${d.findingId}`}
                    detail={d}
                    level={state.explanationLevel}
                    completedPages={completedPages}
                    rootCauseGroup={rootCauseFor(d)}
                    sampleMode={isSample}
                    defaultExpanded={state.highlightFindingId === d.findingId}
                  />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterControls({
  filter,
  setFilter,
  pageUrls,
  sortKey,
  setSortKey,
  showViewportFilter,
}: {
  filter: typeof DEFAULT_ISSUES_FILTER;
  setFilter: (f: typeof DEFAULT_ISSUES_FILTER) => void;
  pageUrls: string[];
  sortKey: IssuesSortKey;
  setSortKey: (k: IssuesSortKey) => void;
  showViewportFilter: boolean;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-3 text-sm">
      {showViewportFilter && (
        <label>
          Viewport
          <select
            className="ml-1 rounded border border-border bg-background px-2 py-1"
            value={filter.viewport}
            onChange={(e) =>
              setFilter({
                ...filter,
                viewport: e.target.value as typeof filter.viewport,
              })
            }
          >
            <option value="all">All</option>
            <option value="both">Both viewports</option>
            <option value="desktop">Desktop only</option>
            <option value="mobile">Mobile only</option>
          </select>
        </label>
      )}
      <label>
        Status
        <select
          className="ml-1 rounded border border-border bg-background px-2 py-1"
          value={filter.issueStatus}
          onChange={(e) =>
            setFilter({
              ...filter,
              issueStatus: e.target.value as typeof filter.issueStatus,
            })
          }
        >
          <option value="actionable">Actionable (default)</option>
          <option value="failed">Failed</option>
          <option value="confirmation">Needs confirmation</option>
          <option value="best_practice">Best practice</option>
        </select>
      </label>
      <label>
        Category
        <select
          className="ml-1 max-w-[10rem] rounded border border-border bg-background px-2 py-1"
          value={filter.category}
          onChange={(e) =>
            setFilter({
              ...filter,
              category: e.target.value as typeof filter.category,
            })
          }
        >
          <option value="all">All</option>
          {ALL_PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label>
        Priority
        <select
          className="ml-1 rounded border border-border bg-background px-2 py-1"
          value={filter.priority}
          onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
        >
          <option value="all">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </label>
      <label>
        Impact
        <select
          className="ml-1 rounded border border-border bg-background px-2 py-1"
          value={filter.impact}
          onChange={(e) => setFilter({ ...filter, impact: e.target.value })}
        >
          <option value="all">All</option>
          <option value="critical">Critical</option>
          <option value="serious">Serious</option>
          <option value="moderate">Moderate</option>
          <option value="minor">Minor</option>
        </select>
      </label>
      <label>
        Source
        <select
          className="ml-1 rounded border border-border bg-background px-2 py-1"
          value={filter.sourceType}
          onChange={(e) => setFilter({ ...filter, sourceType: e.target.value })}
        >
          <option value="all">All</option>
          <option value="axe_wcag">Axe automated</option>
          <option value="axe_best_practice">Axe best practice</option>
          <option value="deterministic">Deterministic</option>
          <option value="manual">Manual</option>
        </select>
      </label>
      <label>
        WCAG level
        <select
          className="ml-1 rounded border border-border bg-background px-2 py-1"
          value={filter.wcagLevel}
          onChange={(e) => setFilter({ ...filter, wcagLevel: e.target.value })}
        >
          <option value="all">All</option>
          <option value="A">A</option>
          <option value="AA">AA</option>
          <option value="AAA">AAA</option>
        </select>
      </label>
      <label>
        Page
        <select
          className="ml-1 max-w-xs rounded border border-border bg-background px-2 py-1"
          value={filter.pageUrl}
          onChange={(e) => setFilter({ ...filter, pageUrl: e.target.value })}
        >
          <option value="all">All</option>
          {pageUrls.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </label>
      <label>
        Sort
        <select
          className="ml-1 rounded border border-border bg-background px-2 py-1"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as IssuesSortKey)}
        >
          <option value="priority">Recommended</option>
          <option value="impact">Impact</option>
          <option value="pages">Pages affected</option>
          <option value="occurrences">Occurrences</option>
          <option value="rule">Rule name</option>
        </select>
      </label>
      <label className="flex flex-1 items-center gap-2">
        Search
        <input
          className="min-w-[12rem] flex-1 rounded border border-border bg-background px-2 py-1"
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          placeholder="Rule, WCAG, URL, selector…"
        />
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={filter.bestPracticeOnly === true}
          onChange={(e) =>
            setFilter({
              ...filter,
              bestPracticeOnly: e.target.checked ? true : null,
              issueStatus: e.target.checked ? "best_practice" : filter.issueStatus,
            })
          }
        />
        Best practice only
      </label>
    </div>
  );
}
