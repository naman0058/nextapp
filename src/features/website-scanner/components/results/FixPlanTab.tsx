"use client";

import { useEffect, useMemo, useRef } from "react";
import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { UserFixTaskStatus } from "@/features/website-scanner/types/resultUx";
import { PriorityBadge } from "@/features/website-scanner/components/results/PriorityBadge";
import { FixLabPanel } from "@/features/website-scanner/components/results/FixLabPanel";
import { fixTaskKeyForRootCause } from "@/features/website-scanner/utils/fixTaskKeys";
import {
  formatFixPlanPlainText,
  resolveDisplayFixStatus,
} from "@/features/website-scanner/utils/fixWorkflowStatus";

type Props = {
  intel: SiteScanIntelligence | null;
  completedPages: WebsitePageScanResult[];
  onRescanVerify: () => void;
  sampleMode?: boolean;
};

export function FixPlanTab({ intel, completedPages, onRescanVerify, sampleMode }: Props) {
  const { state, dispatch, sampleMode: ctxSample } = useWebsiteScanSession();
  const isSample = sampleMode ?? ctxSample;
  const highlightRef = useRef<HTMLLIElement | null>(null);

  const byPriority = useMemo(() => {
    const plan = intel?.fixPlan ?? [];
    const groups: Record<string, typeof plan> = {
      high: [],
      medium: [],
      low: [],
    };
    for (const item of plan) {
      groups[item.priority].push(item);
    }
    return groups;
  }, [intel]);

  const anyMarkedFixed = Object.values(state.fixTaskStatus).some(
    (s) => s === "user_marked_fixed",
  );

  useEffect(() => {
    if (!state.highlightFixTaskId || !highlightRef.current) return;
    highlightRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [state.highlightFixTaskId]);

  function setStatus(taskKey: string, status: UserFixTaskStatus) {
    dispatch({ type: "SET_FIX_TASK_STATUS", taskKey, status });
  }

  function copyPlan() {
    const text = formatFixPlanPlainText(intel?.fixPlan ?? []);
    void navigator.clipboard.writeText(text);
  }

  if (!intel || intel.fixPlan.length === 0) {
    return (
      <p className="text-sm text-muted">
        No fix plan items yet. Run a scan with violations to populate priorities.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg border border-border px-3 py-1.5 text-sm"
          onClick={() => void copyPlan()}
        >
          Copy fix plan
        </button>
        {anyMarkedFixed && !isSample && (
          <button
            type="button"
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
            onClick={onRescanVerify}
          >
            Rescan to verify
          </button>
        )}
      </div>
      {(["high", "medium", "low"] as const).map((priority) => {
        const items = byPriority[priority];
        if (items.length === 0) return null;
        return (
          <section key={priority}>
            <h3 className="font-display text-lg font-bold capitalize">
              {priority} priority
            </h3>
            <ul className="mt-3 space-y-4">
              {items.map((item) => {
                const taskKey = item.rootCauseGroupId
                  ? fixTaskKeyForRootCause(item.rootCauseGroupId)
                  : `rank-${item.rank}`;
                const userStatus =
                  state.fixTaskStatus[taskKey] ?? "not_started";
                const group = intel.rootCauseGroups.find(
                  (g) => g.id === item.rootCauseGroupId,
                );
                const display = resolveDisplayFixStatus({
                  taskKey,
                  userStatus,
                  ruleId: item.ruleId ?? group?.ruleId ?? "",
                  previousSnapshot: state.previousSnapshot,
                  currentPages: completedPages,
                  rootCauseGroup: group,
                });
                const highlighted = state.highlightFixTaskId === taskKey;
                return (
                  <li
                    key={taskKey}
                    ref={highlighted ? highlightRef : undefined}
                    className={`rounded-lg border p-4 text-sm ${
                      highlighted ? "border-primary ring-2 ring-primary/30" : "border-border"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">Task {item.rank}</span>
                      <PriorityBadge priority={item.priority} />
                      <span className="rounded bg-muted px-2 py-0.5 text-xs">
                        {display}
                      </span>
                    </div>
                    <h4 className="mt-2 font-semibold">{item.title}</h4>
                    <p className="text-muted">{item.estimatedReachLabel}</p>
                    {isSample ? (
                      <p className="mt-2 text-muted">
                        Example status: <strong>{display}</strong>
                      </p>
                    ) : (
                      <label className="mt-2 block">
                        Status
                        <select
                          className="ml-2 rounded border border-border bg-background px-2 py-1"
                          value={userStatus}
                          onChange={(e) =>
                            setStatus(
                              taskKey,
                              e.target.value as UserFixTaskStatus,
                            )
                          }
                        >
                          <option value="not_started">Not started</option>
                          <option value="in_review">In review</option>
                          <option value="user_marked_fixed">Marked fixed</option>
                        </select>
                      </label>
                    )}
                    <FixLabPanel
                      ruleId={item.ruleId ?? group?.ruleId ?? ""}
                      axeHelp={item.title}
                      group={group}
                      completedPages={completedPages}
                      fixPlanItem={item}
                      displayFixStatus={display}
                      onRescanVerify={isSample ? undefined : onRescanVerify}
                      sampleMode={isSample}
                      sampleRemediation={
                        group ? state.aiRemediationByGroup[group.id] : undefined
                      }
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
