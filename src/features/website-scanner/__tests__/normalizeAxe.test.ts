import { describe, expect, it } from "vitest";
import { normalizeAxeResults } from "@/features/website-scanner/server/axe/normalizeAxeResults";
import type { AxeResults } from "axe-core";

describe("normalizeAxeResults", () => {
  it("maps wcag tags to criteria", () => {
    const mock = {
      violations: [
        {
          id: "image-alt",
          impact: "critical",
          help: "Images must have alt",
          description: "desc",
          helpUrl: "https://deque.com",
          tags: ["wcag2a", "wcag111"],
          nodes: [
            {
              target: ["img"],
              html: "<img src=x>",
              failureSummary: "Fix alt",
            },
          ],
        },
      ],
      incomplete: [],
      passes: [{ id: "html-lang", nodes: [] }],
      inapplicable: [],
      testEngine: { name: "axe", version: "4.13.0" },
    } as unknown as AxeResults;

    const out = normalizeAxeResults(mock, true);
    expect(out.violations[0].wcagCriteria).toContain("1.1.1");
    expect(out.summary.critical).toBe(1);
  });
});
