"use client";

import { useMemo, useState } from "react";
import {
  MAX_DUAL_VIEWPORT_PAGES,
  MAX_SITE_SCAN_PAGES,
} from "@/features/website-scanner/constants/scanLimits";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import { useWebsiteScanRunner } from "@/features/website-scanner/hooks/useWebsiteScanRunner";
import type { DiscoveredUrl } from "@/features/website-scanner/types/websiteDiscovery";
import type { ViewportScanMode } from "@/features/website-scanner/types/websiteDiscovery";
import { buildUrlPatternGroups } from "@/features/website-scanner/utils/urlPatterns/buildUrlPatternGroups";
import { suggestRepresentativeUrls } from "@/features/website-scanner/utils/urlPatterns/suggestRepresentativeUrls";
import { safeCrawlKey } from "@/features/website-scanner/utils/crawl/safeCrawlKey";
import { PreScanSummary } from "@/features/website-scanner/components/setup/PreScanSummary";

type Props = {
  urlInput: string;
  authConfirm: boolean;
  includeBestPractices: boolean;
  onIncludeBestPractices: (v: boolean) => void;
};

export function WebsiteScanSetupPanel({
  urlInput,
  authConfirm,
  includeBestPractices,
  onIncludeBestPractices,
}: Props) {
  const { state, dispatch } = useWebsiteScanSession();
  const { runBatchScan, runCurrentPageScan, stopScan } =
    useWebsiteScanRunner(dispatch);
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [pathSearch, setPathSearch] = useState("");
  const [manualSitemapUrl, setManualSitemapUrl] = useState("");

  const scanning =
    state.status === "scanning" ||
    state.status === "validating" ||
    state.status === "stopping";

  const visibleUrls = useMemo(() => {
    const q = pathSearch.trim().toLowerCase();
    return state.discoveredUrls.filter((d) => {
      if (!q) return true;
      try {
        return new URL(d.url).pathname.toLowerCase().includes(q);
      } catch {
        return d.url.toLowerCase().includes(q);
      }
    });
  }, [state.discoveredUrls, pathSearch]);

  async function discoverCrawl() {
    setDiscoverError(null);
    setDiscovering(true);
    dispatch({ type: "SET_SETUP_PHASE", phase: "discovering" });
    try {
      const res = await fetch("/api/accessibility/website/discover-crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl: urlInput.trim() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Discovery failed.");
      const urls: DiscoveredUrl[] = body.urls.map(
        (u: { url: string; depth: number }) => ({
          url: u.url,
          normalizedKey: safeCrawlKey(u.url),
          source: "crawler" as const,
          depth: u.depth,
        }),
      );
      dispatch({
        type: "SET_DISCOVERY_RESULTS",
        urls,
        externalIgnored: 0,
        discoverySource: "crawl",
      });
      dispatch({ type: "SET_SCAN_SOURCE", source: "discover_site" });
      const groups = buildUrlPatternGroups(urls);
      dispatch({ type: "SET_URL_PATTERN_GROUPS", groups });
    } catch (e) {
      setDiscoverError(e instanceof Error ? e.message : "Discovery failed.");
    } finally {
      setDiscovering(false);
    }
  }

  async function discoverSitemap(manual: boolean) {
    setDiscoverError(null);
    setDiscovering(true);
    dispatch({ type: "SET_SETUP_PHASE", phase: "discovering" });
    try {
      const res = await fetch("/api/accessibility/website/discover-sitemap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteUrl: urlInput.trim(),
          sitemapUrl: manual ? manualSitemapUrl.trim() : undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Sitemap discovery failed.");
      const urls: DiscoveredUrl[] = body.urls.map(
        (u: { url: string; lastModified?: string | null }) => ({
          url: u.url,
          normalizedKey: safeCrawlKey(u.url),
          source: "sitemap" as const,
          lastModified: u.lastModified ?? null,
        }),
      );
      dispatch({
        type: "SET_DISCOVERY_RESULTS",
        urls,
        externalIgnored: body.externalUrlsIgnored ?? 0,
        discoverySource: "sitemap",
      });
      dispatch({ type: "SET_SCAN_SOURCE", source: "sitemap" });
      const groups = buildUrlPatternGroups(urls);
      dispatch({ type: "SET_URL_PATTERN_GROUPS", groups });
    } catch (e) {
      setDiscoverError(e instanceof Error ? e.message : "Sitemap failed.");
    } finally {
      setDiscovering(false);
    }
  }

  function selectSuggested() {
    const suggested = suggestRepresentativeUrls(
      state.discoveredUrls,
      state.urlPatternGroups,
    );
    dispatch({
      type: "SET_SELECTED_URL_KEYS",
      keys: suggested.map((u) => safeCrawlKey(u)),
    });
    dispatch({
      type: "SET_SUGGESTED_URL_KEYS",
      keys: suggested.map((u) => safeCrawlKey(u)),
    });
  }

  function selectVisible() {
    const keys = visibleUrls.map((d) => d.normalizedKey);
    const merged = new Set(state.selectedUrlKeys);
    for (const k of keys) {
      if (merged.size >= MAX_SITE_SCAN_PAGES) break;
      merged.add(k);
    }
    dispatch({ type: "SET_SELECTED_URL_KEYS", keys: [...merged] });
  }

  async function startScan() {
    if (!authConfirm) return;
    dispatch({ type: "MARK_AI_STALE" });
    const mode = state.viewportMode;
    if (state.scanSource === "current_page") {
      await runCurrentPageScan({
        rootUrl: urlInput.trim(),
        viewportMode: mode,
        includeBestPractices,
      });
      return;
    }
    const selected = state.selectedUrlKeys
      .map((k) => state.discoveredUrls.find((d) => d.normalizedKey === k)?.url)
      .filter(Boolean) as string[];
    if (selected.length === 0) return;
    if (mode === "compare" && selected.length > MAX_DUAL_VIEWPORT_PAGES) return;
    await runBatchScan({
      rootUrl: urlInput.trim(),
      selectedUrls: selected,
      viewportMode: mode,
      includeBestPractices,
    });
  }

  return (
    <div className="mt-6 space-y-6 border-t border-border pt-6">
      <fieldset>
        <legend className="text-sm font-semibold">Scan source</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              ["current_page", "Current page"],
              ["discover_site", "Discover site pages"],
              ["sitemap", "Use sitemap"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={state.scanSource === id}
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                state.scanSource === id
                  ? "border-primary bg-primary/10 font-semibold"
                  : "border-border"
              }`}
              disabled={scanning || discovering}
              onClick={() => dispatch({ type: "SET_SCAN_SOURCE", source: id })}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Viewport</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              ["desktop", "Desktop"],
              ["mobile", "Mobile viewport"],
              ["compare", "Compare Desktop + Mobile"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={state.viewportMode === id}
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                state.viewportMode === id
                  ? "border-primary bg-primary/10 font-semibold"
                  : "border-border"
              }`}
              disabled={scanning}
              onClick={() =>
                dispatch({ type: "SET_VIEWPORT_MODE", mode: id as ViewportScanMode })
              }
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          Mobile viewport scan uses Chromium emulation — not physical-device
          VoiceOver or TalkBack testing.
        </p>
        {state.viewportMode === "compare" &&
          state.selectedUrlKeys.length > MAX_DUAL_VIEWPORT_PAGES && (
          <p className="mt-2 text-sm text-amber-800" role="alert">
            Desktop + Mobile comparison supports up to {MAX_DUAL_VIEWPORT_PAGES}{" "}
            selected pages. Reduce the selection or scan one viewport.
          </p>
        )}
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={includeBestPractices}
          onChange={(e) => onIncludeBestPractices(e.target.checked)}
          disabled={scanning}
        />
        Include best-practice findings
      </label>

      {state.scanSource === "discover_site" && (
        <button
          type="button"
          disabled={discovering || !urlInput.trim()}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
          onClick={() => void discoverCrawl()}
        >
          {discovering ? "Discovering…" : "Discover pages"}
        </button>
      )}

      {state.scanSource === "sitemap" && (
        <div className="space-y-2">
          <p className="text-sm text-muted">
            A sitemap is a list of page URLs publishers share with search engines.
            We use it only to suggest pages—you still choose up to 25 before scanning.
          </p>
          <label className="block text-sm">
            Sitemap URL (optional)
            <input
              className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-sm"
              value={manualSitemapUrl}
              onChange={(e) => setManualSitemapUrl(e.target.value)}
              placeholder="Leave blank to auto-detect"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={discovering}
              className="rounded-lg border border-border px-3 py-1.5 text-sm"
              onClick={() => void discoverSitemap(false)}
            >
              Auto-detect sitemap
            </button>
            <button
              type="button"
              disabled={discovering || !manualSitemapUrl.trim()}
              className="rounded-lg border border-border px-3 py-1.5 text-sm"
              onClick={() => void discoverSitemap(true)}
            >
              Use sitemap URL
            </button>
          </div>
        </div>
      )}

      {discoverError && (
        <p className="text-sm text-red-700" role="alert">
          {discoverError}
        </p>
      )}

      {state.discoveredUrls.length > 0 && state.scanSource !== "current_page" && (
        <section className="space-y-3">
          <h3 className="font-semibold">Page selection</h3>
          <p className="text-sm text-muted" role="status">
            {state.selectedUrlKeys.length} of {MAX_SITE_SCAN_PAGES} selected ·{" "}
            {state.discoveredUrls.length} URLs discovered
            {state.externalUrlsIgnoredCount > 0 &&
              ` · ${state.externalUrlsIgnoredCount} external URLs ignored`}
          </p>
          <p className="text-xs text-muted">
            Suggested pages are based on URL structure to improve template variety.
            They do not guarantee coverage of every page type.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded border px-2 py-1 text-xs" onClick={selectVisible}>
              Select visible
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1 text-xs"
              onClick={() =>
                dispatch({
                  type: "SET_SELECTED_URL_KEYS",
                  keys: visibleUrls
                    .map((d) => d.normalizedKey)
                    .filter((k) => state.selectedUrlKeys.includes(k)),
                })
              }
            >
              Clear visible
            </button>
            <button type="button" className="rounded border px-2 py-1 text-xs" onClick={selectSuggested}>
              Select suggested
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1 text-xs"
              onClick={() => dispatch({ type: "CLEAR_URL_SELECTION" })}
            >
              Clear all
            </button>
          </div>
          <label className="block text-sm">
            Search paths
            <input
              className="mt-1 w-full max-w-md rounded border border-border px-2 py-1"
              value={pathSearch}
              onChange={(e) => setPathSearch(e.target.value)}
            />
          </label>
          <ul className="max-h-64 space-y-2 overflow-y-auto rounded border border-border p-2 text-sm">
            {visibleUrls.map((d) => (
              <li key={d.normalizedKey}>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={state.selectedUrlKeys.includes(d.normalizedKey)}
                    onChange={() =>
                      dispatch({
                        type: "TOGGLE_URL_SELECTION",
                        normalizedKey: d.normalizedKey,
                        url: d.url,
                      })
                    }
                  />
                  <span>
                    <span className="break-all">{d.url}</span>
                    <span className="ml-2 text-xs text-muted">({d.source})</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <PreScanSummary />
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={
            scanning ||
            !authConfirm ||
            discovering ||
            (state.scanSource !== "current_page" &&
              state.selectedUrlKeys.length === 0) ||
            (state.viewportMode === "compare" &&
              state.scanSource !== "current_page" &&
              state.selectedUrlKeys.length > MAX_DUAL_VIEWPORT_PAGES)
          }
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          onClick={() => void startScan()}
        >
          Run accessibility scan
        </button>
        {scanning && (
          <button
            type="button"
            className="rounded-lg border border-border px-4 py-2 text-sm"
            onClick={stopScan}
          >
            Stop scan
          </button>
        )}
      </div>
    </div>
  );
}
