"use client";

import { useState } from "react";
import type { RootCauseGroup } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { NormalizedAccessibilityFinding } from "@/features/accessibility-intelligence/types/normalizedFinding";
import {
  getRuleKnowledge,
  getUserImpactForRule,
} from "@/features/accessibility-intelligence/knowledge/ruleKnowledge";
import type { ExplanationLevel } from "@/features/website-scanner/types/resultUx";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { CopySelectorButton } from "@/features/website-scanner/components/CopySelectorButton";
import { ImpactBadge } from "@/features/website-scanner/components/results/ImpactBadge";
import { PriorityBadge } from "@/features/website-scanner/components/results/PriorityBadge";
import { FixLabPanel } from "@/features/website-scanner/components/results/FixLabPanel";
import { ViewOnPageButton } from "@/features/website-scanner/components/visualLocator/ViewOnPageButton";

const MAX_VISIBLE = 3;

type Props = {
  title: string;
  ruleId: string;
  findings: NormalizedAccessibilityFinding[];
  level: ExplanationLevel;
  completedPages: WebsitePageScanResult[];
  rootCauseGroup?: RootCauseGroup;
  wcagRow?: {
    criterion: string;
    level: string;
    principle: string;
    automation: string;
  };
  sampleMode?: boolean;
};

export function IssueCard({
  title,
  ruleId,
  findings,
  level,
  completedPages,
  rootCauseGroup,
  wcagRow,
  sampleMode,
}: Props) {
  const [showLab, setShowLab] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const knowledge = getRuleKnowledge(ruleId);
  const sample = findings[0];
  const evidence = rootCauseGroup?.representativeEvidence ?? sample?.evidence ?? [];
  const visible = showMore ? evidence : evidence.slice(0, MAX_VISIBLE);
  const totalOcc =
    rootCauseGroup?.totalOccurrences ??
    findings.reduce((n, f) => n + (f.occurrenceCount ?? 1), 0);
  const axeHelp = sample?.title ?? title;

  return (
    <li className="rounded-lg border border-border p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        {sample && <PriorityBadge priority={sample.priority} />}
        <ImpactBadge impact={sample?.impact ?? "unknown"} />
        {sample?.bestPractice && (
          <span className="rounded bg-muted px-2 py-0.5 text-xs">Best practice</span>
        )}
        <h4 className="font-semibold">
          {knowledge?.plainTitle ?? title}
        </h4>
      </div>
      {level !== "simple" && (
        <p className="mt-1 text-muted">Rule: {ruleId}</p>
      )}
      {level === "simple" && (
        <>
          <p className="mt-2">
            <strong>Problem:</strong>{" "}
            {knowledge?.deterministicFixTemplate?.whatIsWrong ?? sample?.description}
          </p>
          <p>
            <strong>Why:</strong>{" "}
            {getUserImpactForRule(ruleId, axeHelp)}
          </p>
          <p>
            <strong>Where:</strong>{" "}
            {findings.map((f) => f.pageUrl).filter(Boolean).slice(0, 3).join(", ") ||
              rootCauseGroup?.affectedPages.slice(0, 3).join(", ")}
          </p>
          <p>
            <strong>Fix:</strong>{" "}
            {knowledge?.deterministicFixTemplate?.genericPattern?.split("\n")[0] ??
              sample?.recommendation ??
              "See Fix Lab"}
          </p>
          <p>
            <strong>Verify:</strong> Re-scan after fixing; use checklist in Fix Lab.
          </p>
        </>
      )}
      {level === "developer" && (
        <>
          <p className="mt-2 text-muted">{sample?.description}</p>
          {visible.map((e, idx) => (
            <details key={idx} className="mt-2 rounded border border-border p-2">
              <summary className="cursor-pointer font-medium">
                Element {idx + 1}
              </summary>
              {e.selector && <CopySelectorButton selector={e.selector} />}
              {e.htmlSnippet && (
                <pre className="mt-2 overflow-x-auto text-xs">
                  <code>{e.htmlSnippet}</code>
                </pre>
              )}
            </details>
          ))}
        </>
      )}
      {level === "standard" && wcagRow && (
        <p className="mt-2 text-muted">
          WCAG {wcagRow.criterion} ({wcagRow.level}) · {wcagRow.principle} ·
          automation: {wcagRow.automation}
        </p>
      )}
      <p className="mt-2 text-muted">
        {totalOcc} element(s) affected
        {evidence.length < totalOcc &&
          ` · showing ${visible.length} example(s)`}
      </p>
      {evidence.length > MAX_VISIBLE && !showMore && (
        <button
          type="button"
          className="mt-1 text-xs font-medium text-primary underline"
          onClick={() => setShowMore(true)}
        >
          View more examples
        </button>
      )}
      {!sampleMode && findings[0]?.pageUrl && (
        <p className="mt-2">
          <a
            href={findings[0].pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline"
          >
            Open page
          </a>
        </p>
      )}
      {!sampleMode && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded border border-primary bg-primary/10 px-2 py-1 text-xs font-semibold"
            aria-expanded={showLab}
            onClick={() => setShowLab((v) => !v)}
          >
            {showLab ? "Hide Fix Lab" : "View Fix"}
          </button>
          <ViewOnPageButton
            ruleId={ruleId}
            ruleTitle={knowledge?.plainTitle ?? title}
            completedPages={completedPages}
          />
        </div>
      )}
      {!sampleMode && showLab && (
        <FixLabPanel
          ruleId={ruleId}
          axeHelp={axeHelp}
          group={rootCauseGroup}
          completedPages={completedPages}
        />
      )}
    </li>
  );
}
