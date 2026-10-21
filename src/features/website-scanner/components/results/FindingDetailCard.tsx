"use client";

import { useMemo, useState } from "react";
import type { RootCauseGroup } from "@/features/accessibility-intelligence/types/siteIntelligence";
import { getUserImpactForRule } from "@/features/accessibility-intelligence/knowledge/ruleKnowledge";
import type { ExplanationLevel } from "@/features/website-scanner/types/resultUx";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { FindingDetail } from "@/features/website-scanner/findingDetail/types";
import { CopySelectorButton } from "@/features/website-scanner/components/CopySelectorButton";
import { ImpactBadge } from "@/features/website-scanner/components/results/ImpactBadge";
import { PriorityBadge } from "@/features/website-scanner/components/results/PriorityBadge";
import { FixLabPanel } from "@/features/website-scanner/components/results/FixLabPanel";
import { ViewOnPageButton } from "@/features/website-scanner/components/visualLocator/ViewOnPageButton";
import { CopyDeveloperTicketButton } from "@/features/website-scanner/components/developerTicket/CopyDeveloperTicketButton";
import { sanitizeTicketHtmlSnippet } from "@/features/website-scanner/developerTicket/sanitizeDeveloperTicketContent";
import {
  formatAffectedOccurrencesSummary,
  formatDetailedEvidenceExamples,
  formatRepresentativeSelectorsShown,
  viewOccurrencesButtonLabel,
} from "@/features/website-scanner/utils/occurrenceCounts";
import { OpenSpecializedToolButton } from "@/features/accessibility-workspace/components/OpenSpecializedToolButton";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import { HUMAN_REVIEW_REGISTRY_V1 } from "@/features/human-review-workspace/registry/v1";

const MAX_VISIBLE = 3;

function sourceBadgeLabel(source: FindingDetail["source"]): string {
  switch (source) {
    case "AXE_BEST_PRACTICE":
      return "Best practice";
    case "DETERMINISTIC":
      return "Deterministic";
    case "MANUAL":
      return "Manual";
    case "AXE_WCAG":
    default:
      return "Automated";
  }
}

type Props = {
  detail: FindingDetail;
  level: ExplanationLevel;
  completedPages: WebsitePageScanResult[];
  rootCauseGroup?: RootCauseGroup;
  sampleMode?: boolean;
  defaultExpanded?: boolean;
};

