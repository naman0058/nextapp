import type { PreflightCounts } from "@/features/accessibility/types/preflight";
import { ResultMetricTile } from "@/components/results/ResultMetricTile";

type ResultsSummaryProps = {
  counts: PreflightCounts;
};

const ROWS = [
  { key: "pass" as const, label: "Passed", tone: "success" as const },
  { key: "review" as const, label: "Needs review", tone: "warning" as const },
  { key: "fail" as const, label: "Needs attention", tone: "danger" as const },
  { key: "not_checked" as const, label: "Not checked", tone: "muted" as const },
];

export function ResultsSummary({ counts }: ResultsSummaryProps) {
  return (
    <div>
      <h3 className="font-display text-sm font-bold text-foreground">Findings summary</h3>
      <ul className="mt-3 grid list-none gap-2 sm:grid-cols-2">
        {ROWS.map((row) => (
          <li key={row.key}>
            <ResultMetricTile
              label={row.label}
              value={counts[row.key]}
              tone={row.tone}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
