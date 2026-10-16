import type {
  PlatformChecklistResultItem,
  PlatformPublishingReadiness,
} from "@/features/accessibility/config/platformAccessibility/types";
import { PlatformChecklistItemRow } from "@/features/accessibility/components/platform/PlatformChecklistItemRow";
import { ReadinessProgressBar } from "@/components/results/ReadinessProgressBar";

type PlatformPublishingReadinessProps = {
  summary: PlatformPublishingReadiness;
  items: PlatformChecklistResultItem[];
};

export function PlatformPublishingReadinessPanel({
  summary,
  items,
}: PlatformPublishingReadinessProps) {
  const headlineTone =
    summary.reviewCount === 0 && summary.readyCount === summary.totalApplicable
      ? "text-teal-700"
      : summary.reviewCount > 0
        ? "text-amber-800"
        : "text-foreground";

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-lg shadow-slate-950/5">
      <div className="border-b border-border bg-gradient-to-r from-slate-50 to-indigo-50/40 px-5 py-5">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          Publish phase
        </p>
        <h3 className="font-display mt-1 text-xl font-bold text-foreground">
          Platform publishing readiness
        </h3>
        <p className={`font-display mt-2 text-lg font-bold ${headlineTone}`}>
          {summary.label}
        </p>
        <div className="mt-4">
          <ReadinessProgressBar
            readyCount={summary.readyCount}
            totalApplicable={summary.totalApplicable}
            reviewCount={summary.reviewCount}
          />
        </div>
      </div>
      <ul className="space-y-2 p-4 sm:p-5">
        {items.map((item) => (
          <PlatformChecklistItemRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}
