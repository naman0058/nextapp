import { describe, expect, it } from "vitest";
import { buildSampleAccessibilityReportFixture } from "@/features/sample-report/buildSampleAccessibilityReportFixture";
import { validateSampleReportConsistency } from "@/features/sample-report/validateSampleReportConsistency";
import { buildDeveloperTicketForRootCause } from "@/features/website-scanner/developerTicket/buildDeveloperTicketFromSession";
import { FEATURED_DEVELOPER_TICKET_RULE_ID } from "@/features/sample-report/constants";
import { SAMPLE_REPORT_DISCLOSURE } from "@/features/sample-report/constants";

describe("sample accessibility report fixture", () => {
  const fixture = buildSampleAccessibilityReportFixture();

  it("passes consistency validation", () => {
    const result = validateSampleReportConsistency(fixture);
    expect(result.ok).toBe(true);
  });

  it("has 8 completed inventory pages and compare workload", () => {
    expect(fixture.session.scanScope.pagesCompleted).toBe(8);
    expect(fixture.session.viewportMode).toBe("compare");
    expect(fixture.completedPages.length).toBeGreaterThanOrEqual(13);
  });

  it("uses example.com only", () => {
    for (const page of fixture.completedPages) {
      expect(page.finalUrl.startsWith("https://example.com")).toBe(true);
    }
  });

  it("builds developer ticket for featured root cause", () => {
    const group = fixture.session.siteIntelligence?.rootCauseGroups.find(
      (g) => g.ruleId === FEATURED_DEVELOPER_TICKET_RULE_ID,
    );
    expect(group).toBeTruthy();
    const ticket = buildDeveloperTicketForRootCause({
      group: group!,
      session: fixture.session,
      completedPages: fixture.completedPages,
      axeHelp: "Buttons must have discernible text",
    });
    expect(ticket.title).toMatch(/^Accessibility:/);
    expect(ticket.acceptanceCriteria.length).toBeGreaterThan(0);
  });

  it("includes disclosure constant", () => {
    expect(SAMPLE_REPORT_DISCLOSURE).toContain("fictional");
  });
});
