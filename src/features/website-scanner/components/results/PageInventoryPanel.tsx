"use client";

import { useMemo, useState } from "react";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import { collectPageScanResults } from "@/features/website-scanner/utils/collectPageScanResults";

type SortKey = "url" | "issues" | "serious";

export function PageInventoryPanel() {
  const { state } = useWebsiteScanSession();
  const [sort, setSort] = useState<SortKey>("issues");

  const rows = useMemo(() => {
    return state.pages
      .filter((p) => p.status === "complete")
      .map((p) => {
        const results = collectPageScanResults([p]);
        const primary = p.desktopResult ?? p.mobileResult ?? p.result;
        const ruleIds = new Set<string>();
        let serious = 0;
        for (const r of results) {
          for (const v of r.violations) {
            if (v.isBestPractice) continue;
            ruleIds.add(v.id);
            if (v.impact === "critical" || v.impact === "serious") serious += 1;
          }
        }
        const unique = ruleIds.size;
        return {
          url: primary?.finalUrl ?? p.url,
          title: primary?.pageTitle ?? "—",
          viewport: p.desktopResult && p.mobileResult ? "Both" : primary?.viewport.label ?? "—",
          completeness: primary?.scanCompleteness ?? "complete",
          uniqueIssues: unique,
          serious,
        };
      })
      .sort((a, b) => {
        if (sort === "url") return a.url.localeCompare(b.url);
        if (sort === "serious") return b.serious - a.serious;
        return b.uniqueIssues - a.uniqueIssues;
      });
  }, [state.pages, sort]);

  return (
    <div className="space-y-3">
      <label className="text-sm">
        Sort by
        <select
          className="ml-2 rounded border border-border bg-background px-2 py-1"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
        >
          <option value="issues">Issue count</option>
          <option value="serious">Serious/critical</option>
          <option value="url">URL</option>
        </select>
      </label>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-2">URL</th>
              <th className="p-2">Title</th>
              <th className="p-2">Viewport</th>
              <th className="p-2">Completeness</th>
              <th className="p-2">Rules</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.url} className="border-b border-border/50">
                <td className="max-w-xs break-all p-2">{r.url}</td>
                <td className="p-2">{r.title}</td>
                <td className="p-2">{r.viewport}</td>
                <td className="p-2">{r.completeness}</td>
                <td className="p-2">{r.uniqueIssues}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