export function FindingDetailCard({
  detail,
  level,
  completedPages,
  rootCauseGroup,
  sampleMode,
  defaultExpanded = false,
}: Props) {
  const { dispatch } = useWebsiteScanSession();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showLab, setShowLab] = useState(false);
  const [showMoreEvidence, setShowMoreEvidence] = useState(false);

  const primaryWcag = detail.wcagMappings[0];
  const visibleEvidence = showMoreEvidence
    ? detail.evidenceItems
    : detail.evidenceItems.slice(0, MAX_VISIBLE);
  const visibleSelectors = showMoreEvidence
    ? detail.representativeSelectors
    : detail.representativeSelectors.slice(0, MAX_VISIBLE);

  const displayedSelectorCount = Math.min(
    MAX_VISIBLE,
    detail.representativeSelectors.length || visibleEvidence.length,
  );

  const scopeByPage = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const s of detail.pageViewportScopes) {
      const vpMap = map.get(s.pageUrl) ?? new Map<string, number>();
      vpMap.set(s.viewportId, (vpMap.get(s.viewportId) ?? 0) + s.occurrenceCount);
      map.set(s.pageUrl, vpMap);
    }
    return map;
  }, [detail.pageViewportScopes]);

  const isConfirmationOnly = detail.kind === "incomplete_only";

  return (
    <li id={`finding-${detail.findingId}`} className="rounded-lg border border-border text-sm">
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={detail.priority} />
          <ImpactBadge impact={detail.impact} />
          <span className="rounded bg-muted px-2 py-0.5 text-xs">
            {sourceBadgeLabel(detail.source)}
          </span>
          {detail.isBestPractice && (
            <span className="rounded bg-muted px-2 py-0.5 text-xs">Best practice</span>
          )}
          {isConfirmationOnly && (
            <span className="rounded bg-amber-500/15 px-2 py-0.5 text-xs font-medium">
              Needs manual confirmation
            </span>
          )}
          <h4 className="min-w-[12rem] flex-1 font-semibold">{detail.title}</h4>
        </div>
        <p className="mt-1 font-mono text-xs text-muted">{detail.ruleId}</p>
        <p className="mt-1 text-xs text-muted">
          {sourceBadgeLabel(detail.source)} · {detail.impact} · {detail.priority} priority
        </p>
        {primaryWcag ? (
          <p className="mt-1 text-xs text-muted">
            WCAG {primaryWcag.criterion}
            {primaryWcag.level ? ` · Level ${primaryWcag.level}` : ""}
            {detail.wcagMappings.length > 1 &&
              ` (+${detail.wcagMappings.length - 1} more)`}
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted">WCAG mapping unavailable</p>
        )}
        <p className="mt-1 text-xs">{detail.category}</p>
        <p className="mt-2 text-muted">
          {formatAffectedOccurrencesSummary(
            detail.totalOccurrences,
            detail.pagesAffected || 1,
          )}
        </p>
        {detail.retainedEvidenceCount < detail.totalOccurrences && (
          <p className="text-xs text-muted">
            {formatDetailedEvidenceExamples(detail.retainedEvidenceCount)}
          </p>
        )}
        {displayedSelectorCount > 0 && (
          <p className="text-xs text-muted">
            {formatRepresentativeSelectorsShown(displayedSelectorCount)}
          </p>
        )}
        <p className="text-xs text-muted">
          {detail.affectedViewports.map((v) => (v === "desktop" ? "Desktop" : "Mobile")).join(" · ") ||
            "Desktop"}
        </p>

        {detail.relatedIncomplete.length > 0 && detail.kind === "automated_failure" && (
          <div className="mt-3 rounded border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
            <p className="font-semibold">Manual confirmation also needed</p>
            <p className="mt-1 text-muted">
              Some additional elements could not be conclusively evaluated by axe.
            </p>
            <button
              type="button"
              className="mt-2 font-medium text-primary underline"
              onClick={() => setExpanded(true)}
            >
              View confirmation evidence
            </button>
          </div>
        )}

        {!sampleMode && (
          <div className="mt-3 flex flex-wrap gap-2">
            {!isConfirmationOnly && (
              <button
                type="button"
                className="rounded border border-primary bg-primary/10 px-2 py-1 text-xs font-semibold"
                aria-expanded={showLab}
                onClick={() => setShowLab((v) => !v)}
              >
                {showLab ? "Hide Fix Lab" : "View Fix"}
              </button>
            )}
            <button
              type="button"
              className="rounded border border-border px-2 py-1 text-xs font-medium"
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Hide evidence" : "View evidence"}
            </button>
            {detail.visualLocatorAvailable && (
              <ViewOnPageButton
                ruleId={detail.ruleId}
                ruleTitle={detail.title}
                completedPages={completedPages}
              />
            )}
            {detail.developerTicketAvailable && (
              <CopyDeveloperTicketButton
                ruleId={detail.ruleId}
                axeHelp={detail.title}
                completedPages={completedPages}
                group={rootCauseGroup}
                finding={detail.normalizedFindings[0]}
                findingDetail={detail}
              />
            )}
            {detail.specializedTool && (
              <OpenSpecializedToolButton
                detail={detail}
                href={detail.specializedTool.href}
                label={detail.specializedTool.label}
                className="rounded border border-border px-2 py-1 text-xs font-medium text-primary underline"
              />
            )}
            {detail.aiRemediationAvailable && !isConfirmationOnly && (
              <button
                type="button"
                className="rounded border border-border px-2 py-1 text-xs font-medium"
                aria-expanded={showLab}
                onClick={() => setShowLab(true)}
              >
                Generate AI-assisted remediation
              </button>
            )}
          </div>
        )}
      </div>

      {expanded && (
        <div className="border-t border-border bg-muted/20 p-4">
          <section aria-labelledby={`problem-${detail.findingId}`}>
            <h5 id={`problem-${detail.findingId}`} className="font-semibold">
              Problem
            </h5>
            <p className="mt-1">{detail.title}</p>
            <p className="mt-1 text-muted">{detail.description}</p>
          </section>
          <section className="mt-3" aria-labelledby={`impact-${detail.findingId}`}>
            <h5 id={`impact-${detail.findingId}`} className="font-semibold">
              Why it matters
            </h5>
            <p className="mt-1 text-muted">
              {getUserImpactForRule(detail.ruleId, detail.title)}
            </p>
          </section>
          <section className="mt-3" aria-labelledby={`standards-${detail.findingId}`}>
            <h5 id={`standards-${detail.findingId}`} className="font-semibold">
              Standards
            </h5>
            <ul className="mt-1 list-inside list-disc text-muted">
              {detail.wcagMappings.length === 0 && <li>WCAG mapping unavailable</li>}
              {detail.wcagMappings.map((m) => (
                <li key={m.criterion}>
                  WCAG {m.criterion}
                  {m.title ? ` — ${m.title}` : ""}
                  {m.level ? ` (Level ${m.level})` : ""}
                </li>
              ))}
            </ul>
            <p className="mt-1 text-xs text-muted">Axe rule: {detail.ruleId}</p>
          </section>
          <section className="mt-3" aria-labelledby={`scope-${detail.findingId}`}>
            <h5 id={`scope-${detail.findingId}`} className="font-semibold">
              Scope
            </h5>
            <p className="mt-1 text-muted">
              {detail.totalOccurrences} total occurrences · {detail.retainedEvidenceCount}{" "}
              retained evidence · {detail.pagesAffected} page(s)
            </p>
            {scopeByPage.size > 0 && (
              <ul className="mt-2 space-y-2">
                {[...scopeByPage.entries()].map(([url, vpMap]) => (
                  <li key={url} className="rounded border border-border p-2">
                    <p className="break-all font-medium">{url}</p>
                    <ul className="mt-1 text-xs text-muted">
                      {[...vpMap.entries()].map(([vp, count]) => (
                        <li key={vp}>
                          {vp === "desktop" ? "Desktop" : "Mobile"}: {count} occurrence
                          {count === 1 ? "" : "s"}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="mt-3" aria-labelledby={`evidence-${detail.findingId}`}>
            <h5 id={`evidence-${detail.findingId}`} className="font-semibold">
              Evidence
            </h5>
            {detail.evidenceItems.length === 0 && detail.totalOccurrences > 0 && (
              <p className="mt-1 text-muted">
                No detailed evidence retained (cap or privacy). Occurrence totals still reflect
                scanner metadata.
              </p>
            )}
            {visibleEvidence.map((e) => (
              <details key={e.evidenceId} className="mt-2 rounded border border-border p-2">
                <summary className="cursor-pointer font-medium">
                  {e.pageUrl} · {e.viewportId === "desktop" ? "Desktop" : "Mobile"} · #
                  {e.occurrenceIndex}
                </summary>
                {e.selector && <CopySelectorButton selector={e.selector} />}
                {e.failureSummary && (
                  <p className="mt-2 text-xs text-muted">{e.failureSummary}</p>
                )}
                {e.contrast && (
                  <dl className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                    {e.contrast.measuredContrastRatio && (
                      <>
                        <dt>Measured ratio</dt>
                        <dd>{e.contrast.measuredContrastRatio}</dd>
                      </>
                    )}
                    {e.contrast.requiredRatio && (
                      <>
                        <dt>Required ratio</dt>
                        <dd>{e.contrast.requiredRatio}</dd>
                      </>
                    )}
                    {e.contrast.foregroundColor && (
                      <>
                        <dt>Foreground</dt>
                        <dd>{e.contrast.foregroundColor}</dd>
                      </>
                    )}
                    {e.contrast.backgroundColor && (
                      <>
                        <dt>Background</dt>
                        <dd>{e.contrast.backgroundColor}</dd>
                      </>
                    )}
                    {e.contrast.fontSize && (
                      <>
                        <dt>Font size</dt>
                        <dd>{e.contrast.fontSize}</dd>
                      </>
                    )}
                    {e.contrast.fontWeight && (
                      <>
                        <dt>Font weight</dt>
                        <dd>{e.contrast.fontWeight}</dd>
                      </>
                    )}
                  </dl>
                )}
                {e.aria && (
                  <dl className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                    {e.aria.tag && (
                      <>
                        <dt>Element</dt>
                        <dd>{e.aria.tag}</dd>
                      </>
                    )}
                    {e.aria.role && (
                      <>
                        <dt>Role</dt>
                        <dd>{e.aria.role}</dd>
                      </>
                    )}
                    {e.aria.ariaAttributes?.length ? (
                      <>
                        <dt>ARIA</dt>
                        <dd>{e.aria.ariaAttributes.join(", ")}</dd>
                      </>
                    ) : null}
                  </dl>
                )}
                {e.htmlSnippet && (
                  <pre className="mt-2 max-w-full overflow-x-auto text-xs">
                    <code>{sanitizeTicketHtmlSnippet(e.htmlSnippet)}</code>
                  </pre>
                )}
              </details>
            ))}
            {(detail.evidenceItems.length > MAX_VISIBLE ||
              detail.representativeSelectors.length > MAX_VISIBLE) &&
              !showMoreEvidence && (
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-primary underline"
                  onClick={() => setShowMoreEvidence(true)}
                >
                  {viewOccurrencesButtonLabel(
                    detail.retainedEvidenceCount,
                    detail.totalOccurrences,
                  )}
                </button>
              )}
            {visibleSelectors.length > 0 && level !== "simple" && (
              <ul className="mt-2 list-inside list-disc text-xs text-muted">
                {visibleSelectors.map((sel) => (
                  <li key={sel} className="break-all">
                    {sel}
                  </li>
                ))}
              </ul>
            )}
          </section>
          {(isConfirmationOnly || detail.relatedHumanReviewCheckIds.length > 0) && (
            <section
              className="mt-3"
              aria-labelledby={`human-review-${detail.findingId}`}
            >
              <h5 id={`human-review-${detail.findingId}`} className="font-semibold">
                Human review
              </h5>
              {isConfirmationOnly && (
                <p className="mt-1 text-xs text-muted">
                  Related automated uncertainty — axe could not conclusively determine this rule.
                  A structured human procedure is separate from this incomplete result.
                </p>
              )}
              {detail.relatedHumanReviewCheckIds.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {detail.relatedHumanReviewCheckIds.map((checkId) => {
                    const def = HUMAN_REVIEW_REGISTRY_V1.find((d) => d.id === checkId);
                    return (
                      <li key={checkId}>
                        <button
                          type="button"
                          className="text-xs font-medium text-primary underline"
                          disabled={sampleMode}
                          onClick={() =>
                            dispatch({
                              type: "OPEN_HUMAN_REVIEW_CHECK",
                              checkDefinitionId: checkId,
                            })
                          }
                        >
                          Open related human review procedure:{" "}
                          {def?.title ?? checkId}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : isConfirmationOnly ? (
                <p className="mt-1 text-xs text-muted">
                  No mapped human review procedure for this incomplete rule.
                </p>
              ) : null}
            </section>
          )}
          {!detail.deterministicFixAvailable && !isConfirmationOnly && (
            <p className="mt-3 text-xs text-muted">
              Detailed deterministic guidance is not yet available for this rule — use axe
              documentation and verify with a rescan.
            </p>
          )}
        </div>
      )}

      {!sampleMode && showLab && rootCauseGroup && (
        <FixLabPanel
          ruleId={detail.ruleId}
          axeHelp={detail.title}
          group={rootCauseGroup}
          findingDetail={detail}
          completedPages={completedPages}
        />
      )}
    </li>
  );
}
