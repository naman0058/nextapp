import type { PlatformChecklistResultItem } from "@/features/accessibility/config/platformAccessibility/types";
import type { PreflightStatus } from "@/types";
import { StatusLabel } from "@/features/accessibility/components/checker/StatusLabel";
import {
  platformItemAccent,
  platformStatusLabel,
} from "@/components/results/resultStyles";
import { cn } from "@/lib/utils";

function toPreflightStatus(
  status: PlatformChecklistResultItem["status"],
): PreflightStatus {
  if (status === "ready") return "pass";
  if (status === "review") return "review";
  return "not_checked";
}

type PlatformChecklistItemRowProps = {
  item: PlatformChecklistResultItem;
};

export function PlatformChecklistItemRow({ item }: PlatformChecklistItemRowProps) {
  return (
    <li
      className={cn(
        "list-none rounded-2xl border border-border border-l-4 bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
        platformItemAccent(item.status),
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold text-foreground">{item.label}</p>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-muted">
            {item.kind === "automated" ? "Automated signal" : "Publishing task"}
          </p>
        </div>
        <StatusLabel status={toPreflightStatus(item.status)} />
      </div>
      <p className="mt-2 text-xs text-muted">
        {platformStatusLabel(item.status)}
        {item.detail ? (
          <span className="mt-1 block text-sm text-foreground">{item.detail}</span>
        ) : null}
      </p>
    </li>
  );
}
