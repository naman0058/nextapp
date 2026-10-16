"use client";

import { useState } from "react";
import type {
  FixPlanItem,
  RootCauseGroup,
} from "@/features/accessibility-intelligence/types/siteIntelligence";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { WebsiteAiRemediationEntry } from "@/features/website-scanner/types/websiteAiRemediation";
import { buildWebsiteRemediationContext } from "@/features/website-scanner/server/remediation/buildWebsiteRemediationContext";
import { AIRemediationPanel } from "@/lib/ai/remediation/components/AIRemediationPanel";
import type { CodeFramework } from "@/lib/ai/remediation/types";

type Props = {
  group: RootCauseGroup;
  fixPlanItem?: FixPlanItem;
  completedPages: WebsitePageScanResult[];
  onRescanVerify?: () => void;
};

export function WebsiteAiRemediationSection({
  group,
  fixPlanItem,
  completedPages,
  onRescanVerify,
}: Props) {
  const { state, dispatch } = useWebsiteScanSession();
  const [framework, setFramework] = useState<CodeFramework>("generic_html");

  const entry: WebsiteAiRemediationEntry | undefined =
    state.aiRemediationByGroup[group.id];

  const scanId = `${state.sessionId}:${state.scanRevision}`;

  return (
    <AIRemediationPanel
      panelId={group.id}
      source="website"
      sessionId={state.sessionId}
      scanId={scanId}
      entry={entry ?? null}
      stale={entry?.stale ?? false}
      staleMessage="Generated for previous scan — generate again after rescan if needed."
      showFrameworkPicker
      frameworkPreference={framework}
      onFrameworkChange={setFramework}
      skipGenerateIfCached={(e) => e.frameworkPreference === framework}
      headerExtra={
        <span className="rounded border border-border px-2 py-0.5 text-xs">
          Automated Finding
        </span>
      }
      onRescanVerify={onRescanVerify}
      buildRequest={() => {
        const { facts, deterministicGuidance } = buildWebsiteRemediationContext({
          group,
          fixPlanItem,
          completedPages,
          viewportMode: state.viewportMode,
          normalizedFindings: state.siteIntelligence?.normalizedFindings,
        });
        return { facts, deterministicGuidance, frameworkPreference: framework };
      }}
      onEntry={(newEntry) => {
        dispatch({
          type: "SET_AI_REMEDIATION_GROUP",
          groupId: group.id,
          entry: {
            report: newEntry.report,
            facts: newEntry.facts,
            frameworkPreference: framework,
            stale: false,
            generatedAt: newEntry.generatedAt,
            cached: newEntry.cached,
          },
        });
      }}
    />
  );
}
