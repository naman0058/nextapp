"use client";

import { useState } from "react";
import type { FixPlanItem, RootCauseGroup } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { NormalizedAccessibilityFinding } from "@/features/accessibility-intelligence/types/normalizedFinding";
import { DeveloperTicketDialog } from "@/features/website-scanner/components/developerTicket/DeveloperTicketDialog";
import {
  buildDeveloperTicketForFinding,
  buildDeveloperTicketForRootCause,
} from "@/features/website-scanner/developerTicket/buildDeveloperTicketFromSession";
import {
  isDeveloperTicketEligibleForFinding,
  isDeveloperTicketEligibleForRootCause,
} from "@/features/website-scanner/developerTicket/isDeveloperTicketEligible";
import type { DeveloperTicket } from "@/features/website-scanner/developerTicket/types";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { FindingDetail } from "@/features/website-scanner/findingDetail/types";
import { buildDeveloperTicketContribution } from "@/features/accessibility-workspace/buildDeveloperTicketContribution";
import { queuePendingContribution } from "@/features/accessibility-workspace/handoffStorage";

type Props = {
  ruleId: string;
  axeHelp: string;
  completedPages: WebsitePageScanResult[];
  group?: RootCauseGroup;
  fixPlanItem?: FixPlanItem;
  finding?: NormalizedAccessibilityFinding;
  findingDetail?: FindingDetail;
  displayFixStatus?: string;
  className?: string;
};

export function CopyDeveloperTicketButton({
  ruleId,
  axeHelp,
  completedPages,
  group,
  fixPlanItem,
  finding,
  findingDetail,
  displayFixStatus,
  className,
}: Props) {
  const { state } = useWebsiteScanSession();
  const [open, setOpen] = useState(false);
  const [ticket, setTicket] = useState<DeveloperTicket | null>(null);
  const [includeAi, setIncludeAi] = useState(false);

  const eligible =
    (group && isDeveloperTicketEligibleForRootCause(group)) ||
    (finding && isDeveloperTicketEligibleForFinding(finding));

  if (!eligible) return null;

  const hasCachedAi = Boolean(
    group?.id && state.aiRemediationByGroup[group.id],
  );

  function rebuild(include: boolean) {
    if (group) {
      setTicket(
        buildDeveloperTicketForRootCause({
          group,
          completedPages,
          session: state,
          fixPlanItem,
          axeHelp,
          includeAiGuidance: include,
          displayFixStatus,
        }),
      );
    } else if (finding) {
      setTicket(
        buildDeveloperTicketForFinding({
          finding,
          completedPages,
          session: state,
          axeHelp,
          includeAiGuidance: include,
        }),
      );
    }
  }

  return (
    <>
      <button
        type="button"
        title={`Generate a developer-ready remediation ticket for ${ruleId}.`}
        className={
          className ??
          "rounded border border-border px-2 py-1 text-xs font-medium"
        }
        onClick={() => {
          rebuild(includeAi);
          setOpen(true);
        }}
      >
        Copy Developer Ticket
      </button>
      <DeveloperTicketDialog
        open={open}
        ticket={ticket}
        onClose={() => setOpen(false)}
        includeAiGuidance={includeAi}
        onIncludeAiChange={setIncludeAi}
        hasCachedAi={hasCachedAi}
        onRebuildWithAi={rebuild}
        workspaceContext={
          findingDetail
            ? {
                findingId: findingDetail.findingId,
                remediationGroupId: findingDetail.remediationGroupId,
                ruleId: findingDetail.ruleId,
                pageUrl: findingDetail.affectedUrls[0],
              }
            : undefined
        }
        onWorkspaceSaved={(savedTicket, includedInReport) => {
          if (!findingDetail) return;
          queuePendingContribution(
            buildDeveloperTicketContribution({
              ticket: savedTicket,
              findingId: findingDetail.findingId,
              remediationGroupId: findingDetail.remediationGroupId,
              ruleId: findingDetail.ruleId,
              pageUrl: findingDetail.affectedUrls[0],
              includedInReport,
            }),
          );
        }}
      />
    </>
  );
}
