"use client";

import {
  canVisualizeRule,
  collectLocatorOccurrencesForRule,
} from "@/features/website-scanner/utils/visualLocator/collectLocatorOccurrences";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { useVisualLocatorContext } from "@/features/website-scanner/components/visualLocator/VisualLocatorProvider";

type Props = {
  ruleId: string;
  ruleTitle: string;
  completedPages: WebsitePageScanResult[];
  pageUrlFilter?: string;
  className?: string;
};

export function ViewOnPageButton({
  ruleId,
  ruleTitle,
  completedPages,
  pageUrlFilter,
  className,
}: Props) {
  const { openForRule } = useVisualLocatorContext();

  if (!canVisualizeRule(completedPages, ruleId)) return null;

  return (
    <button
      type="button"
      title="Re-render the page and highlight this element in context (on demand)."
      className={
        className ??
        "rounded border border-border px-2 py-1 text-xs font-medium text-muted"
      }
      onClick={(e) => {
        const list = collectLocatorOccurrencesForRule(
          completedPages,
          ruleId,
          ruleTitle,
          pageUrlFilter,
        );
        openForRule(list, ruleTitle, e.currentTarget);
      }}
    >
      View on Page
    </button>
  );
}
