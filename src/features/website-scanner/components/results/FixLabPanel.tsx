"use client";

import { useMemo, useState } from "react";
import type {
  FixPlanItem,
  RootCauseGroup,
} from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { FindingDetail } from "@/features/website-scanner/findingDetail/types";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { SupportedFramework } from "@/features/website-scanner/remediation/types";
import { CopyCodeBlock } from "@/features/website-scanner/components/results/CopyCodeBlock";
import { ViewOnPageButton } from "@/features/website-scanner/components/visualLocator/ViewOnPageButton";
import { CopyDeveloperTicketButton } from "@/features/website-scanner/components/developerTicket/CopyDeveloperTicketButton";
import { WebsiteAiRemediationSection } from "@/features/website-scanner/components/results/WebsiteAiRemediationSection";
import {
  buildEvidenceAwareNotes,
  getDeterministicRemediation,
  hasFullDeterministicRemediation,
  isClientAiRemediationAvailable,
} from "@/features/website-scanner/remediation";
import { sanitizeTicketHtmlSnippet } from "@/features/website-scanner/developerTicket/sanitizeDeveloperTicketContent";

const FRAMEWORK_TABS: { id: SupportedFramework; label: string }[] = [
  { id: "html", label: "HTML" },
  { id: "react", label: "React" },
  { id: "vue", label: "Vue" },
  { id: "angular", label: "Angular" },
];

type Props = {
  ruleId: string;
  axeHelp: string;
  group?: RootCauseGroup;
  findingDetail?: FindingDetail;
  completedPages: WebsitePageScanResult[];
  fixPlanItem?: FixPlanItem;
  displayFixStatus?: string;
  onRescanVerify?: () => void;
  sampleMode?: boolean;
  sampleRemediation?: import("@/features/website-scanner/types/websiteAiRemediation").WebsiteAiRemediationEntry;
};

