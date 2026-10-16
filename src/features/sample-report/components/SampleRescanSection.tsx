"use client";

import { compareScanSnapshots } from "@/features/website-scanner/utils/compareScanSnapshots";
import { RescanComparisonBanner } from "@/features/website-scanner/components/results/RescanComparisonBanner";
import type { SampleAccessibilityReportFixture } from "@/features/sample-report/buildSampleAccessibilityReportFixture";

type Props = { fixture: SampleAccessibilityReportFixture };

export function SampleRescanSection({ fixture }: Props) {
  const comparison = compareScanSnapshots(
    fixture.rescanDemo.previous,
    fixture.rescanDemo.current,
  );

  return (
    <section id="sample-rescan" aria-labelledby="sample-rescan-heading" className="space-y-4">
      <h2 id="sample-rescan-heading" className="text-2xl font-semibold">
        Example rescan comparison
      </h2>
      <p className="text-sm text-muted-foreground">
        Illustrative before/after counts from a fictional second scan — not a live rescan on this
        page.
      </p>
      <ul className="grid gap-3 sm:grid-cols-3">
        <li className="rounded-lg border border-border p-4 text-sm">
          <p className="font-semibold">Navigation accessible names</p>
          <p className="mt-1 text-muted-foreground">Before: 12 occurrences · After: 0</p>
          <p className="mt-2 text-green-800 dark:text-green-200">Example status: Verified resolved</p>
        </li>
        <li className="rounded-lg border border-border p-4 text-sm">
          <p className="font-semibold">Form labels</p>
          <p className="mt-1 text-muted-foreground">Before: 8 · After: 2</p>
          <p className="mt-2">Example status: Partially improved</p>
        </li>
        <li className="rounded-lg border border-border p-4 text-sm">
          <p className="font-semibold">Mobile viewport</p>
          <p className="mt-1 text-muted-foreground">New: 1 mobile-only finding in demo</p>
        </li>
      </ul>
      <RescanComparisonBanner comparison={comparison} />
    </section>
  );
}
