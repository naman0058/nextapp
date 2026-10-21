"use client";

import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";
import { scanResultCounters } from "@/features/website-scanner/taxonomy/buildScanResultModel";

type Props = {
  intel: SiteScanIntelligence | null;
};

export function CoverageTab({ intel }: Props) {
  const model = intel?.scanResultModel;
  const c = scanResultCounters(model);

  if (!model) {
    return <p className="text-sm text-muted">No scan taxonomy data available.</p>;
  }

  return (
    <div className="space-y-6 text-sm">
      <p className="text-muted">
        Automated check outcomes from axe-core on scanned page state. Passing an
        automated rule does not establish WCAG compliance; human review is still
        required.
      </p>

      <SummaryGrid c={c} />

      <LedgerSection title="Failed automated checks" entries={model.failedChecks} empty="None" />
      <LedgerSection
        title="Needs manual confirmation (axe incomplete)"
        entries={model.incompleteChecks}
        empty="None"
      />
      <details className="rounded-lg border border-border p-3">
        <summary className="cursor-pointer font-semibold">
          Passed automated checks ({c.passedAutomatedRules} rules)
        </summary>
        <p className="mt-2 text-muted">
          Passing an automated rule does not establish compliance with the associated
          WCAG success criterion. Some requirements require human review.
        </p>
        <LedgerList entries={model.passedChecks} />
      </details>
      <details className="rounded-lg border border-border p-3">
        <summary className="cursor-pointer font-semibold">
          Not applicable ({c.notApplicableRules} rules)
        </summary>
        <p className="mt-2 text-muted">
          Not applicable to scanned page state — not counted as passes.
        </p>
        <LedgerList entries={model.notApplicableChecks} />
      </details>
      {model.includeBestPractices && (
        <LedgerSection
          title="Best-practice observations"
          entries={model.bestPracticeChecks}
          empty="None"
        />
      )}
    </div>
  );
}

function SummaryGrid({
  c,
}: {
  c: ReturnType<typeof scanResultCounters>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Stat label="Rules evaluated" value={c.automatedRulesEvaluated} />
      <Stat label="Failed" value={c.failedAutomatedRules} />
      <Stat label="Needs confirmation" value={c.needsManualConfirmation} />
      <Stat label="Passed (rules)" value={c.passedAutomatedRules} />
      <Stat label="Not applicable (rules)" value={c.notApplicableRules} />
      <Stat label="Best-practice observations" value={c.bestPracticeObservations} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="font-display text-xl font-bold">{value}</p>
    </div>
  );
}

function LedgerSection({
  title,
  entries,
  empty,
}: {
  title: string;
  entries: SiteScanIntelligence["scanResultModel"]["failedChecks"];
  empty: string;
}) {
  return (
    <section>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {entries.length === 0 ? (
        <p className="mt-1 text-muted">{empty}</p>
      ) : (
        <LedgerList entries={entries} />
      )}
    </section>
  );
}

function LedgerList({
  entries,
}: {
  entries: SiteScanIntelligence["scanResultModel"]["ledger"];
}) {
  const byRule = new Map<string, (typeof entries)[0]>();
  for (const e of entries) {
    if (!byRule.has(e.ruleId)) byRule.set(e.ruleId, e);
  }
  return (
    <ul className="mt-2 space-y-2">
      {[...byRule.values()].slice(0, 100).map((e) => (
        <li key={e.id} className="rounded border border-border p-2">
          <p className="font-medium">{e.title}</p>
          <p className="text-xs text-muted">
            {e.ruleId} · {e.productCategory}
            {e.wcagCriteria.length > 0 &&
              ` · WCAG ${e.wcagCriteria.join(", ")} (${e.wcagLevel})`}
            {e.alsoHasAutomatedFailure && " · overlaps automated failure"}
          </p>
        </li>
      ))}
    </ul>
  );
}
