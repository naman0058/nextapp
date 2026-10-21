import { describe, expect, it } from "vitest";
import { buildDeveloperTicket } from "@/features/website-scanner/developerTicket/buildDeveloperTicket";
import { formatDeveloperTicketMarkdown } from "@/features/website-scanner/developerTicket/formatDeveloperTicketMarkdown";
import { formatDeveloperTicketPlainText } from "@/features/website-scanner/developerTicket/formatDeveloperTicketPlainText";
import { sanitizeDeveloperTicketFilename } from "@/features/website-scanner/developerTicket/sanitizeDeveloperTicketFilename";
import {
  escapeMarkdownInline,
  sanitizeTicketHtmlSnippet,
} from "@/features/website-scanner/developerTicket/sanitizeDeveloperTicketContent";
import { pagePathFromUrl } from "@/features/website-scanner/developerTicket/pagePathFromUrl";
import type { BuildDeveloperTicketInput } from "@/features/website-scanner/developerTicket/types";

function baseInput(
  overrides: Partial<BuildDeveloperTicketInput> = {},
): BuildDeveloperTicketInput {
  return {
    ruleId: "button-name",
    axeHelp: "Buttons must have discernible text",
    impact: "serious",
    priority: "high",
    sourceType: "axe",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
    scanContext: { viewportLabel: "Desktop 1440 × 900" },
    ...overrides,
  };
}

describe("buildDeveloperTicket", () => {
  it("builds root-cause ticket with scope and acceptance criteria", () => {
    const pages = Array.from({ length: 9 }, (_, i) =>
      `https://example.com/page-${i}`,
    );
    const ticket = buildDeveloperTicket(
      baseInput({
        rootCause: {
          label: "Shared navigation buttons",
          confidence: "high",
          likelySharedComponent: true,
          affectedPages: pages,
          totalOccurrences: 31,
          representativeSelectors: [
            "header nav button.menu-toggle",
            ".mobile-nav button",
            "button.a",
            "button.b",
            "button.c",
            "button.d",
          ],
          representativeEvidence: [
            {
              selector: "header nav button.menu-toggle",
              htmlSnippet: '<button class="menu-toggle"><svg></svg></button>',
              pageUrl: "https://example.com/",
            },
          ],
        },
      }),
    );
    expect(ticket.title).toMatch(/^Accessibility:/);
    expect(ticket.impact).toBe("serious");
    expect(ticket.priority).toBe("high");
    expect(ticket.scope.affectedPageCount).toBe(9);
    expect(ticket.scope.affectedElementCount).toBe(31);
    expect(ticket.representativeEvidence.length).toBeLessThanOrEqual(5);
    expect(ticket.acceptanceCriteria.length).toBeGreaterThanOrEqual(2);
    expect(ticket.verificationSteps.some((s) => s.includes("Re-run"))).toBe(true);
    expect(ticket.limitations.some((l) => l.includes("31 total"))).toBe(true);
  });

  it("supports individual finding fallback", () => {
    const ticket = buildDeveloperTicket(
      baseInput({
        findingFallback: {
          title: "Missing label",
          description: "A field has no label.",
          pageUrl: "https://example.com/form",
          occurrenceCount: 1,
          evidence: [{ selector: "#email" }],
        },
      }),
    );
    expect(ticket.scope.affectedElementCount).toBe(1);
    expect(ticket.representativeEvidence[0]?.selector).toBe("#email");
  });

  it("labels best practice without WCAG failure wording", () => {
    const md = formatDeveloperTicketMarkdown(
      buildDeveloperTicket(
        baseInput({ bestPractice: true, wcagCriteria: [], wcagLevel: null }),
      ),
    );
    expect(md).toContain("Best Practice");
    expect(md).not.toMatch(/\*\*WCAG:\*\* 4/);
  });

  it("marks human review required", () => {
    const md = formatDeveloperTicketMarkdown(
      buildDeveloperTicket(
        baseInput({ humanReviewRequired: true }),
      ),
    );
    expect(md).toContain("Human Review Required");
  });

  it("includes partial scan limitation", () => {
    const ticket = buildDeveloperTicket(
      baseInput({
        scanContext: {
          viewportLabel: "Desktop",
          scanCompletenessNote:
            "Scan limitation: Some content may not have been fully evaluated.",
        },
      }),
    );
    expect(ticket.limitations[0]).toContain("Scan limitation");
  });

  it("uses viewport detail in summary", () => {
    const ticket = buildDeveloperTicket(
      baseInput({
        viewportDetail: "Detected in mobile viewport only.",
        rootCause: {
          label: "Nav",
          confidence: "medium",
          likelySharedComponent: true,
          affectedPages: ["https://example.com/"],
          totalOccurrences: 2,
          representativeSelectors: ["button"],
          representativeEvidence: [],
        },
      }),
    );
    expect(ticket.summary).toContain("mobile viewport only");
    expect(ticket.rootCause?.confidenceNote).toContain("may originate");
  });

  it("redacts sensitive HTML attributes", () => {
    const snippet = sanitizeTicketHtmlSnippet(
      '<input type="text" value="secret" name="email">',
    );
    expect(snippet).toContain("[redacted]");
    expect(snippet).not.toContain("secret");
  });

  it("strips query strings from page paths", () => {
    expect(pagePathFromUrl("https://example.com/account?token=secret")).toBe(
      "/account",
    );
  });

  it("handles markdown injection in escape helper", () => {
    const escaped = escapeMarkdownInline("# Fake heading\n[click](javascript:alert(1))");
    expect(escaped).toContain("\\#");
  });

  it("lists additional pages when over cap", () => {
    const pages = Array.from({ length: 20 }, (_, i) => `https://example.com/p${i}`);
    const ticket = buildDeveloperTicket(
      baseInput({
        rootCause: {
          label: "Pattern",
          confidence: "low",
          likelySharedComponent: false,
          affectedPages: pages,
          totalOccurrences: 100,
          representativeSelectors: ["a", "b", "c", "d", "e", "f"],
          representativeEvidence: [],
        },
      }),
    );
    expect(ticket.scope.affectedPageCount).toBe(20);
    expect(ticket.scope.affectedPagePaths.length).toBe(10);
    expect(ticket.scope.additionalPageCount).toBe(10);
  });

  it("preserves unicode in plain text output", () => {
    const ticket = buildDeveloperTicket(
      baseInput({
        findingFallback: {
          title: "समस्या",
          description: "Emoji test 🎉",
          occurrenceCount: 1,
          evidence: [],
        },
      }),
    );
    const plain = formatDeveloperTicketPlainText(ticket);
    expect(plain).toContain("🎉");
  });

  it("sanitizes download filename", () => {
    expect(sanitizeDeveloperTicketFilename("button-name", "md")).toBe(
      "accessibility-button-name-ticket.md",
    );
    expect(sanitizeDeveloperTicketFilename("weird/rule!", "txt")).toMatch(
      /\.txt$/,
    );
  });

  it("formats non-empty markdown sections", () => {
    const ticket = buildDeveloperTicket(baseInput());
    const md = formatDeveloperTicketMarkdown(ticket);
    expect(md).toContain("## Summary");
    expect(md).toContain("## Acceptance criteria");
    expect(md).toContain("- [ ]");
  });
});
