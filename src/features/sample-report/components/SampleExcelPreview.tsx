"use client";

import { useState } from "react";
import type { SampleAccessibilityReportFixture } from "@/features/sample-report/buildSampleAccessibilityReportFixture";

const TABS = [
  { id: "exec", label: "Executive Summary" },
  { id: "root", label: "Root Causes" },
  { id: "fix", label: "Fix Plan" },
  { id: "inv", label: "Page Inventory" },
] as const;

type Props = { fixture: SampleAccessibilityReportFixture };

export function SampleExcelPreview({ fixture }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("exec");
  const intel = fixture.session.siteIntelligence;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="font-semibold">Excel workbook preview (structure)</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Preview workbook structure — download the .xlsx for the full multi-sheet export.
      </p>
      <div
        role="tablist"
        aria-label="Sample workbook sheets"
        className="mt-4 flex flex-wrap gap-2"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              tab === t.id ? "border-primary bg-primary/10" : "border-border"
            }`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-4 overflow-x-auto text-sm">
        {tab === "exec" && intel ? (
          <table className="min-w-full border-collapse">
            <caption className="sr-only">Executive summary sample rows</caption>
            <tbody>
              <tr>
                <th className="border border-border px-2 py-1 text-left">Pages scanned</th>
                <td className="border border-border px-2 py-1">
                  {fixture.session.scanScope.pagesCompleted}
                </td>
              </tr>
              <tr>
                <th className="border border-border px-2 py-1 text-left">Root causes</th>
                <td className="border border-border px-2 py-1">{intel.summary.likelyRootCauses}</td>
              </tr>
              <tr>
                <th className="border border-border px-2 py-1 text-left">Total occurrences</th>
                <td className="border border-border px-2 py-1">{intel.summary.totalOccurrences}</td>
              </tr>
            </tbody>
          </table>
        ) : null}
        {tab === "root" && intel ? (
          <table className="min-w-full border-collapse">
            <caption className="sr-only">Root causes sample rows</caption>
            <thead>
              <tr>
                <th className="border border-border px-2 py-1">Label</th>
                <th className="border border-border px-2 py-1">Occurrences</th>
                <th className="border border-border px-2 py-1">Pages</th>
              </tr>
            </thead>
            <tbody>
              {intel.rootCauseGroups.slice(0, 5).map((g) => (
                <tr key={g.id}>
                  <td className="border border-border px-2 py-1">{g.label}</td>
                  <td className="border border-border px-2 py-1">{g.totalOccurrences}</td>
                  <td className="border border-border px-2 py-1">{g.affectedPages.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
        {tab === "fix" && intel ? (
          <table className="min-w-full border-collapse">
            <caption className="sr-only">Fix plan sample rows</caption>
            <thead>
              <tr>
                <th className="border border-border px-2 py-1">Order</th>
                <th className="border border-border px-2 py-1">Task</th>
                <th className="border border-border px-2 py-1">Priority</th>
              </tr>
            </thead>
            <tbody>
              {intel.fixPlan.slice(0, 6).map((item) => (
                <tr key={item.rank}>
                  <td className="border border-border px-2 py-1">{item.rank}</td>
                  <td className="border border-border px-2 py-1">{item.title}</td>
                  <td className="border border-border px-2 py-1">{item.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
        {tab === "inv" ? (
          <table className="min-w-full border-collapse">
            <caption className="sr-only">Page inventory sample rows</caption>
            <thead>
              <tr>
                <th className="border border-border px-2 py-1">Page</th>
                <th className="border border-border px-2 py-1">Viewports</th>
              </tr>
            </thead>
            <tbody>
              {fixture.session.pages.slice(0, 6).map((p) => (
                <tr key={p.url}>
                  <td className="border border-border px-2 py-1 break-all">{p.url}</td>
                  <td className="border border-border px-2 py-1">
                    {p.desktopResult && p.mobileResult ? "Desktop + Mobile" : "Desktop"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}
