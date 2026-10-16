import type { ReportAiRemediationAppendix } from "@/features/reports/types/reportAiRemediation";
import type { ReportAiRemediationEntry } from "@/features/reports/types/reportAiRemediation";
import { escapeHtml } from "@/lib/ai/remediation/report/escapeHtml";

function FactsList({ entry }: { entry: ReportAiRemediationEntry }) {
  const f = entry.facts;
  if (!f) return null;
  const items: string[] = [];
  if (f.ruleId) items.push(`Rule: ${f.ruleId}`);
  if (f.wcag) items.push(`WCAG: ${f.wcag}`);
  if (f.impact) items.push(`Impact: ${f.impact}`);
  if (f.priority) items.push(`Priority: ${f.priority}`);
  if (f.pageCount != null) items.push(`Pages: ${f.pageCount}`);
  if (f.occurrenceCount != null) items.push(`Occurrences: ${f.occurrenceCount}`);
  if (f.measuredRatio) items.push(`Measured ratio: ${f.measuredRatio}`);
  if (f.requiredThreshold) items.push(`Required threshold: ${f.requiredThreshold}`);
  if (f.contrastResult) items.push(`Result: ${f.contrastResult}`);
  if (f.suggestedDeterministicColor)
    items.push(`Deterministic suggested color: ${f.suggestedDeterministicColor}`);
  if (f.originalContent) items.push(`Original: ${f.originalContent}`);
  if (f.originalCue)
    items.push(`Original cue (${f.cueTimestamp ?? ""}): ${f.originalCue}`);
  if (f.imageAnalysisSource) items.push(f.imageAnalysisSource);
  if (f.batchRow != null)
    items.push(`Batch row ${f.batchRow}, field: ${f.batchField ?? ""}`);
  if (items.length === 0) return null;
  return (
    <div className="mt-2 rounded border border-border bg-muted-bg p-2 text-sm">
      <p className="font-semibold text-foreground">Deterministic evidence</p>
      <ul className="mt-1 list-disc pl-5 text-foreground">
        {items.map((item) => (
          <li key={item.slice(0, 48)}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function EntryBlock({ entry }: { entry: ReportAiRemediationEntry }) {
  const r = entry.remediation;
  return (
    <article className="mt-6 break-inside-avoid border-t border-border pt-4">
      <h4 className="font-display text-base font-bold text-foreground">
        {entry.title}
      </h4>
      <p className="mt-1 text-sm">
        <span className="font-semibold">AI-Assisted</span>
        {" · "}
        Source: {entry.source}
        {entry.sampleLabel ? (
          <>
            {" · "}
            <span>{entry.sampleLabel}</span>
          </>
        ) : null}
      </p>
      {entry.stale ? (
        <p className="mt-1 text-sm font-semibold text-foreground">
          Stale guidance — {entry.staleReason ?? "Generated from previous scan evidence"}
        </p>
      ) : null}
      <FactsList entry={entry} />
      <p className="mt-3 text-sm text-foreground">{r.problemSummary}</p>
      <p className="mt-2 text-sm text-muted">{r.whyItMatters}</p>
      {r.recommendedApproach.length > 0 ? (
        <>
          <p className="mt-3 text-sm font-semibold">Recommended approach</p>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {r.recommendedApproach.map((line) => (
              <li key={line.slice(0, 40)}>{line}</li>
            ))}
          </ul>
        </>
      ) : null}
      {r.suggestedContent ? (
        <>
          <p className="mt-3 text-sm font-semibold">AI-Assisted suggested revision</p>
          <p className="mt-1 whitespace-pre-wrap text-sm">{r.suggestedContent}</p>
        </>
      ) : null}
      {r.suggestedCode?.code ? (
        <>
          <p className="mt-3 text-sm font-semibold">
            Possible implementation pattern ({r.suggestedCode.language})
          </p>
          <pre className="mt-1 max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded bg-muted-bg p-3 text-xs">
            <code>{r.suggestedCode.code}</code>
          </pre>
          <p className="mt-1 text-xs text-muted">{r.suggestedCode.explanation}</p>
        </>
      ) : null}
      {r.acceptanceCriteria.length > 0 ? (
        <>
          <p className="mt-3 text-sm font-semibold">Acceptance criteria</p>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {r.acceptanceCriteria.map((line) => (
              <li key={line.slice(0, 40)}>{line}</li>
            ))}
          </ul>
        </>
      ) : null}
      {r.verificationSteps.length > 0 ? (
        <>
          <p className="mt-3 text-sm font-semibold">Verification steps</p>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {r.verificationSteps.map((line) => (
              <li key={line.slice(0, 40)}>{line}</li>
            ))}
          </ul>
        </>
      ) : null}
      {r.humanReview.length > 0 ? (
        <>
          <p className="mt-3 text-sm font-semibold">Human review</p>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {r.humanReview.map((line) => (
              <li key={line.slice(0, 40)}>{line}</li>
            ))}
          </ul>
        </>
      ) : null}
      {r.limitations.length > 0 ? (
        <>
          <p className="mt-3 text-sm font-semibold">Limitations</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-muted">
            {r.limitations.map((line) => (
              <li key={line.slice(0, 40)}>{line}</li>
            ))}
          </ul>
        </>
      ) : null}
    </article>
  );
}

/** Static HTML string for tests / non-React consumers */
export function aiRemediationAppendixHtmlString(
  appendix: ReportAiRemediationAppendix,
): string {
  return appendix.entries
    .map((entry) => {
      const r = entry.remediation;
      const code = r.suggestedCode?.code
        ? `<pre><code>${escapeHtml(r.suggestedCode.code)}</code></pre>`
        : "";
      return `<section><h3>${escapeHtml(entry.title)}</h3><p>AI-Assisted</p>${code}</section>`;
    })
    .join("");
}

type Props = {
  appendix: ReportAiRemediationAppendix;
};

export function AiRemediationAppendixSection({ appendix }: Props) {
  return (
    <section
      className="mt-10 break-inside-avoid print:block"
      aria-labelledby="ai-remediation-appendix-heading"
    >
      <h3
        id="ai-remediation-appendix-heading"
        className="font-display text-lg font-bold text-foreground"
      >
        AI-Assisted Remediation Appendix
      </h3>
      {appendix.sampleLabel ? (
        <p className="mt-1 text-sm font-semibold text-foreground">
          {appendix.sampleLabel}
        </p>
      ) : null}
      <p className="mt-2 text-sm text-muted">{appendix.intro}</p>
      {appendix.entries.map((entry) => (
        <EntryBlock key={entry.id} entry={entry} />
      ))}
    </section>
  );
}
