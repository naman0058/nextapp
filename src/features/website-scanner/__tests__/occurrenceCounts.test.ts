import { describe, expect, it } from "vitest";
import {
  formatAffectedOccurrencesSummary,
  viewOccurrencesButtonLabel,
} from "@/features/website-scanner/utils/occurrenceCounts";

describe("occurrenceCounts", () => {
  it("formats affected occurrence summary for live regression case", () => {
    expect(formatAffectedOccurrencesSummary(82, 1)).toBe(
      "82 affected occurrences on 1 page",
    );
  });

  it("labels retained evidence button when totals differ", () => {
    expect(viewOccurrencesButtonLabel(20, 82)).toBe(
      "View retained evidence (20 of 82)",
    );
  });
});
