"use client";

import type { TopRemediationPriority } from "@/features/website-scanner/executive/types";
import { PriorityBadge } from "@/features/website-scanner/components/results/PriorityBadge";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import { formatAffectedOccurrencesSummary } from "@/features/website-scanner/utils/occurrenceCounts";

type Props = {
  item: TopRemediationPriority;
};

export function TopRemediationPriorityCard({ item }: Props) {
  const { dispatch } = useWebsiteScanSession();
  const taskId = item.rootCauseGroupId ?? item.ruleId ?? item.id;

  return (
    <article className="rounded-lg border border-border p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-lg font-bold">#{item.rank}</span>
        <PriorityBadge priority={item.priority} />
        <span className="rounded border border-border px-2 py-0.5 text-xs">
          {item.sourceBadge}
        </span>
      </div>
      <h4 className="mt-2 font-semibold">{item.title}</h4>
      {item.primaryWcagCriterion && (
        <p className="mt-1 text-xs text-muted">
          WCAG {item.primaryWcagCriterion}
          {item.wcagLevel ? ` · Level ${item.wcagLevel}` : ""}
          {item.additionalWcagCount > 0 &&
            ` · + ${item.additionalWcagCount} more`}
        </p>
      )}
      <p className="mt-2 text-muted">{item.whyItMatters}</p>
      <p className="mt-2">
        {formatAffectedOccurrencesSummary(
          item.totalOccurrences,
          item.pagesAffected,
        )}
      </p>
      {item.retainedEvidenceSummary && (
        <p className="mt-1 text-xs text-muted">{item.retainedEvidenceSummary}</p>
      )}
      <p
        className="mt-1 text-xs text-muted"
        title="Priority reflects impact and remediation reach, not legal risk."
      >
        Impact: {item.impact}. Priority reflects impact and remediation reach,
        not legal risk.
      </p>
      <button
        type="button"
        className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
        onClick={() => {
          dispatch({ type: "SET_RESULT_VIEW", view: "fix-plan" });
          dispatch({ type: "SET_HIGHLIGHT_FIX_TASK", taskId });
        }}
      >
        View fix
      </button>
    </article>
  );
}