export function FixLabPanel({
  ruleId,
  axeHelp,
  group,
  findingDetail,
  completedPages,
  fixPlanItem,
  displayFixStatus,
  onRescanVerify,
  sampleMode,
  sampleRemediation,
}: Props) {
  const def = getDeterministicRemediation(ruleId);
  const supported = hasFullDeterministicRemediation(ruleId);
  const [framework, setFramework] = useState<SupportedFramework>("html");
  const [showEvidence, setShowEvidence] = useState(false);

  const snippets = useMemo(
    () =>
      (findingDetail?.evidenceItems ?? [])
        .map((e) => e.htmlSnippet)
        .filter(Boolean)
        .map((s) => sanitizeTicketHtmlSnippet(s!) ?? s!)
        .slice(0, 3),
    [findingDetail],
  );

  const evidenceNotes = useMemo(
    () => (def ? buildEvidenceAwareNotes(def, snippets) : []),
    [def, snippets],
  );

  const exampleCode =
    def?.examples?.[framework] ??
    def?.examples?.html ??
    null;

  const reachLabel =
    group && group.likelySharedComponent && group.totalOccurrences > 1
      ? `Potential shared remediation reach: ${group.totalOccurrences} occurrence${group.totalOccurrences === 1 ? "" : "s"} across ${group.affectedPages.length} page(s). Confirm the shared cause before assuming one change fixes all nodes.`
      : null;

  const aiAvailable =
    findingDetail?.aiRemediationAvailable ?? isClientAiRemediationAvailable();

  return (
    <div className="mt-3 space-y-4 rounded-lg border border-dashed border-border bg-background p-4 text-sm">
      <div>
        <p className="font-semibold">Fix Lab</p>
        <p className="text-xs text-muted">
          Deterministic guidance first · AI optional · Suggested implementation — review before shipping
        </p>
      </div>

      <section aria-labelledby="fixlab-recommended">
        <h4 id="fixlab-recommended" className="font-semibold">
          A. Recommended remediation
        </h4>
        {supported && def ? (
          <>
            <p className="mt-2">{def.shortProblem}</p>
            {evidenceNotes.map((n) => (
              <p key={n.slice(0, 48)} className="mt-2 text-muted">
                {n}
              </p>
            ))}
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              {def.remediationSteps.map((step) => (
                <li key={step.slice(0, 64)}>{step}</li>
              ))}
            </ol>
          </>
        ) : (
          <p className="mt-2 text-muted">
            Detailed deterministic guidance is not yet available for this rule. Use axe
            documentation, retained evidence, and verification steps below.
          </p>
        )}
        {reachLabel && (
          <p className="mt-2 text-xs text-muted">{reachLabel}</p>
        )}
      </section>

      {supported && def?.whyThisWorks && (
        <section aria-labelledby="fixlab-why">
          <h4 id="fixlab-why" className="font-semibold">
            B. Why this works
          </h4>
          <p className="mt-2 text-muted">{def.whyThisWorks}</p>
        </section>
      )}

      {supported && def && (
        <section aria-labelledby="fixlab-steps">
          <h4 id="fixlab-steps" className="font-semibold">
            C. Implementation steps
          </h4>
          <p className="mt-2 text-muted">
            Follow the numbered steps above in your codebase. Prefer native HTML semantics
            before adding ARIA.
          </p>
          {def.implementationNotes?.map((note) => (
            <p key={note.slice(0, 48)} className="mt-1 text-xs text-muted">
              {note}
            </p>
          ))}
        </section>
      )}

      {supported && exampleCode && (
        <section aria-labelledby="fixlab-code">
          <h4 id="fixlab-code" className="font-semibold">
            D. Code example
          </h4>
          <p className="mt-1 text-xs text-muted">
            Example only — not an automatic patch.
          </p>
          <div className="mt-2 flex flex-wrap gap-2" role="tablist" aria-label="Framework">
            {FRAMEWORK_TABS.filter(
              (t) =>
                def?.supportedFrameworks.includes(t.id) && def.examples?.[t.id],
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={framework === t.id}
                className={`rounded border px-2 py-1 text-xs ${
                  framework === t.id ? "border-primary bg-primary/10" : "border-border"
                }`}
                onClick={() => setFramework(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          {exampleCode ? (
            <CopyCodeBlock
              code={exampleCode}
              label={`Copy ${framework} example`}
            />
          ) : (
            <p className="mt-2 text-xs text-muted">
              No safe generic example for this framework; use HTML guidance or AI-assisted
              suggestions after review.
            </p>
          )}
        </section>
      )}

      {(findingDetail?.evidenceItems.length || group) && (
        <section aria-labelledby="fixlab-evidence">
          <h4 id="fixlab-evidence" className="font-semibold">
            E. Evidence from your scan
          </h4>
          <button
            type="button"
            className="mt-1 text-xs font-medium text-primary underline"
            aria-expanded={showEvidence}
            onClick={() => setShowEvidence((v) => !v)}
          >
            {showEvidence ? "Hide evidence" : "Show evidence"}
          </button>
          {showEvidence && (
            <ul className="mt-2 space-y-2 text-xs">
              {(findingDetail?.evidenceItems ?? []).slice(0, 5).map((e) => (
                <li key={e.evidenceId} className="rounded border border-border p-2">
                  <p className="break-all">{e.pageUrl}</p>
                  {e.selector && <p className="font-mono">{e.selector}</p>}
                  {e.failureSummary && <p className="text-muted">{e.failureSummary}</p>}
                </li>
              ))}
              {findingDetail &&
                findingDetail.totalOccurrences > findingDetail.retainedEvidenceCount && (
                  <li className="text-muted">
                    {findingDetail.totalOccurrences} total occurrences;{" "}
                    {findingDetail.retainedEvidenceCount} detailed examples retained.
                  </li>
                )}
            </ul>
          )}
        </section>
      )}

      <section aria-labelledby="fixlab-verify">
        <h4 id="fixlab-verify" className="font-semibold">
          F. How to verify
        </h4>
        {def ? (
          <ul className="mt-2 list-disc pl-5 text-muted">
            {def.verificationSteps.map((v) => (
              <li key={v.text.slice(0, 48)}>
                <span className="sr-only">{v.kind} check: </span>
                {v.text}
                <span className="text-xs"> ({v.kind})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-muted">
            Re-run the scan after fixing; spot-check with keyboard and screen reader where
            relevant.
          </p>
        )}
      </section>

      {def?.specializedTool && (
        <section aria-labelledby="fixlab-tool">
          <h4 id="fixlab-tool" className="font-semibold">
            G. Related specialized tool
          </h4>
          <p className="mt-2">
            <a href={def.specializedTool.href} className="font-medium text-primary underline">
              {def.specializedTool.label}
            </a>
          </p>
        </section>
      )}

      <section aria-labelledby="fixlab-ai" className="border-t border-border pt-3">
        <h4 id="fixlab-ai" className="font-semibold">
          H. Optional AI-Assisted Remediation
        </h4>
        {!sampleMode && group && aiAvailable && (
          <WebsiteAiRemediationSection
            group={group}
            fixPlanItem={fixPlanItem}
            completedPages={completedPages}
            onRescanVerify={onRescanVerify}
          />
        )}
        {!sampleMode && group && !aiAvailable && (
          <p className="mt-2 text-xs text-muted">
            AI-assisted remediation is not configured for this environment. Deterministic
            guidance above remains fully usable.
          </p>
        )}
        {sampleMode && sampleRemediation && group && (
          <SampleAiRemediationPreview entry={sampleRemediation} />
        )}
      </section>

      <section aria-labelledby="fixlab-handoff" className="border-t border-border pt-3">
        <h4 id="fixlab-handoff" className="font-semibold">
          I. Developer handoff
        </h4>
        <div className="mt-2 flex flex-wrap gap-2">
          <CopyDeveloperTicketButton
            ruleId={ruleId}
            axeHelp={axeHelp}
            completedPages={completedPages}
            group={group}
            fixPlanItem={fixPlanItem}
            displayFixStatus={displayFixStatus}
            className="rounded border border-border px-3 py-1.5 text-xs font-medium"
          />
          {!sampleMode && (
            <ViewOnPageButton
              ruleId={ruleId}
              ruleTitle={def?.title ?? axeHelp}
              completedPages={completedPages}
              className="rounded border border-border px-3 py-1.5 text-xs font-medium"
            />
          )}
        </div>
      </section>

      {onRescanVerify && !sampleMode && (
        <section aria-labelledby="fixlab-rescan">
          <h4 id="fixlab-rescan" className="font-semibold">
            J. Rescan to Verify
          </h4>
          <p className="mt-1 text-xs text-muted">
            Compare automated results before and after your changes. Absence of a rule on
            rescan does not mean full WCAG compliance.
          </p>
          <button
            type="button"
            className="mt-2 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            onClick={onRescanVerify}
          >
            Rescan to Verify
          </button>
        </section>
      )}

      {!supported && (
        <p className="text-xs text-muted">
          Axe help: {axeHelp}
          {def?.sourceReferences?.[0]?.url && (
            <>
              {" "}
              ·{" "}
              <a href={def.sourceReferences[0].url} className="underline">
                {def.sourceReferences[0].label}
              </a>
            </>
          )}
        </p>
      )}
    </div>
  );
}

function SampleAiRemediationPreview({
  entry,
}: {
  entry: import("@/features/website-scanner/types/websiteAiRemediation").WebsiteAiRemediationEntry;
}) {
  return (
    <div className="rounded border border-border p-3">
      <p className="font-semibold">Sample AI-Assisted Guidance</p>
      <p className="mt-1 text-xs text-muted">
        AI-assisted suggestions require review before implementation.
      </p>
      <p className="mt-2">{entry.report.problemSummary}</p>
    </div>
  );
}
