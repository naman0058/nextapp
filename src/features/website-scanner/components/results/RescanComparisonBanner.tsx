"use client";

import type { compareScanSnapshots } from "@/features/website-scanner/utils/compareScanSnapshots";

type Props = {
  comparison: ReturnType<typeof compareScanSnapshots>;
  onExportComparison?: () => void;
};

export function RescanComparisonBanner({ comparison, onExportComparison }: Props) {
  return (
    <div
      className="rounded-lg border border-border bg-background p-4 text-sm"
      role="status"
    >
      <h3 className="font-semibold text-foreground">Rescan comparison</h3>
      <p className="mt-1 text-muted">
        Resolved: {comparison.resolved} · New: {comparison.newCount} · Still
        present: {comparison.persistent}
        {comparison.changed > 0 ? ` · Changed: ${comparison.changed}` : ""}.
        Fingerprint matching may be imperfect after DOM changes.
      </p>
      <details className="mt-2">
        <summary className="cursor-pointer font-medium">
          Resolved and persistent issues
        </summary>
        <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs">
          {comparison.rows
            .filter((r) => r.status === "resolved")
            .slice(0, 30)
            .map((r) => (
              <li key={`r-${r.fingerprint}`} className="text-green-800 dark:text-green-200">
                Resolved — {r.ruleId} on {r.pageUrl}
              </li>
            ))}
          {comparison.rows
            .filter((r) => r.status === "persistent" || r.status === "changed")
            .slice(0, 30)
            .map((r) => (
              <li key={`p-${r.fingerprint}`}>
                Still present — {r.ruleId} on {r.pageUrl}
              </li>
            ))}
        </ul>
      </details>
      {onExportComparison && (
        <button
          type="button"
          className="mt-2 rounded border border-border px-2 py-1 text-xs font-medium"
          onClick={onExportComparison}
        >
          Download comparison CSV
        </button>
      )}
    </div>
  );
}
