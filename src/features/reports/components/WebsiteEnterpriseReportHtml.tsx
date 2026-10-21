import type { AccessibilityPreflightReport } from "@/features/reports/types/reportModel";
import {
  ENTERPRISE_BRAND_NAME,
  ENTERPRISE_TAGLINE,
  PASSING_RULES_DISCLAIMER,
  WCAG_COUNT_DISCLAIMER,
} from "@/features/reports/enterprise/constants";
import { AiRemediationAppendixSection } from "@/features/reports/components/AiRemediationAppendixSection";
import { humanReviewResultWording } from "@/features/human-review-workspace/humanReviewStatusLabel";

type Props = {
  report: AccessibilityPreflightReport;
};

function ProvenanceBadge({ label }: { label: string }) {
  return (
    <span className="inline-block rounded border border-border bg-muted px-2 py-0.5 text-xs font-medium">
      {label}
    </span>
  );
}

export function WebsiteEnterpriseReportHtml({ report }: Props) {
  const e = report.enterpriseView;
  if (!e) return null;

  return (
    <article className="acps-enterprise-report space-y-8">
      <header className="border-b border-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {ENTERPRISE_BRAND_NAME}
        </p>
        <h1 className="font-display text-2xl font-bold">Accessibility Preflight Report</h1>
        <p className="text-sm text-muted">{ENTERPRISE_TAGLINE}</p>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold">Target</dt>
            <dd className="break-all text-muted">{e.scope.targetUrl}</dd>
          </div>
          <div>
            <dt className="font-semibold">Generated</dt>
            <dd className="text-muted">{e.reportMeta.generatedAtDisplay}</dd>
          </div>
          <div>
            <dt className="font-semibold">Report ID</dt>
            <dd className="font-mono text-xs text-muted">{e.reportMeta.reportId}</dd>
          </div>
          <div>
            <dt className="font-semibold">Schema</dt>
            <dd className="text-muted">{e.reportMeta.reportSchemaVersion}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm font-medium">{e.executiveSummary.statusPhrase}</p>
        <p className="mt-1 text-sm text-muted">{e.executiveSummary.shortNote}</p>
        {e.executiveSummary.zeroFindingNote ? (
          <p className="mt-2 rounded border border-border bg-muted/30 p-3 text-sm">
            {e.executiveSummary.zeroFindingNote}
          </p>
        ) : null}
        {e.scope.partialScanNote ? (
          <p className="mt-2 rounded border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            Coverage limitation: {e.scope.partialScanNote}
          </p>
        ) : null}
      </header>

      <section aria-labelledby="scope-strip">
        <h2 id="scope-strip" className="font-display text-lg font-bold">
          Scope
        </h2>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted">Pages scanned</dt>
            <dd className="font-semibold tabular-nums">{e.counters.pagesScanned}</dd>
          </div>
          <div>
            <dt className="text-muted">Viewport</dt>
            <dd>{e.scope.viewportMode}</dd>
          </div>
          <div>
            <dt className="text-muted">Scan source</dt>
            <dd>{e.scope.scanSource}</dd>
          </div>
          <div>
            <dt className="text-muted">Execution</dt>
            <dd>{e.scope.executionStatusLabel}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="snapshot">
        <h2 id="snapshot" className="font-display text-lg font-bold">
          Automated preflight snapshot
        </h2>
        <dl className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">Failed automated rules</dt>
            <dd className="text-lg font-semibold tabular-nums">
              {e.counters.failedAutomatedRules}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Affected occurrences</dt>
            <dd className="text-lg font-semibold tabular-nums">
              {e.counters.affectedOccurrences}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Needs manual confirmation</dt>
            <dd className="text-lg font-semibold tabular-nums">
              {e.counters.needsManualConfirmation}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Human review</dt>
            <dd className="font-semibold tabular-nums">
              {e.counters.humanReviewReviewed} of {e.counters.humanReviewRelevant} reviewed ·{" "}
              {e.counters.humanReviewRemainingOpen} open
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="coverage-diag">
        <h2 id="coverage-diag" className="font-display text-lg font-bold">
          Coverage & confidence
        </h2>
        <ul className="mt-2 space-y-2 text-sm">
          {e.coverage.map((row) => (
            <li key={row.id} className="rounded border border-border p-3">
              <p className="font-semibold">{row.label}</p>
              <p>{row.statusLabel}</p>
              <p className="text-muted">{row.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      {e.priorities.length > 0 && (
        <section aria-labelledby="priorities">
          <h2 id="priorities" className="font-display text-lg font-bold">
            Top remediation priorities
          </h2>
          <ol className="mt-3 space-y-3 text-sm">
            {e.priorities.map((p) => (
              <li key={p.id} className="rounded border border-border p-3">
                <p className="font-semibold">{p.title}</p>
                <p className="text-muted">
                  {p.impact} · {p.priority} priority
                  {p.primaryWcagCriterion
                    ? ` · WCAG ${p.primaryWcagCriterion}${p.wcagLevel ? ` ${p.wcagLevel}` : ""}`
                    : ""}
                </p>
                <p>
                  {p.totalOccurrences} affected occurrence(s) · {p.pagesAffected} page(s)
                </p>
                <p className="mt-1">{p.whyItMatters}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {e.affectedAreas.length > 0 && (
        <section aria-labelledby="areas">
          <h2 id="areas" className="font-display text-lg font-bold">
            Affected areas
          </h2>
          <ul className="mt-2 space-y-2 text-sm">
            {e.affectedAreas.map((a) => (
              <li key={a.category} className="flex flex-wrap justify-between gap-2 border-b border-border py-2">
                <span className="font-medium">{a.category}</span>
                <span className="text-muted">
                  {a.failedRuleCount > 0
                    ? `${a.failedRuleCount} failed rule(s) · ${a.affectedOccurrences} occurrences`
                    : null}
                  {a.confirmationNeededCount > 0
                    ? `${a.confirmationNeededCount} need confirmation`
                    : null}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="wcag-counts">
        <h2 id="wcag-counts" className="font-display text-lg font-bold">
          WCAG coverage summary
        </h2>
        <p className="mt-1 text-xs text-muted">{WCAG_COUNT_DISCLAIMER}</p>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">Passed automated rules</dt>
            <dd className="font-semibold">{e.counters.passedAutomatedRules}</dd>
          </div>
          <div>
            <dt className="text-muted">Failed automated rules</dt>
            <dd className="font-semibold">{e.counters.failedAutomatedRules}</dd>
          </div>
          <div>
            <dt className="text-muted">Best-practice observations</dt>
            <dd className="font-semibold">{e.taxonomy.bestPracticeObservations}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-muted">{PASSING_RULES_DISCLAIMER}</p>
      </section>

      {e.automatedFindings.length > 0 && (
        <section aria-labelledby="findings">
          <h2 id="findings" className="font-display text-lg font-bold">
            Automated findings
          </h2>
          <ul className="mt-3 space-y-4">
            {e.automatedFindings.map((f) => (
              <li key={f.findingId} className="rounded-lg border border-border p-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <ProvenanceBadge label={f.sourceBadge} />
                  <h3 className="font-semibold">{f.title}</h3>
                </div>
                <p className="font-mono text-xs text-muted">{f.ruleId}</p>
                <p className="mt-1 text-muted">
                  {f.totalOccurrences} total · {f.retainedEvidenceCount} retained ·{" "}
                  {f.pdfShownCount} shown in report
                </p>
                <p className="mt-2">{f.problem}</p>
                <p className="mt-1 text-muted">{f.whyItMatters}</p>
                {f.representativeEvidence.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">Representative evidence</summary>
                    <ul className="mt-2 space-y-2">
                      {f.representativeEvidence.map((ev) => (
                        <li key={ev.evidenceId} className="rounded border border-border p-2 text-xs">
                          <p>{ev.pageUrl} · {ev.viewportId}</p>
                          {ev.selector ? <p className="break-all font-mono">{ev.selector}</p> : null}
                          {ev.failureSummary ? <p>{ev.failureSummary}</p> : null}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {e.remediationPlan.length > 0 && (
        <section aria-labelledby="remediation-plan">
          <h2 id="remediation-plan" className="font-display text-lg font-bold">
            Deterministic remediation plan
          </h2>
          <p className="text-xs text-muted">
            Concise implementation guidance from the versioned remediation library. Review before
            implementing; human review may still be required.
          </p>
          <ul className="mt-3 space-y-4 text-sm">
            {e.remediationPlan.map((plan) => (
              <li key={plan.remediationGroupId} className="rounded-lg border border-border p-4">
                <p className="font-semibold">{plan.title}</p>
                <p className="font-mono text-xs text-muted">
                  {plan.definitionId ?? plan.ruleId}
                  {plan.definitionVersion != null ? ` · v${plan.definitionVersion}` : ""}
                </p>
                <p className="mt-1">{plan.summary}</p>
                {plan.whyItWorks ? (
                  <p className="mt-1 text-muted">
                    <span className="font-medium text-foreground">Why this works: </span>
                    {plan.whyItWorks}
                  </p>
                ) : null}
                {plan.implementationSteps.length > 0 && (
                  <>
                    <h3 className="mt-2 text-xs font-semibold">Implementation steps</h3>
                    <ol className="list-decimal pl-5 text-muted">
                      {plan.implementationSteps.map((step) => (
                        <li key={step.slice(0, 48)}>{step}</li>
                      ))}
                    </ol>
                  </>
                )}
                {plan.codeExample ? (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">
                      Code example ({plan.selectedFramework ?? "html"})
                    </summary>
                    <pre className="mt-2 max-w-full overflow-x-auto rounded bg-muted/40 p-2 text-xs">
                      <code>{plan.codeExample}</code>
                    </pre>
                  </details>
                ) : null}
                {plan.verificationSteps.length > 0 && (
                  <>
                    <h3 className="mt-2 text-xs font-semibold">Verification</h3>
                    <ul className="list-disc pl-5 text-muted">
                      {plan.verificationSteps.map((v) => (
                        <li key={v.slice(0, 48)}>{v}</li>
                      ))}
                    </ul>
                  </>
                )}
                {plan.specializedTool ? (
                  <p className="mt-2 text-xs">
                    Specialized tool: {plan.specializedTool.label}
                  </p>
                ) : null}
                {plan.manualReviewStillRequired ? (
                  <p className="mt-1 text-xs text-muted">Manual review may still be required.</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      )}

      {e.incompleteFindings.length > 0 && (
        <section aria-labelledby="incomplete">
          <h2 id="incomplete" className="font-display text-lg font-bold">
            Needs manual confirmation
          </h2>
          <ul className="mt-2 space-y-2 text-sm">
            {e.incompleteFindings.map((inc) => (
              <li key={inc.ruleId} className="rounded border border-border p-3">
                <ProvenanceBadge label="Needs manual confirmation" />
                <p className="mt-1 font-semibold">{inc.title}</p>
                <p className="text-muted">{inc.description}</p>
                {inc.relatedHumanReviewCheckIds.length > 0 && (
                  <p className="mt-1 text-xs">
                    Related human-review procedure IDs:{" "}
                    {inc.relatedHumanReviewCheckIds.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {e.bestPracticeFindings.length > 0 && (
        <section aria-labelledby="bp">
          <h2 id="bp" className="font-display text-lg font-bold">
            Best-practice observations
          </h2>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {e.bestPracticeFindings.map((b) => (
              <li key={b.ruleId}>
                {b.title} — {b.totalOccurrences} occurrence(s)
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="human-review">
        <h2 id="human-review" className="font-display text-lg font-bold">
          Human review
        </h2>
        <p className="text-sm text-muted">{e.humanReview.disclaimer}</p>
        <p className="mt-2 text-sm">
          {e.counters.humanReviewReviewed} of {e.counters.humanReviewRelevant} relevant procedures
          reviewed · {e.counters.humanReviewRemainingOpen} remain open
        </p>
        <ul className="mt-3 space-y-3 text-sm">
          {e.humanReview.records.map((r) => (
            <li key={r.reviewId} className="rounded border border-border p-3">
              <p className="font-semibold">{r.title}</p>
              <p className="capitalize">Status: {r.status.replace(/_/g, " ")}</p>
              <p className="text-xs text-muted">{humanReviewResultWording(r.status)}</p>
              {r.applicableScope.representativeLabel ? (
                <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                  {r.applicableScope.representativeLabel}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {e.additionalEvidence.length > 0 && (
        <section aria-labelledby="evidence">
          <h2 id="evidence" className="font-display text-lg font-bold">
            Additional review evidence
          </h2>
          <ul className="mt-2 space-y-2 text-sm">
            {e.additionalEvidence.map((c) => (
              <li key={c.contributionId} className="rounded border border-border p-3">
                <ProvenanceBadge label={c.sourceType.replace(/_/g, " ")} />
                <p className="mt-1 font-semibold">{c.title}</p>
                <p className="text-muted">{c.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {e.verification.length > 0 && (
        <section aria-labelledby="verify">
          <h2 id="verify" className="font-display text-lg font-bold">
            Verification / rescan
          </h2>
          <ul className="mt-2 space-y-1 text-sm">
            {e.verification.slice(0, 25).map((v, i) => (
              <li key={`${v.ruleId}-${i}`}>
                {v.ruleId} · {v.statusLabel} · {v.pageUrl}
              </li>
            ))}
          </ul>
        </section>
      )}

      {e.pageInventory.length > 0 && (
        <section aria-labelledby="inventory" className="overflow-x-auto">
          <h2 id="inventory" className="font-display text-lg font-bold">
            Page inventory
          </h2>
          <table className="mt-2 w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-2 pr-2">
                  URL
                </th>
                <th scope="col" className="py-2 pr-2">
                  Viewport
                </th>
                <th scope="col" className="py-2 pr-2">
                  Failed
                </th>
                <th scope="col" className="py-2">
                  Occurrences
                </th>
              </tr>
            </thead>
            <tbody>
              {e.pageInventory.map((row) => (
                <tr key={row.url} className="border-b border-border">
                  <td className="max-w-[14rem] break-all py-2 pr-2">{row.url}</td>
                  <td className="py-2 pr-2">{row.viewportLabel}</td>
                  <td className="py-2 pr-2 tabular-nums">{row.failedRules}</td>
                  <td className="py-2 tabular-nums">{row.occurrences}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {report.aiRemediationAppendix ? (
        <AiRemediationAppendixSection appendix={report.aiRemediationAppendix} />
      ) : null}

      <section aria-labelledby="methodology">
        <h2 id="methodology" className="font-display text-lg font-bold">
          Methodology
        </h2>
        {e.methodology.sections.map((s) => (
          <div key={s.title} className="mt-2 text-sm">
            <h3 className="font-semibold">{s.title}</h3>
            <ul className="list-disc pl-5 text-muted">
              {s.bullets.map((b) => (
                <li key={b.slice(0, 40)}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <footer className="border-t border-border pt-4 text-xs text-muted">
        <p>{e.disclaimer}</p>
      </footer>
    </article>
  );
}
