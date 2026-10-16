"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Container } from "@/components/ui/Container";
import { SampleWebsiteScanProvider } from "@/features/sample-report/SampleWebsiteScanProvider";
import { SampleDisclaimerBanner } from "@/features/sample-report/components/SampleDisclaimerBanner";
import { SampleVisualIssueDemo } from "@/features/sample-report/components/SampleVisualIssueDemo";
import { SampleDeveloperTicketSection } from "@/features/sample-report/components/SampleDeveloperTicketSection";
import { SampleRescanSection } from "@/features/sample-report/components/SampleRescanSection";
import { SampleExportSection } from "@/features/sample-report/components/SampleExportSection";
import { SampleReportFeatureCards } from "@/features/sample-report/components/SampleReportFeatureCards";
import { SampleReportFaq } from "@/features/sample-report/components/SampleReportFaq";
import { SampleTrustSection } from "@/features/sample-report/components/SampleTrustSection";
import {
  SAMPLE_DEMONSTRATION_DATE,
  SAMPLE_FICTIONAL_ORG_FULL,
} from "@/features/sample-report/constants";
import { ScanScopeBanner } from "@/features/website-scanner/components/results/ScanScopeBanner";
import { StartHereCard } from "@/features/website-scanner/components/results/StartHereCard";
import { RootCauseCard } from "@/features/website-scanner/components/results/RootCauseCard";
import { WcagCoverageMatrix } from "@/features/website-scanner/components/results/WcagCoverageMatrix";
import { ViewportComparisonPanel } from "@/features/website-scanner/components/results/ViewportComparisonPanel";
import { PageInventoryPanel } from "@/features/website-scanner/components/results/PageInventoryPanel";
import { FixPlanTab } from "@/features/website-scanner/components/results/FixPlanTab";
import { HumanReviewTab } from "@/features/website-scanner/components/results/HumanReviewTab";
import { IssuesTab } from "@/features/website-scanner/components/results/IssuesTab";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import { getStartHereItems, sortRootCauseGroups } from "@/features/website-scanner/utils/issueViewModels";
import { REPORT_DISCLAIMER } from "@/features/reports/constants/disclaimer";
import { BASE_REPORT_LIMITATIONS } from "@/features/reports/constants/limitations";
import type { WebsiteScannerPublicCta } from "@/lib/scanner/getWebsiteScannerPublicCta";
import type { SampleAccessibilityReportFixture } from "@/features/sample-report/buildSampleAccessibilityReportFixture";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

import "@/features/sample-report/sample-report-print.css";

type SampleReportBodyProps = {
  cta: WebsiteScannerPublicCta;
  fixture: SampleAccessibilityReportFixture;
};

