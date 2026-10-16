"use client";

import type {
  FixPlanItem,
  RootCauseGroup,
} from "@/features/accessibility-intelligence/types/siteIntelligence";
import {
  getRuleKnowledge,
  getUserImpactForRule,
} from "@/features/accessibility-intelligence/knowledge/ruleKnowledge";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { CopyCodeBlock } from "@/features/website-scanner/components/results/CopyCodeBlock";
import { VerificationChecklist } from "@/features/website-scanner/components/results/VerificationChecklist";
import { ViewOnPageButton } from "@/features/website-scanner/components/visualLocator/ViewOnPageButton";
import { CopyDeveloperTicketButton } from "@/features/website-scanner/components/developerTicket/CopyDeveloperTicketButton";
import { WebsiteAiRemediationSection } from "@/features/website-scanner/components/results/WebsiteAiRemediationSection";

type Props = {
  ruleId: string;
  axeHelp: string;
  group?: RootCauseGroup;
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
  completedPages,
  fixPlanItem,
  displayFixStatus,
  onRescanVerify,
  sampleMode,
  sampleRemediation,
}: Props) {
  const knowledge = getRuleKnowledge(ruleId);
  const template = knowledge?.deterministicFixTemplate;

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-dashed border-border bg-background p-4 text-sm">
      <p className="font-semibold">Fix Lab</p>
      <p className="text-muted">
        {knowledge?.plainTitle ?? axeHelp} — deterministic guidance first; AI is
        optional.
      </p>

      <section aria-labelledby="recommended-fix-heading">
        <h4 id="recommended-fix-heading" className="font-semibold">
          Recommended Fix
        </h4>
        {template ? (
          <>
            <p className="mt-2">
              <strong>Problem:</strong> {template.whatIsWrong}
            </p>
            <p>
              <strong>Why:</strong> {template.whyItMatters}
            </p>
            <p>
              <strong>User impact:</strong>{" "}
              {getUserImpactForRule(ruleId, axeHelp)}
            </p>
          </>
        ) : (
          <p className="mt-2 text-muted">
            No detailed template yet for this rule. Use axe documentation and verify
            manually after fixing.
          </p>
        )}
      </section>

      {template && (
        <section aria-labelledby="pattern-heading">
          <h4 id="pattern-heading" className="font-semibold">
            Possible Implementation Pattern
          </h4>
          <CopyCodeBlock
            code={template.genericPattern}
            label="Copy possible implementation pattern"
          />
          {knowledge?.beforeExample && knowledge?.afterExample && (
            <>
              <p className="mt-2 font-medium">Before</p>
              <CopyCodeBlock code={knowledge.beforeExample} />
              <p className="font-medium">After</p>
              <CopyCodeBlock code={knowledge.afterExample} />
            </>
          )}
          <p className="mt-2">
            <strong>Common mistakes:</strong> {template.whatNotToDo}
          </p>
        </section>
      )}

      {!sampleMode && group && (
        <WebsiteAiRemediationSection
          group={group}
          fixPlanItem={fixPlanItem}
          completedPages={completedPages}
          onRescanVerify={onRescanVerify}
        />
      )}

      {sampleMode && sampleRemediation && group && (
        <SampleAiRemediationPreview entry={sampleRemediation} />
      )}

      <VerificationChecklist ruleId={ruleId} />
      <div className="flex flex-wrap gap-2">
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
            ruleTitle={knowledge?.plainTitle ?? axeHelp}
            completedPages={completedPages}
            className="rounded border border-border px-3 py-1.5 text-xs font-medium"
          />
        )}
        {onRescanVerify && !sampleMode && (
          <button
            type="button"
            className="rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            onClick={onRescanVerify}
          >
            Rescan to Verify
          </button>
        )}
      </div>
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
      <p className="mt-1 text-xs text-muted">Static example — no live OpenAI call.</p>
      <p className="mt-2">{entry.report.problemSummary}</p>
    </div>
  );
}
