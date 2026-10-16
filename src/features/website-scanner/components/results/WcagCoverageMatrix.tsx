import type { WcagCoverageCriterion } from "@/features/accessibility-intelligence/types/siteIntelligence";
import { wcagCoverageCounts } from "@/features/website-scanner/utils/issueViewModels";

type Props = { coverage: WcagCoverageCriterion[] };

export function WcagCoverageMatrix({ coverage }: Props) {
  const counts = wcagCoverageCounts(coverage);
  return (
    <div className="rounded-lg border border-border p-4 text-sm">
      <h3 className="font-semibold">WCAG coverage (automation class)</h3>
      <p className="mt-2 text-muted">
        This summary counts criteria by how they are covered in our matrix — not
        a compliance percentage.
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        <li>Fully automatable checks tracked: {counts.automated}</li>
        <li>Partial automation: {counts.partial}</li>
        <li>Manual review required: {counts.manual}</li>
        <li>Manual checks marked complete: {counts.manualCompleted}</li>
      </ul>
    </div>
  );
}