function SampleReportBody({ cta, fixture }: SampleReportBodyProps) {
  const { state } = useWebsiteScanSession();
  const intel = state.siteIntelligence;
  const completedPages = useMemo((): WebsitePageScanResult[] => {
    const list: WebsitePageScanResult[] = [];
    for (const p of state.pages) {
      if (p.status !== "complete") continue;
      if (p.desktopResult) list.push(p.desktopResult);
      if (p.mobileResult) list.push(p.mobileResult);
    }
    return list;
  }, [state.pages]);

  const startHere = intel ? getStartHereItems(intel.fixPlan).slice(0, 5) : [];
  const rootGroups = intel ? sortRootCauseGroups(intel.rootCauseGroups).slice(0, 8) : [];

  return (
    <Container className="max-w-6xl py-10 sm:py-14 sample-report-print-root">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">Sample Accessibility Report</span>
      </nav>

      <header className="mt-6 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Sample report</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          See what an accessibility preflight report looks like
        </h1>
        <p className="mt-3 text-muted-foreground">
          Explore a fictional example showing automated findings, root causes, visual issue evidence,
          remediation guidance, human-review checks, responsive differences, and professional exports.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {cta.available ? (
            <Link
              href={cta.href}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              {cta.label}
            </Link>
          ) : (
            <Link
              href={cta.href}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              {cta.label}
            </Link>
          )}
          <a
            href="#sample-overview"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
          >
            Explore sample report
          </a>
        </div>
        {!cta.available && cta.unavailableMessage ? (
          <p className="mt-3 text-sm text-muted-foreground">{cta.unavailableMessage}</p>
        ) : null}
      </header>

      <div className="mt-8">
        <SampleDisclaimerBanner />
      </div>

      <SampleReportFeatureCards />

      <nav
        aria-label="Sample report sections"
        className="sample-no-print mt-8 flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3 text-sm"
      >
        {[
          ["#sample-overview", "Overview"],
          ["#sample-issues", "Issues"],
          ["#sample-fix-plan", "Fix plan"],
          ["#sample-human-review", "Human review"],
          ["#sample-exports", "Exports"],
        ].map(([href, label]) => (
          <a key={href} href={href} className="rounded-lg border border-border px-3 py-1 hover:bg-muted">
            {label}
          </a>
        ))}
      </nav>

      <section id="sample-overview" className="mt-12 space-y-8">
        <div>
          <h2 className="text-2xl font-semibold">Accessibility preflight report</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Prepared for: {SAMPLE_FICTIONAL_ORG_FULL} · {SAMPLE_DEMONSTRATION_DATE}
          </p>
          <p className="mt-1 text-sm">
            Summary status: <strong>Automated issues found</strong> · Human review required
          </p>
        </div>
        <ScanScopeBanner />
        {intel ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Pages reviewed" value={state.scanScope.pagesCompleted} />
            <SummaryCard label="Likely root causes" value={intel.summary.likelyRootCauses} />
            <SummaryCard label="Affected elements (approx.)" value={intel.summary.totalOccurrences} />
            <SummaryCard label="Human review signals" value={intel.summary.humanReviewItems} />
          </div>
        ) : null}
        <ViewportComparisonPanel />
      </section>

      <section id="sample-start-here" className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Start here</h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {startHere.map((item) => (
            <li key={item.rank}>
              <StartHereCard item={item} sharedFixHint={item.likelySharedFix} sampleMode />
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12">
        <SampleVisualIssueDemo />
      </div>

      <section id="sample-root-causes" className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Root causes</h2>
        <p className="text-sm text-muted-foreground">
          Grouped patterns — not one card per affected element.
        </p>
        <ul className="grid gap-4 md:grid-cols-2">
          {rootGroups.map((g) => (
            <li key={g.id}>
              <RootCauseCard group={g} />
            </li>
          ))}
        </ul>
      </section>

      <section id="sample-fix-plan" className="mt-12">
        <h2 className="text-2xl font-semibold">Fix plan</h2>
        <FixPlanTab intel={intel} completedPages={completedPages} onRescanVerify={() => {}} sampleMode />
      </section>

      <div className="mt-12">
        <SampleDeveloperTicketSection fixture={fixture} />
      </div>

      <section id="sample-wcag" className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">WCAG coverage matrix</h2>
        {intel ? <WcagCoverageMatrix coverage={intel.wcagCoverage} /> : null}
        {intel ? (
          <details className="rounded-lg border border-border p-4">
            <summary className="cursor-pointer font-medium">View full sample matrix</summary>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <caption className="sr-only">WCAG coverage sample</caption>
                <thead>
                  <tr>
                    <th className="border border-border px-2 py-1">Criterion</th>
                    <th className="border border-border px-2 py-1">Level</th>
                    <th className="border border-border px-2 py-1">Automation</th>
                    <th className="border border-border px-2 py-1">Automated result</th>
                    <th className="border border-border px-2 py-1">Human review</th>
                  </tr>
                </thead>
                <tbody>
                  {intel.wcagCoverage.slice(0, 24).map((row) => (
                    <tr key={row.criterion}>
                      <td className="border border-border px-2 py-1">
                        {row.criterion} {row.name}
                      </td>
                      <td className="border border-border px-2 py-1">{row.level}</td>
                      <td className="border border-border px-2 py-1">{row.automation}</td>
                      <td className="border border-border px-2 py-1">{row.automatedResult}</td>
                      <td className="border border-border px-2 py-1">{row.manualReviewStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              No automated finding detected does not establish conformance with the criterion.
            </p>
          </details>
        ) : null}
      </section>

      <section id="sample-human-review" className="mt-12">
        <h2 className="text-2xl font-semibold">Guided human review</h2>
        <HumanReviewTab completedPages={completedPages} sampleMode />
      </section>

      <section id="sample-inventory" className="mt-12">
        <h2 className="text-2xl font-semibold">Page inventory</h2>
        <PageInventoryPanel />
      </section>

      <div className="mt-12">
        <SampleRescanSection fixture={fixture} />
      </div>

      <section id="sample-issues" className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Automated findings</h2>
        <IssuesTab intel={intel} completedPages={completedPages} sampleMode />
      </section>

      <div className="mt-12">
        <SampleExportSection fixture={fixture} />
      </div>

      <SampleTrustSection />
      <SampleReportFaq />

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Methodology and limitations</h2>
        <p className="text-sm text-muted-foreground">{REPORT_DISCLAIMER}</p>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {BASE_REPORT_LIMITATIONS.slice(0, 4).map((line) => (
            <li key={line.slice(0, 40)}>{line}</li>
          ))}
        </ul>
        <Link href="/methodology" className="text-sm font-medium text-primary hover:underline">
          Read our methodology
        </Link>
      </section>

      <section className="sample-no-print mt-12 rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">Ready to run your own review?</h2>
        <p className="mt-2 text-muted-foreground">
          Use the same export and fix workflows on your public pages when the scanner is enabled for
          your environment.
        </p>
        <Link
          href={cta.href}
          className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          {cta.label}
        </Link>
      </section>
    </Container>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

type SamplePageProps = {
  cta: WebsiteScannerPublicCta;
  fixture: SampleAccessibilityReportFixture;
};

export function SampleAccessibilityReportPage({ cta, fixture }: SamplePageProps) {
  return (
    <SampleWebsiteScanProvider fixture={fixture}>
      <SampleReportBody cta={cta} fixture={fixture} />
    </SampleWebsiteScanProvider>
  );
}
