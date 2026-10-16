import Link from "next/link";
import { Container } from "@/components/ui/Container";

export function SampleReportPromoBand() {
  return (
    <section
      aria-labelledby="sample-report-promo-heading"
      className="border-y border-border bg-card py-10 sm:py-12"
    >
      <Container className="max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <h2 id="sample-report-promo-heading" className="text-xl font-semibold tracking-tight">
              See a sample website accessibility report
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore a fictional preflight example with root causes, fix plans, human-review checks,
              and real PDF and Excel exports — no signup required.
            </p>
          </div>
          <Link
            href="/sample-accessibility-report"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            View sample report
          </Link>
        </div>
      </Container>
    </section>
  );
}
