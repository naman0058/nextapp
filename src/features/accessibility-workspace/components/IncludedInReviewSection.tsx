"use client";

import { useMemo } from "react";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import { WORKSPACE_TOOL_CATALOG } from "@/features/accessibility-workspace/toolCatalog";
import type { ReportContribution, WorkspaceToolId } from "@/features/accessibility-workspace/types";
import { provenanceLabel } from "@/features/accessibility-workspace/provenanceLabels";

function countForTool(contributions: ReportContribution[], toolId: WorkspaceToolId) {
  const rows = contributions.filter((c) => c.toolId === toolId);
  const included = rows.filter((c) => c.includedInReport).length;
  return { total: rows.length, included };
}

export function IncludedInReviewSection() {
  const { state, dispatch, sampleMode } = useWebsiteScanSession();
  const contributions = state.accessibilityWorkspace.contributions;

  const rows = useMemo(() => {
    const toolIds: WorkspaceToolId[] = [
      "contrast_checker",
      "image_alt_checker",
      "screen_reader_preview",
      "video_accessibility",
      "developer_ticket",
      "visual_issue_locator",
      "ai_assisted_remediation",
    ];
    return toolIds.map((toolId) => ({
      toolId,
      ...countForTool(contributions, toolId),
    }));
  }, [contributions]);

  if (sampleMode) return null;

  return (
    <section
      aria-labelledby="included-review-heading"
      className="rounded-lg border border-border p-4 text-sm"
    >
      <h2 id="included-review-heading" className="font-semibold">
        Included in this review
      </h2>
      <p className="mt-1 text-xs text-muted">
        Optional specialized checks are added only when you choose to include them.
      </p>

      <ul className="mt-3 space-y-2">
        <li className="flex flex-wrap items-center justify-between gap-2">
          <span>Website Scanner</span>
          <span className="text-xs">
            <span aria-hidden="true">✓</span> Current scan
          </span>
        </li>
        {rows.map(({ toolId, total, included }) => {
          const meta = WORKSPACE_TOOL_CATALOG[toolId];
          const status =
            included > 0
              ? `✓ ${meta.label} — ${included} in report`
              : total > 0
                ? `○ ${meta.label} — saved, not in report (${total})`
                : `○ ${meta.label} — not added`;
          return (
            <li key={toolId} className="flex flex-wrap items-center justify-between gap-2">
              <span>{meta.label}</span>
              <span className="text-xs">{status}</span>
            </li>
          );
        })}
      </ul>

      {contributions.length > 0 ? (
        <details className="mt-4">
          <summary className="cursor-pointer font-medium">Manage report contents</summary>
          <ul className="mt-2 space-y-3">
            {contributions.map((c) => (
              <li
                key={c.contributionId}
                className="rounded border border-border p-3"
              >
                <p className="font-medium">{c.title}</p>
                <p className="text-xs text-muted">
                  {provenanceLabel(c.sourceType)} · {c.scope.occurrenceLabel ?? c.scope.type}
                  {c.relatedWebsiteFindingIds[0]
                    ? ` · Finding ${c.relatedWebsiteFindingIds[0]}`
                    : ""}
                </p>
                <p className="text-xs text-muted">
                  {c.includedInReport ? "Included in report" : "Not included in report"} ·{" "}
                  {new Date(c.updatedAt).toLocaleString()}
                </p>
                <label className="mt-2 flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={c.includedInReport}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_CONTRIBUTION_INCLUDED",
                        contributionId: c.contributionId,
                        included: e.target.checked,
                      })
                    }
                  />
                  Include in report export
                </label>
                <button
                  type="button"
                  className="mt-2 block text-xs font-medium text-primary underline"
                  onClick={() =>
                    dispatch({
                      type: "REMOVE_REPORT_CONTRIBUTION",
                      contributionId: c.contributionId,
                    })
                  }
                >
                  Remove from workspace report list
                </button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
