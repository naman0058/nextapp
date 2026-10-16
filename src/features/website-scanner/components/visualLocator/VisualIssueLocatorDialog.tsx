"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  SCAN_VIEWPORTS,
  type ScanViewportId,
} from "@/features/website-scanner/constants/viewports";
import type { VisualIssueEvidence } from "@/features/website-scanner/types/visualLocator";
import type { LocatorOccurrence } from "@/features/website-scanner/utils/visualLocator/collectLocatorOccurrences";
import { CopySelectorButton } from "@/features/website-scanner/components/CopySelectorButton";
import { CopyDeveloperTicketButton } from "@/features/website-scanner/components/developerTicket/CopyDeveloperTicketButton";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

type Props = {
  open: boolean;
  title: string;
  evidence: VisualIssueEvidence | null;
  occurrences: LocatorOccurrence[];
  activeIndex: number;
  totalOccurrences: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSwitchViewport: (viewportId: ScanViewportId) => void;
  onOpenFixLab?: () => void;
  completedPages?: WebsitePageScanResult[];
};

export function VisualIssueLocatorDialog({
  open,
  title,
  evidence,
  occurrences,
  activeIndex,
  totalOccurrences,
  onClose,
  onPrev,
  onNext,
  onSwitchViewport,
  onOpenFixLab,
  completedPages = [],
}: Props) {
  const { state } = useWebsiteScanSession();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setZoom(1);
        onClose();
      }
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onNext, onPrev]);

  if (!open) return null;

  const vp = evidence?.viewportId
    ? SCAN_VIEWPORTS[evidence.viewportId]
    : null;
  const viewportIdsPresent = new Set(occurrences.map((o) => o.viewportId));
  const hasDesktop = viewportIdsPresent.has("desktop");
  const hasMobile = viewportIdsPresent.has("mobile");
  const showViewportToggle = hasDesktop && hasMobile;
  const ruleId = evidence?.ruleId;
  const rootGroup = ruleId
    ? state.siteIntelligence?.rootCauseGroups.find((g) => g.ruleId === ruleId)
    : undefined;
  const fixPlanItem = rootGroup
    ? state.siteIntelligence?.fixPlan.find(
        (p) => p.rootCauseGroupId === rootGroup.id,
      )
    : undefined;
  const alt = evidence?.pageUrl
    ? `Screenshot of ${evidence.pageUrl} with affected element highlighted as issue ${activeIndex + 1}.`
    : "Visual issue locator screenshot";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setZoom(1);
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-xl"
      >
        <header className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 id={titleId} className="font-display text-lg font-bold">
              Visual Issue Locator
            </h2>
            <p className="text-sm font-semibold">{title}</p>
            {evidence && (
              <p className="mt-1 text-xs text-muted">
                Page: {evidence.pageUrl}
                {vp ? ` · ${vp.label}` : ""}
                · Occurrence {activeIndex + 1} of {totalOccurrences}
              </p>
            )}
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-sm"
            onClick={() => {
              setZoom(1);
              onClose();
            }}
          >
            Close
          </button>
        </header>

        <p className="mt-2 text-xs text-muted">
          Visual location is generated from the latest public page render and may
          differ if the site changed since your scan.
        </p>

        {showViewportToggle ? (
          <div
            className="mt-3 flex flex-wrap gap-2"
            role="group"
            aria-label="Viewport"
          >
            {(["desktop", "mobile"] as const).map((id) => (
              <button
                key={id}
                type="button"
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  evidence?.viewportId === id
                    ? "border-primary bg-primary/10"
                    : "border-border"
                }`}
                onClick={() => onSwitchViewport(id)}
              >
                {SCAN_VIEWPORTS[id].label}
              </button>
            ))}
          </div>
        ) : hasDesktop && !hasMobile ? (
          <p className="mt-2 text-xs text-muted">
            Mobile evidence not available for this issue in the current scan.
          </p>
        ) : null}

        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-muted-bg">
          {evidence?.status === "loading" && (
            <p className="p-8 text-center text-sm">Preparing visual location…</p>
          )}
          {evidence?.status === "available" && evidence.imageObjectUrl && (
            <div className="overflow-auto p-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- ephemeral blob URL from locator API */}
              <img
                src={evidence.imageObjectUrl}
                alt={alt}
                className="mx-auto max-w-full origin-top transition-transform"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>
          )}
          {evidence &&
            evidence.status !== "loading" &&
            evidence.status !== "available" && (
              <p className="p-6 text-sm" role="alert">
                {evidence.limitation ??
                  "Could not visually locate this element."}
              </p>
            )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-sm"
            disabled={activeIndex <= 0}
            onClick={onPrev}
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-sm"
            disabled={activeIndex >= totalOccurrences - 1}
            onClick={onNext}
          >
            Next
          </button>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-sm"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
          >
            Zoom in
          </button>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-sm"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
          >
            Zoom out
          </button>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-sm"
            onClick={() => setZoom(1)}
          >
            Reset zoom
          </button>
          {evidence?.pageUrl && (
            <a
              href={evidence.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium"
            >
              Open page
            </a>
          )}
          {onOpenFixLab && (
            <button
              type="button"
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
              onClick={onOpenFixLab}
            >
              Open Fix Lab
            </button>
          )}
          {ruleId && rootGroup && (
            <CopyDeveloperTicketButton
              ruleId={ruleId}
              axeHelp={title}
              completedPages={completedPages}
              group={rootGroup}
              fixPlanItem={fixPlanItem}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium"
            />
          )}
        </div>

        {evidence && (
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <strong>Highlighted element #{activeIndex + 1}</strong>
            </p>
            <p className="text-muted">Rule: {evidence.ruleId}</p>
            {evidence.selectorLabel && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted">Selector:</span>
                <code className="break-all text-xs">{evidence.selectorLabel}</code>
                <CopySelectorButton selector={evidence.selectorLabel} />
              </div>
            )}
            {evidence.htmlSnippet && (
              <pre className="overflow-x-auto rounded border border-border p-2 text-xs">
                <code>{evidence.htmlSnippet}</code>
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
