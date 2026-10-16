"use client";

import { useCallback, useRef, useState } from "react";
import type { VisualIssueEvidence } from "@/features/website-scanner/types/visualLocator";
import type { LocatorOccurrence } from "@/features/website-scanner/utils/visualLocator/collectLocatorOccurrences";

function cacheKey(occ: LocatorOccurrence): string {
  return `${occ.issueFingerprint}:${occ.viewportId}:${occ.occurrenceIndex}`;
}

export function useVisualIssueLocator() {
  const [open, setOpen] = useState(false);
  const [occurrences, setOccurrences] = useState<LocatorOccurrence[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [evidence, setEvidence] = useState<VisualIssueEvidence | null>(null);
  const [title, setTitle] = useState("");
  const inFlight = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, Blob>>(new Map());
  const triggerRef = useRef<HTMLElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const revokeUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const close = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    revokeUrl();
    setOpen(false);
    setEvidence(null);
    triggerRef.current?.focus();
  }, [revokeUrl]);

  const loadOccurrence = useCallback(
    async (occ: LocatorOccurrence, all: LocatorOccurrence[]) => {
      if (inFlight.current) return;
      inFlight.current = true;
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      const key = cacheKey(occ);
      const cached = cacheRef.current.get(key);

      setEvidence({
        status: "loading",
        occurrenceIndex: occ.occurrenceIndex,
        occurrenceTotal: all.length,
        viewportId: occ.viewportId,
        pageUrl: occ.pageUrl,
        ruleId: occ.ruleId,
        selectorLabel: occ.selectorLabel,
        htmlSnippet: occ.htmlSnippet,
      });

      try {
        let blob = cached;
        let match: "exact" | "strong" = "exact";

        if (!blob) {
          const tokenRes = await fetch("/api/accessibility/website/visual-locator-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: occ.pageUrl,
              viewportId: occ.viewportId,
              ruleId: occ.ruleId,
              issueFingerprint: occ.issueFingerprint,
              target: occ.target,
              selectorLabel: occ.selectorLabel,
              domSignature: occ.domSignature,
              occurrenceIndex: occ.occurrenceIndex,
              occurrenceTotal: all.length,
              ruleTitle: occ.ruleTitle,
            }),
            signal: ac.signal,
          });
          if (!tokenRes.ok) {
            const j = (await tokenRes.json()) as { error?: string };
            throw new Error(j.error ?? "Could not authorize visual location.");
          }
          const { token } = (await tokenRes.json()) as { token: string };

          const imgRes = await fetch("/api/accessibility/website/visualize-issue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
            signal: ac.signal,
          });
          if (!imgRes.ok) {
            const j = (await imgRes.json()) as { error?: string; code?: string };
            const msg = j.error ?? "Visual location failed.";
            const status =
              j.code === "ELEMENT_NOT_FOUND"
                ? "element_not_found"
                : j.code === "ELEMENT_NOT_VISIBLE"
                  ? "element_not_visible"
                  : j.code === "UNSUPPORTED_TARGET"
                    ? "unsupported_target"
                    : "error";
            setEvidence({
              status,
              occurrenceIndex: occ.occurrenceIndex,
              occurrenceTotal: all.length,
              viewportId: occ.viewportId,
              limitation: msg,
              pageUrl: occ.pageUrl,
              ruleId: occ.ruleId,
              selectorLabel: occ.selectorLabel,
              htmlSnippet: occ.htmlSnippet,
            });
            return;
          }
          const matchHeader = imgRes.headers.get("X-Locator-Match");
          match = matchHeader === "strong" ? "strong" : "exact";
          blob = await imgRes.blob();
          cacheRef.current.set(key, blob);
        }

        revokeUrl();
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;

        setEvidence({
          status: "available",
          occurrenceIndex: occ.occurrenceIndex,
          occurrenceTotal: all.length,
          viewportId: occ.viewportId,
          generatedAt: new Date().toISOString(),
          locatorMatch: match,
          imageObjectUrl: objectUrl,
          pageUrl: occ.pageUrl,
          ruleId: occ.ruleId,
          selectorLabel: occ.selectorLabel,
          htmlSnippet: occ.htmlSnippet,
        });
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        const message =
          e instanceof Error ? e.message : "Visual location failed.";
        setEvidence({
          status: "error",
          occurrenceIndex: occ.occurrenceIndex,
          occurrenceTotal: all.length,
          viewportId: occ.viewportId,
          limitation: message,
          pageUrl: occ.pageUrl,
          ruleId: occ.ruleId,
          selectorLabel: occ.selectorLabel,
          htmlSnippet: occ.htmlSnippet,
        });
      } finally {
        inFlight.current = false;
      }
    },
    [revokeUrl],
  );

  const openLocator = useCallback(
    (
      list: LocatorOccurrence[],
      startIndex: number,
      dialogTitle: string,
      triggerEl: HTMLElement | null,
    ) => {
      if (!list.length) return;
      triggerRef.current = triggerEl;
      setTitle(dialogTitle);
      setOccurrences(list);
      setActiveIndex(startIndex);
      setOpen(true);
      void loadOccurrence(list[startIndex] ?? list[0], list);
    },
    [loadOccurrence],
  );

  const goPrev = useCallback(() => {
    if (activeIndex <= 0 || !occurrences.length) return;
    const next = activeIndex - 1;
    setActiveIndex(next);
    void loadOccurrence(occurrences[next], occurrences);
  }, [activeIndex, loadOccurrence, occurrences]);

  const goNext = useCallback(() => {
    if (activeIndex >= occurrences.length - 1) return;
    const next = activeIndex + 1;
    setActiveIndex(next);
    void loadOccurrence(occurrences[next], occurrences);
  }, [activeIndex, loadOccurrence, occurrences]);

  const invalidateCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const switchViewport = useCallback(
    (viewportId: "desktop" | "mobile") => {
      const idx = occurrences.findIndex((o) => o.viewportId === viewportId);
      if (idx < 0) return;
      setActiveIndex(idx);
      void loadOccurrence(occurrences[idx], occurrences);
    },
    [loadOccurrence, occurrences],
  );

  return {
    open,
    close,
    openLocator,
    goPrev,
    goNext,
    switchViewport,
    evidence,
    occurrences,
    activeIndex,
    title,
    invalidateCache,
  };
}
