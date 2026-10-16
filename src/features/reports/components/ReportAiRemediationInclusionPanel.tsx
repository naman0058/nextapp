"use client";

import type { ReportAiRemediationCandidate } from "@/features/reports/types/reportAiRemediation";

type Props = {
  masterEnabled: boolean;
  onMasterChange: (value: boolean) => void;
  candidates: ReportAiRemediationCandidate[];
  selectedIds: Record<string, boolean>;
  onToggleId: (id: string, included: boolean) => void;
  onBulk: (ids: string[], included: boolean) => void;
  idPrefix?: string;
};

export function ReportAiRemediationInclusionPanel({
  masterEnabled,
  onMasterChange,
  candidates,
  selectedIds,
  onToggleId,
  onBulk,
  idPrefix = "ai-rem",
}: Props) {
  const selectable = candidates.filter((c) => !c.stale || selectedIds[c.id]);
  const freshIds = candidates.filter((c) => !c.stale).map((c) => c.id);
  const allIds = candidates.map((c) => c.id);

  if (candidates.length === 0) {
    return (
      <p className="text-sm text-muted">
        No AI remediation has been generated for this session. Generate guidance in
        Fix Lab or the relevant checker tool first.
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <label className="flex items-start gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={masterEnabled}
          onChange={(e) => onMasterChange(e.target.checked)}
        />
        Include AI-Assisted Remediation in Report
      </label>
      <p className="text-xs text-muted">
        Selected AI guidance will be embedded in exported PDF, JSON, and other
        formats. Review before sharing externally.
      </p>
      {masterEnabled ? (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded border border-border px-2 py-1 text-xs"
              onClick={() => onBulk(freshIds, true)}
            >
              Select all existing (non-stale)
            </button>
            <button
              type="button"
              className="rounded border border-border px-2 py-1 text-xs"
              onClick={() => onBulk(allIds, false)}
            >
              Select none
            </button>
          </div>
          <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
            {candidates.map((c) => {
              const inputId = `${idPrefix}-${c.id}`;
              return (
                <li key={c.id}>
                  <label className="flex items-start gap-2" htmlFor={inputId}>
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={Boolean(selectedIds[c.id])}
                      disabled={!masterEnabled}
                      onChange={(e) => onToggleId(c.id, e.target.checked)}
                    />
                    <span>
                      <span className="font-medium">{c.title}</span>
                      <span className="text-muted"> — {c.source}</span>
                      {c.stale ? (
                        <span className="block text-xs font-semibold text-foreground">
                          Stale guidance — Previous scan
                        </span>
                      ) : null}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          {selectable.length > 15 ? (
            <p className="text-xs text-muted">
              Large exports may take longer. Only selected items are included.
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
