"use client";

import type { FixPlanItem } from "@/features/accessibility-intelligence/types/siteIntelligence";
import { PriorityBadge } from "@/features/website-scanner/components/results/PriorityBadge";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import { formatAffectedOccurrencesSummary } from "@/features/website-scanner/utils/occurrenceCounts";

type Props = {
  item: FixPlanItem;
  sharedFixHint?: boolean;
  sampleMode?: boolean;
};

export function StartHereCard({ item, sharedFixHint, sampleMode }: Props) {
  const { dispatch, sampleMode: ctxSample } = useWebsiteScanSession();
  const isSample = sampleMode ?? ctxSample;
  const taskId = item.rootCauseGroupId ?? item.ruleId ?? `rank-${item.rank}`;

  return (
    <article className="rounded-lg border border-border p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-lg font-bold">#{item.rank}</span>
        <PriorityBadge priority={item.priority} />
        {sharedFixHint && (
          <span className="rounded bg-muted px-2 py-0.5 text-xs">
            Fix once may help multiple pages
          </span>
        )}
      </div>
      <h4 className="mt-2 font-semibold">{item.title}</h4>
      <p className="mt-1 text-muted">{item.reasonForPriority}</p>
      <p className="mt-2">
        {formatAffectedOccurrencesSummary(item.affectedElements, item.affectedPages)}
      </p>
      <p className="mt-1 text-muted">{item.estimatedReachLabel}</p>
      <button
        type="button"
        className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
        onClick={() => {
          if (isSample) {
            document.getElementById("sample-fix-plan")?.scrollIntoView({ behavior: "smooth" });
            return;
          }
          dispatch({ type: "SET_RESULT_VIEW", view: "fix-plan" });
          dispatch({ type: "SET_HIGHLIGHT_FIX_TASK", taskId });
        }}
      >
        {isSample ? "View example fix" : "View fix"}
      </button>
    </article>
  );
}
