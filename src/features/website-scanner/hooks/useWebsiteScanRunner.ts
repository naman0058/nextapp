"use client";

import { useCallback, useRef } from "react";
import {
  MAX_DUAL_VIEWPORT_PAGES,
  MAX_SITE_SCAN_PAGES,
  SITE_CRAWL_DELAY_MS,
} from "@/features/website-scanner/constants/scanLimits";
import type { ScanViewportId } from "@/features/website-scanner/constants/viewports";
import type { WebsiteScanAction } from "@/features/website-scanner/state/websiteScanReducer";
import type { ViewportScanMode } from "@/features/website-scanner/types/websiteDiscovery";
import { safeCrawlKey } from "@/features/website-scanner/utils/crawl/safeCrawlKey";

type Dispatch = (action: WebsiteScanAction) => void;

export type RunBatchScanParams = {
  rootUrl: string;
  selectedUrls: string[];
  viewportMode: ViewportScanMode;
  includeBestPractices: boolean;
};

async function scanOnePage(
  url: string,
  options: {
    viewportId: ScanViewportId;
    rootOrigin: string | null;
    includeBestPractices: boolean;
    signal: AbortSignal;
    siteBatch: {
      batchId: string;
      pageIndex: number;
      pageTotal: number;
      viewportMode: ViewportScanMode;
      batchTicket: string;
    };
  },
) {
  const res = await fetch("/api/accessibility/website/scan-page", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      viewport: options.viewportId,
      mode: options.siteBatch.pageTotal > 1 ? "small_site" : "single_page",
      rootOrigin: options.rootOrigin,
      includeBestPractices: options.includeBestPractices,
      siteBatch: options.siteBatch,
    }),
    signal: options.signal,
  });
  const body = (await res.json()) as {
    result?: import("@/features/website-scanner/types/scanTypes").WebsitePageScanResult;
    error?: string;
    code?: string;
  };
  if (!res.ok || !body.result) {
    return { ok: false as const, error: body.error ?? "Scan failed.", code: body.code };
  }
  return { ok: true as const, result: body.result };
}

