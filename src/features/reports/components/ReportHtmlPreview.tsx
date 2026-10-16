import type { AccessibilityPreflightReport } from "@/features/reports/types/reportModel";
import type { ReportSection } from "@/features/reports/types/reportModel";
import { reportStatusLabel } from "@/features/reports/types/reportStatus";
import { APPLICATION_NAME } from "@/features/reports/constants/reportVersion";
import { AiRemediationAppendixSection } from "@/features/reports/components/AiRemediationAppendixSection";

type ReportHtmlPreviewProps = {
  report: AccessibilityPreflightReport;
  printRootClassName?: string;
};

function SectionBlock({ section }: { section: ReportSection }) {
  return (
    <section className="mt-8 break-inside-avoid">
      <h3 className="font-display text-lg font-bold text-foreground">
        {section.title}
      </h3>
      <p className="text-sm text-muted">
        Status: {section.sectionStatus}
        {section.summaryLabel ? ` — ${section.summaryLabel}` : null}
      </p>
      <ul className="mt-3 space-y-3">
        {section.findings.map((f) => (
          <li
            key={f.id}
            className="rounded-lg border border-border bg-muted-bg px-3 py-2 text-sm"
          >
            <p className="font-semibold text-foreground">
              {f.title}{" "}
              <span className="font-normal text-muted">
                ({reportStatusLabel(f.status)}
                {f.sourceType === "ai" ? ", AI-assisted" : ""})
              </span>
            </p>
            <p className="mt-1 text-foreground">{f.finding}</p>
            {f.recommendation ? (
              <p className="mt-1 text-muted">Recommendation: {f.recommendation}</p>
            ) : null}
          </li>
        ))}
      </ul>
      {section.notes?.length ? (
        <ul className="mt-2 list-disc pl-5 text-xs text-muted">
          {section.notes.map((n) => (
            <li key={n.slice(0, 40)}>{n}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function ReportHtmlPreview({
  report,
  printRootClassName = "acps-report-print-root",
}: ReportHtmlPreviewProps) {
  const sections = [
    report.textAccessibility,
    report.imageAccessibility,
    report.visualAccessibility,
    report.screenReaderPreview,
    report.videoAccessibility,
    report.platformPublishing,
  ].filter(Boolean) as ReportSection[];

  return (
    <article className={printRootClassName}>
      <header className="border-b border-border pb-4">
        <p className="text-xs uppercase tracking-wide text-muted">
          {APPLICATION_NAME}
        </p>
        <h2 className="font-display text-2xl font-bold text-foreground">
          {report.projectInfo.reportTitle?.trim() ||
            "Accessibility Preflight Report"}
        </h2>
        <dl className="mt-3 grid gap-1 text-sm text-muted sm:grid-cols-2">
          <div>
            <dt className="inline font-semibold text-foreground">Report ID: </dt>
            <dd className="inline">{report.reportId}</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-foreground">Generated: </dt>
            <dd className="inline">{report.generatedAtDisplay}</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-foreground">Overall: </dt>
            <dd className="inline">{report.summary.overallStatus}</dd>
          </div>
          {report.platform ? (
            <div>
              <dt className="inline font-semibold text-foreground">Platform: </dt>
              <dd className="inline">{report.platform}</dd>
            </div>
          ) : null}
        </dl>
        {report.projectInfo.clientOrganization ? (
          <p className="mt-2 text-sm text-muted">
            Client: {report.projectInfo.clientOrganization}
          </p>
        ) : null}
      </header>

      <section className="mt-6">
        <h3 className="font-display text-lg font-bold">Executive summary</h3>
        <p className="mt-2 text-sm text-foreground">
          {report.summary.checksCompleted} checks recorded;{" "}
          {report.summary.itemsReady} ready,{" "}
          {report.summary.itemsRequiringReview} need review,{" "}
          {report.summary.importantIssues} important issue(s).
        </p>
        <ul className="mt-2 flex flex-wrap gap-2 text-xs">
          {report.summary.sectionSummaries.map((s) => (
            <li
              key={s.id}
              className="rounded-full border border-border px-2 py-0.5 text-muted"
            >
              {s.label}
            </li>
          ))}
        </ul>
      </section>

      {report.finalWorkingCaption ? (
        <section className="mt-6">
          <h3 className="font-display text-lg font-bold">Working caption</h3>
          <p className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-muted-bg p-3 text-sm">
            {report.finalWorkingCaption}
          </p>
        </section>
      ) : null}

      {report.altText ? (
        <section className="mt-6">
          <h3 className="font-display text-lg font-bold">Alt text</h3>
          <p className="mt-2 rounded-lg border border-border bg-muted-bg p-3 text-sm">
            {report.altText}
          </p>
        </section>
      ) : null}

      {sections.map((section) => (
        <SectionBlock key={section.id} section={section} />
      ))}

      {report.humanReview.items.length > 0 ? (
        <section className="mt-8">
          <h3 className="font-display text-lg font-bold">Human review tasks</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {report.humanReview.items.map((item) => (
              <li key={item.id} className="border-l-2 border-border pl-3">
                <span className="font-semibold">{item.title}</span> ({item.priority}
                ) — {item.detail}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {report.aiRemediationAppendix ? (
        <AiRemediationAppendixSection appendix={report.aiRemediationAppendix} />
      ) : null}

      {report.methodology.categories.length > 0 ? (
        <section className="mt-8">
          <h3 className="font-display text-lg font-bold">Methodology</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-muted">
            {report.methodology.categories.map((c) => (
              <li key={c.type}>
                <strong className="text-foreground">{c.label}</strong>:{" "}
                {c.examples.join("; ")}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="mt-10 border-t border-border pt-4 text-xs text-muted">
        <p>{report.disclaimer}</p>
        <ul className="mt-2 list-disc pl-5">
          {report.limitations.map((l) => (
            <li key={l.slice(0, 48)}>{l}</li>
          ))}
        </ul>
      </footer>
    </article>
  );
}
