import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import {
  aggregateScanCompleteness,
  scanCompletenessLabel,
} from "@/features/website-scanner/utils/scanCompletenessAggregate";

type Props = { pages: WebsitePageScanResult[] };

export function ScanQualityPanel({ pages }: Props) {
  const level = aggregateScanCompleteness(pages);
  const partialPages = pages.filter(
    (p) => p.scanCompleteness !== "complete",
  ).length;
  return (
    <div className="text-sm">
      <p>
        Scan completeness:{" "}
        <strong>{scanCompletenessLabel(level)}</strong>
        {partialPages > 0 && ` · ${partialPages} page(s) with limits`}
      </p>
    </div>
  );
}