export function useWebsiteScanRunner(dispatch: Dispatch) {
  const abortRef = useRef<AbortController | null>(null);
  const stoppingRef = useRef(false);

  const stopScan = useCallback(() => {
    stoppingRef.current = true;
    abortRef.current?.abort();
    dispatch({ type: "STOP_SCAN" });
  }, [dispatch]);

  const runBatchScan = useCallback(
    async (
      params: RunBatchScanParams & { batchId?: string },
    ) => {
      const selected = params.selectedUrls.slice(0, MAX_SITE_SCAN_PAGES);
      if (
        params.viewportMode === "compare" &&
        selected.length > MAX_DUAL_VIEWPORT_PAGES
      ) {
        throw new Error(
          `Desktop + Mobile comparison supports up to ${MAX_DUAL_VIEWPORT_PAGES} pages.`,
        );
      }
      const batchId = params.batchId ?? crypto.randomUUID();
      const batchTicket = await registerBatch(
        batchId,
        params.rootUrl,
        selected,
        params.viewportMode,
      );

      abortRef.current?.abort();
      stoppingRef.current = false;
      const ac = new AbortController();
      abortRef.current = ac;

      dispatch({
        type: "START_BATCH_SCAN",
        rootUrl: params.rootUrl,
        selectedUrls: selected,
        viewportMode: params.viewportMode,
        includeBestPractices: params.includeBestPractices,
        batchId,
      });
      dispatch({ type: "SET_STATUS", status: "scanning" });

      let rootOrigin: string | null = null;
      const finalUrlsSeen = new Set<string>();

      for (let i = 0; i < selected.length; i++) {
        if (ac.signal.aborted || stoppingRef.current) break;
        const url = selected[i]!;
        dispatch({ type: "PAGE_SCANNING", url });
        dispatch({
          type: "SET_STAGE",
          stageLabel: "Running automated accessibility checks",
          liveMessage: `Scanning page ${i + 1} of ${selected.length}: ${url}`,
        });

        const viewports: ScanViewportId[] =
          params.viewportMode === "compare"
            ? ["desktop", "mobile"]
            : params.viewportMode === "mobile"
              ? ["mobile"]
              : ["desktop"];

        for (const vp of viewports) {
          if (ac.signal.aborted || stoppingRef.current) break;
          if (params.viewportMode === "compare") {
            dispatch({
              type: "SET_STAGE",
              stageLabel: "Running automated accessibility checks",
              liveMessage: `Page ${i + 1} of ${selected.length} — ${vp} viewport`,
            });
          }
          const outcome = await scanOnePage(url, {
            viewportId: vp,
            rootOrigin,
            includeBestPractices: params.includeBestPractices,
            signal: ac.signal,
            siteBatch: {
              batchId,
              pageIndex: i,
              pageTotal: selected.length,
              viewportMode: params.viewportMode,
              batchTicket,
            },
          });
          if (ac.signal.aborted || stoppingRef.current) break;
          if (!outcome.ok) {
            if (outcome.code === "ROBOTS_BLOCKED") {
              dispatch({
                type: "PAGE_SKIPPED",
                url,
                reason: "Skipped — robots.txt",
              });
            } else {
              dispatch({
                type: "PAGE_FAILED",
                url,
                errorMessage: outcome.error,
              });
            }
            break;
          }
          if (!rootOrigin) {
            rootOrigin = new URL(outcome.result.finalUrl).origin;
            dispatch({ type: "SET_FINAL_ORIGIN", origin: rootOrigin });
          }
          const finalKey = safeCrawlKey(outcome.result.finalUrl);
          if (finalUrlsSeen.has(finalKey) && vp === viewports[0]) {
            dispatch({
              type: "PAGE_SKIPPED",
              url,
              reason: "Duplicate final destination",
            });
            break;
          }
          finalUrlsSeen.add(finalKey);

          if (params.viewportMode === "compare") {
            dispatch({
              type: "PAGE_VIEWPORT_COMPLETE",
              url,
              viewport: vp,
              result: outcome.result,
            });
          } else {
            dispatch({
              type: "PAGE_COMPLETE",
              url,
              result: outcome.result,
              newLinks: [],
            });
          }
          if (i < selected.length - 1 || vp !== viewports[viewports.length - 1]) {
            await sleep(SITE_CRAWL_DELAY_MS);
          }
        }
      }
      dispatch({ type: "FINISH_SCAN" });
    },
    [dispatch],
  );

  const runCurrentPageScan = useCallback(
    async (params: {
      rootUrl: string;
      viewportMode: ViewportScanMode;
      includeBestPractices: boolean;
    }) => {
      const batchId = crypto.randomUUID();
      const urls = [params.rootUrl.trim()];
      await registerBatch(batchId, params.rootUrl, urls, params.viewportMode);
      await runBatchScan({
        rootUrl: params.rootUrl,
        selectedUrls: urls,
        viewportMode: params.viewportMode,
        includeBestPractices: params.includeBestPractices,
        batchId,
      });
    },
    [runBatchScan],
  );

  return { runBatchScan, runCurrentPageScan, stopScan };
}

async function registerBatch(
  batchId: string,
  originUrl: string,
  urls: string[],
  viewportMode: ViewportScanMode,
): Promise<string> {
  const res = await fetch("/api/accessibility/website/register-batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ batchId, originUrl, urls, viewportMode }),
  });
  const body = (await res.json()) as { error?: string; batchTicket?: string };
  if (!res.ok) {
    throw new Error(body.error ?? "Could not register scan batch.");
  }
  if (!body.batchTicket?.trim()) {
    throw new Error("Could not register scan batch.");
  }
  return body.batchTicket.trim();
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
