import type { RootCauseGroup } from "@/features/accessibility-intelligence/types/siteIntelligence";
import { ImpactBadge } from "@/features/website-scanner/components/results/ImpactBadge";

type Props = {
  group: RootCauseGroup;
  impact?: string;
};

export function RootCauseCard({ group, impact }: Props) {
  return (
    <article className="rounded-lg border border-border p-4 text-sm">
      <h4 className="font-semibold">{group.label}</h4>
      {impact && <ImpactBadge impact={impact} />}
      <p className="mt-2 text-muted">
        {group.totalOccurrences} occurrence(s) on {group.affectedPages.length}{" "}
        page(s)
        {group.likelySharedComponent &&
          group.confidence !== "low" &&
          " · Likely shared component (fix once may resolve many)"}
      </p>
      {group.representativeSelectors.length > 0 && (
        <p className="mt-1 text-xs text-muted">
          Example selectors: {group.representativeSelectors.slice(0, 2).join(", ")}
        </p>
      )}
    </article>
  );
}
