"use client";

import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { HumanReviewWorkspacePanel } from "@/features/website-scanner/components/results/HumanReviewWorkspacePanel";

type Props = { completedPages: WebsitePageScanResult[]; sampleMode?: boolean };

export function HumanReviewTab({ completedPages, sampleMode }: Props) {
  const { sampleMode: ctxSample } = useWebsiteScanSession();
  const isSample = sampleMode ?? ctxSample;

  return (
    <div className="space-y-4">
      {isSample ? (
        <p className="rounded-lg border border-amber-600/40 bg-amber-50 p-3 text-sm dark:bg-amber-950/20">
          Manual review statuses shown below are fictional sample values for demonstration only.
        </p>
      ) : null}
      <HumanReviewWorkspacePanel completedPages={completedPages} sampleMode={isSample} />
    </div>
  );
}
