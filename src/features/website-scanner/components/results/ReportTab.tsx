"use client";

import { WebsiteScanReportPanel } from "@/features/website-scanner/components/WebsiteScanReportPanel";
import { ReportBrandingPanel } from "@/features/website-scanner/components/results/ReportBrandingPanel";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { ReportAiRemediationInclusionPanel } from "@/features/reports/components/ReportAiRemediationInclusionPanel";
import { collectWebsiteRemediationCandidates } from "@/lib/ai/remediation/report";

type Props = { completedPages: WebsitePageScanResult[] };

export function ReportTab({ completedPages }: Props) {
  const { state, dispatch } = useWebsiteScanSession();
  const candidates = collectWebsiteRemediationCandidates(
    state,
    state.siteIntelligence,
  );

  return (
    <div className="space-y-4">
      <ReportBrandingPanel />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={state.includeDeveloperFixGuidanceInReport}
          onChange={(e) =>
            dispatch({
              type: "SET_INCLUDE_DEV_GUIDANCE_REPORT",
              value: e.target.checked,
            })
          }
        />
        Include developer fix guidance appendix in report
      </label>
      <ReportAiRemediationInclusionPanel
        masterEnabled={state.includeAiRemediationInReport}
        onMasterChange={(value) =>
          dispatch({ type: "SET_INCLUDE_AI_REMEDIATION_REPORT", value })
        }
        candidates={candidates}
        selectedIds={state.aiRemediationInclusionById}
        onToggleId={(id, included) =>
          dispatch({ type: "SET_AI_REMEDIATION_INCLUSION", id, included })
        }
        onBulk={(ids, included) =>
          dispatch({ type: "SET_AI_REMEDIATION_INCLUSION_BULK", ids, included })
        }
        idPrefix="web-ai-rem"
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={state.exportPreferences.includeAiRemediationInExports}
          onChange={(e) =>
            dispatch({
              type: "SET_EXPORT_PREFERENCES",
              prefs: { includeAiRemediationInExports: e.target.checked },
            })
          }
        />
        Include selected AI remediation in Excel / evidence package exports
      </label>
      <WebsiteScanReportPanel pages={completedPages} session={state} />
    </div>
  );
}
