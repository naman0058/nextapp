"use client";

import type { CategoryAreaSummary } from "@/features/website-scanner/executive/types";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";

type Props = {
  categories: CategoryAreaSummary[];
};

export function AffectedAreasSection({ categories }: Props) {
  const { dispatch } = useWebsiteScanSession();

  if (categories.length === 0) return null;

  const maxOcc = Math.max(...categories.map((c) => c.affectedOccurrences), 1);

  return (
    <section aria-labelledby="affected-areas-heading">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h3 id="affected-areas-heading" className="font-display text-lg font-bold">
          Affected areas
        </h3>
        <button
          type="button"
          className="text-sm font-medium text-primary underline-offset-2 hover:underline"
          onClick={() => dispatch({ type: "SET_RESULT_VIEW", view: "coverage" })}
        >
          View full coverage
        </button>
      </div>
      <ul className="mt-3 space-y-3" aria-label="Affected accessibility areas">
        {categories.map((cat) => {
          const barPct =
            cat.affectedOccurrences > 0
              ? Math.round((cat.affectedOccurrences / maxOcc) * 100)
              : cat.confirmationNeededCount > 0
                ? 8
                : 0;
          return (
            <li key={cat.category} className="text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <button
                  type="button"
                  className="font-medium text-left text-primary underline-offset-2 hover:underline"
                  onClick={() =>
                    dispatch({
                      type: "OPEN_ISSUES_WITH_FILTER",
                      filter: { category: cat.category, issueStatus: "actionable" },
                    })
                  }
                >
                  {cat.category}
                </button>
                <span className="text-xs text-muted tabular-nums">
                  {cat.failedRuleCount} failed rule
                  {cat.failedRuleCount === 1 ? "" : "s"}
                  {cat.affectedOccurrences > 0 &&
                    ` · ${cat.affectedOccurrences} occurrence${cat.affectedOccurrences === 1 ? "" : "s"}`}
                  {cat.pagesAffected > 0 && ` · ${cat.pagesAffected} page${cat.pagesAffected === 1 ? "" : "s"}`}
                </span>
              </div>
              <div
                className="mt-1 h-2 w-full rounded bg-muted"
                role="img"
                aria-label={`${cat.category}: ${cat.failedRuleCount} failed rules, ${cat.affectedOccurrences} occurrences`}
              >
                <div
                  className="h-2 rounded bg-primary/70"
                  style={{ width: `${Math.max(barPct, cat.failedRuleCount > 0 ? 4 : 0)}%` }}
                />
              </div>
              {cat.confirmationNeededCount > 0 && (
                <p className="mt-1 text-xs text-muted">
                  + manual confirmation pending ({cat.confirmationNeededCount})
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
