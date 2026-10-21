"use client";

import type { CoverageDiagnosticRow } from "@/features/website-scanner/executive/types";

type Props = {
  rows: CoverageDiagnosticRow[];
};

export function CoverageDiagnosticSection({ rows }: Props) {
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="coverage-diagnostic-heading">
      <h3 id="coverage-diagnostic-heading" className="font-display text-lg font-bold">
        Coverage
      </h3>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-medium">{row.label}</span>
              <span className="text-muted">{row.statusLabel}</span>
            </div>
            <p className="mt-1 text-muted">{row.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
