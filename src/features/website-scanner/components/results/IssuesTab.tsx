"use client";

import { useMemo, useState } from "react";
import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { ExplanationLevelToggle } from "@/features/website-scanner/components/results/ExplanationLevelToggle";
import { IssueCard } from "@/features/website-scanner/components/results/IssueCard";
import {
  DEFAULT_ISSUES_FILTER,
  filterNormalizedFindings,
  groupFindingsByPage,
  groupFindingsByRule,
  sortRootCauseGroupsForIssues,
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
  const [filter, setFilter] = useState(DEFAULT_ISSUES_FILTER);
  const [sortKey, setSortKey] = useState<IssuesSortKey>("priority");

  const findings = useMemo(() => {
    const base = intel?.normalizedFindings.filter((f) => f.status === "issue") ?? [];
    return filterNormalizedFindings(base, filter);
  }, [intel, filter]);

  const pageUrls = useMemo(
    () => [...new Set(completedPages.map((p) => p.finalUrl))],
    [completedPages],
  );

  function wcagRowForRule(ruleId: string) {
    const row = intel?.wcagCoverage.find((c) =>
      c.automatedRules.includes(ruleId),
    );
    if (!row) return undefined;
    return {
      criterion: row.criterion,
      level: row.level,
      principle: row.principle,
      automation: row.automation,
    };
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <fieldset>
          <legend className="text-sm font-medium">Group by</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {(
              [
                ["root-cause", "Root cause"],
                ["rule", "Rule"],
                ["page", "Page"],
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

      <ul className="space-y-3">
        {findings.length === 0 && (
          <li className="text-sm text-muted">No issues match your filters.</li>
        )}
        {state.issuesGroupBy === "root-cause" &&
          sortRootCauseGroupsForIssues(
            (intel?.rootCauseGroups ?? []).filter((g) =>
              findings.some((f) => f.ruleId === g.ruleId),
            ),
            sortKey,
            intel?.normalizedFindings ?? [],
          ).map((g) => (
            <IssueCard
              key={g.id}
              title={g.label}
              ruleId={g.ruleId}
              findings={findings.filter((f) => f.ruleId === g.ruleId)}
              level={state.explanationLevel}
              completedPages={completedPages}
              rootCauseGroup={g}
              wcagRow={wcagRowForRule(g.ruleId)}
              sampleMode={isSample}
            />
          ))}
        {state.issuesGroupBy === "rule" &&
          groupFindingsByRule(findings).map((grp) => (
            <IssueCard
              key={grp.ruleId}
              title={grp.title}
              ruleId={grp.ruleId}
              findings={grp.findings}
              level={state.explanationLevel}
              completedPages={completedPages}
              rootCauseGroup={intel?.rootCauseGroups.find(
                (g) => g.ruleId === grp.ruleId,
              )}
              wcagRow={wcagRowForRule(grp.ruleId)}
              sampleMode={isSample}
            />
          ))}
        {state.issuesGroupBy === "page" &&
          groupFindingsByPage(findings).map((grp) => (
            <li key={grp.pageUrl} className="space-y-3">
              <h4 className="break-all font-semibold">{grp.pageUrl}</h4>
              <ul className="space-y-3">
                {groupFindingsByRule(grp.findings).map((r) => (
                  <IssueCard
                    key={`${grp.pageUrl}-${r.ruleId}`}
                    title={r.title}
                    ruleId={r.ruleId}
                    findings={r.findings}
                    level={state.explanationLevel}
                    completedPages={completedPages}
                    wcagRow={wcagRowForRule(r.ruleId)}
                    sampleMode={isSample}
                  />
                ))}
              </ul>
            </li>
          ))}
      </ul>
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
          <option value="priority">Recommended priority</option>
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
          placeholder="Rule, WCAG, URL…"
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
            })
          }
        />
        Best practice only
      </label>
    </div>
  );
}
