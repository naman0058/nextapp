"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import type { ResultViewTab } from "@/features/website-scanner/types/resultUx";
import { WebsiteScanResultsShell } from "@/features/website-scanner/components/results/WebsiteScanResultsShell";
import { WebsiteScanSetupPanel } from "@/features/website-scanner/components/setup/WebsiteScanSetupPanel";
import { useWebsiteScanRunner } from "@/features/website-scanner/hooks/useWebsiteScanRunner";

const VALID_VIEWS: ResultViewTab[] = [
  "overview",
  "issues",
  "fix-plan",
  "human-review",
  "coverage",
  "inventory",
  "report",
];

function parseViewParam(value: string | null): ResultViewTab | null {
  if (!value) return null;
  return VALID_VIEWS.includes(value as ResultViewTab)
    ? (value as ResultViewTab)
    : null;
}

export function WebsiteAccessibilityScannerPage() {
  const { state, dispatch } = useWebsiteScanSession();
  const { runBatchScan } = useWebsiteScanRunner(dispatch);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [urlInput, setUrlInput] = useState("https://example.com");
  const [authConfirm, setAuthConfirm] = useState(false);
  const [includeBestPractices, setIncludeBestPractices] = useState(true);

  const completedPages = useMemo(
    () =>
      state.pages
        .filter((p) => p.status === "complete")
        .flatMap((p) => {
          const list = [];
          if (p.desktopResult) list.push(p.desktopResult);
          if (p.mobileResult) list.push(p.mobileResult);
          if (p.result && list.length === 0) list.push(p.result);
          return list;
        }),
    [state.pages],
  );

  useEffect(() => {
    const fromUrl = parseViewParam(searchParams.get("view"));
    if (fromUrl && fromUrl !== state.resultView) {
      dispatch({ type: "SET_RESULT_VIEW", view: fromUrl });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const hasResults = state.pages.some((p) => p.status === "complete");
    if (!hasResults && state.status === "idle") return;
    const handler = (e: BeforeUnloadEvent) => {
      if (state.status === "scanning" || hasResults) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [state.status, state.pages]);

  function syncViewToUrl(view: ResultViewTab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const showResults =
    state.status === "complete" ||
    state.status === "partial" ||
    completedPages.length > 0;

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-foreground">
          Scan a public website
        </h2>
        <p className="mt-2 text-sm text-muted">
          Review up to 25 public pages with optional sitemap discovery, manual page
          selection, and desktop/mobile comparison. Only scan sites you are authorized
          to evaluate.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="scan-url" className="text-sm font-medium">
              Website URL
            </label>
            <input
              id="scan-url"
              type="url"
              required
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={urlInput}
              onChange={(ev) => setUrlInput(ev.target.value)}
            />
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={authConfirm}
              onChange={(ev) => setAuthConfirm(ev.target.checked)}
            />
            <span>
              I confirm this is a public website I am authorized to evaluate,
              including sitemap discovery and multi-page scanning where selected.
            </span>
          </label>

          <WebsiteScanSetupPanel
            urlInput={urlInput}
            authConfirm={authConfirm}
            includeBestPractices={includeBestPractices}
            onIncludeBestPractices={setIncludeBestPractices}
          />
        </div>

        <div className="mt-4 text-sm text-muted" role="status" aria-live="polite">
          {state.stageLabel && <p>{state.stageLabel}</p>}
          {state.liveMessage && <p>{state.liveMessage}</p>}
        </div>
      </section>

      {showResults && (
        <WebsiteScanResultsShell
          completedPages={completedPages}
          onRescan={(saveSnapshot) => {
            if (saveSnapshot) dispatch({ type: "SAVE_SNAPSHOT_FOR_COMPARE" });
            dispatch({ type: "MARK_AI_STALE" });
            const urls =
              state.selectedUrlKeys.length > 0
                ? state.selectedUrlKeys
                    .map(
                      (k) =>
                        state.discoveredUrls.find((d) => d.normalizedKey === k)?.url ??
                        state.pages.find((p) => p.normalizedKey === k)?.url,
                    )
                    .filter(Boolean)
                : state.pages.map((p) => p.url);
            const selected = (urls as string[]).filter(Boolean);
            if (selected.length === 0 && urlInput.trim()) {
              void runBatchScan({
                rootUrl: urlInput.trim(),
                selectedUrls: [urlInput.trim()],
                viewportMode: state.viewportMode,
                includeBestPractices,
              });
              return;
            }
            void runBatchScan({
              rootUrl: state.rootUrl || urlInput.trim(),
              selectedUrls: selected.length ? selected : [urlInput.trim()],
              viewportMode: state.viewportMode,
              includeBestPractices,
            });
          }}
          syncViewToUrl={syncViewToUrl}
        />
      )}
    </div>
  );
}
