"use client";

import type { ExecutiveSnapshot } from "@/features/website-scanner/executive/types";

type Props = {
  snapshot: ExecutiveSnapshot;
};

export function PreflightSnapshotSection({ snapshot }: Props) {
  const primary = [
    { label: "Failed rules", value: snapshot.failedAutomatedRules },
    { label: "Affected occurrences", value: snapshot.affectedOccurrences },
    { label: "Pages scanned", value: snapshot.pagesScanned },
    { label: "Needs confirmation", value: snapshot.needsManualConfirmation },
    { label: "Human review open", value: snapshot.humanReviewOpen },
    { label: "Coverage", value: snapshot.coverageStatusLabel },
  ];

  return (
    <section aria-labelledby="preflight-snapshot-heading">
      <h3 id="preflight-snapshot-heading" className="font-display text-lg font-bold">
        Automated preflight snapshot
      </h3>
      <p className="mt-1 text-sm text-muted">{snapshot.preflightStatusPhrase}</p>
      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {primary.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-border bg-card px-3 py-2.5"
          >
            <dt className="text-xs text-muted">{item.label}</dt>
            <dd className="font-display text-xl font-bold tabular-nums">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
      {snapshot.bestPracticeObservations > 0 && (
        <p className="mt-2 text-xs text-muted">
          Best-practice observations: {snapshot.bestPracticeObservations}
        </p>
      )}
    </section>
  );
}
