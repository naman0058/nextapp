import { describe, expect, it, vi } from "vitest";
import { buildDeveloperTicket } from "@/features/website-scanner/developerTicket/buildDeveloperTicket";
import { sanitizeTicketHtmlSnippet } from "@/features/website-scanner/developerTicket/sanitizeDeveloperTicketContent";
import { buildEvidenceAwareNotes } from "@/features/website-scanner/remediation/evidenceAwareNotes";
import {
  getDeterministicRemediation,
  hasFullDeterministicRemediation,
  listSupportedDeterministicRuleIds,
} from "@/features/website-scanner/remediation/registry";
import { remediationActionsForRule } from "@/features/website-scanner/remediation/remediationActionRouter";
import { resolveDisplayFixStatus } from "@/features/website-scanner/utils/fixWorkflowStatus";
import { isClientAiRemediationAvailable } from "@/features/website-scanner/remediation/clientAiRemediation";
import type { RootCauseGroup } from "@/features/accessibility-intelligence/types/siteIntelligence";

const MATRIX = [
  "color-contrast",
  "image-alt",
  "link-name",
  "button-name",
  "label",
  "bypass",
  "landmark-one-main",
  "html-has-lang",
  "document-title",
  "aria-allowed-attr",
  "aria-prohibited-attr",
  "heading-order",
  "list",
  "duplicate-id",
] as const;

describe("deterministic remediation registry", () => {
  for (const ruleId of MATRIX) {
    it(`${ruleId}: lookup, WCAG, steps, verification`, () => {
      const def = getDeterministicRemediation(ruleId);
      expect(def, `${ruleId} missing`).toBeDefined();
      expect(def!.ruleId).toBe(ruleId);
      expect(def!.remediationSteps.length).toBeGreaterThan(0);
      expect(def!.verificationSteps.length).toBeGreaterThan(0);
      expect(def!.developerAcceptanceCriteria.length).toBeGreaterThan(0);
      expect(hasFullDeterministicRemediation(ruleId)).toBe(true);
    });
  }

  it("lists supported rule ids", () => {
    expect(listSupportedDeterministicRuleIds().length).toBeGreaterThanOrEqual(
      MATRIX.length,
    );
  });

  it("routes contrast to contrast checker", () => {
    const actions = remediationActionsForRule({ ruleId: "color-contrast" });
    expect(actions.some((a) => a.href?.includes("contrast"))).toBe(true);
  });

  it("developer ticket uses registry acceptance criteria", () => {
    const ticket = buildDeveloperTicket({
      ruleId: "button-name",
      axeHelp: "Buttons must have discernible text",
      impact: "critical",
      priority: "high",
      sourceType: "axe",
      wcagCriteria: ["4.1.2"],
      scanContext: { viewportLabel: "Desktop" },
    });
    expect(ticket.acceptanceCriteria.length).toBeGreaterThan(0);
    expect(ticket.recommendedFix[0]).toMatch(/Deterministic guidance/);
  });

  it("evidence-aware button-name note for icon button snippet", () => {
    const def = getDeterministicRemediation("button-name")!;
    const notes = buildEvidenceAwareNotes(def, [
      '<button><svg aria-hidden="true"></svg></button>',
    ]);
    expect(notes.some((n) => n.includes("accessible name"))).toBe(true);
  });

  it("A: supported rule has deterministic steps", () => {
    expect(getDeterministicRemediation("label")!.remediationSteps.length).toBeGreaterThan(2);
  });

  it("B: unsupported rule returns undefined", () => {
    expect(getDeterministicRemediation("totally-unknown-rule-xyz")).toBeUndefined();
  });

  it("G: marked implemented does not auto-verify", () => {
    const status = resolveDisplayFixStatus({
      taskKey: "t1",
      userStatus: "user_marked_fixed",
      ruleId: "button-name",
      previousSnapshot: null,
      currentPages: [],
    });
    expect(status).toBe("User Marked Fixed");
  });

  it("H: rescan copy when rule gone", () => {
    const group: RootCauseGroup = {
      id: "g1",
      ruleId: "button-name",
      confidence: "high",
      groupType: "isolated",
      label: "Buttons",
      affectedPages: ["https://a/"],
      totalOccurrences: 0,
      retainedEvidenceCount: 0,
      representativeSelectors: [],
      representativeEvidence: [],
      likelySharedComponent: false,
      remediationReach: { pages: 1, occurrences: 0 },
    };
    const status = resolveDisplayFixStatus({
      taskKey: "t1",
      userStatus: "not_started",
      ruleId: "button-name",
      previousSnapshot: [
        {
          finalUrl: "https://a/",
          violations: [
            {
              id: "button-name",
              impact: "critical",
              help: "h",
              description: "d",
              tags: [],
              wcagCriteria: [],
              level: "A",
              totalNodeCount: 2,
              nodes: [],
              isBestPractice: false,
            },
          ],
        } as unknown as import("@/features/website-scanner/types/scanTypes").WebsitePageScanResult,
      ],
      currentPages: [
        {
          finalUrl: "https://a/",
          violations: [],
        } as unknown as import("@/features/website-scanner/types/scanTypes").WebsitePageScanResult,
      ],
      rootCauseGroup: group,
    });
    expect(status).toBe("No longer detected in this automated rescan");
  });

  it("J: sanitized evidence in ticket path", () => {
    const s = sanitizeTicketHtmlSnippet('<input type="password" value="x">');
    expect(s).toContain("[redacted]");
  });

  it("E/F: AI client flag defaults off in test env", () => {
    expect(isClientAiRemediationAvailable()).toBe(false);
  });

  it("C: 81 total occurrences still has color-contrast deterministic guidance", () => {
    expect(getDeterministicRemediation("color-contrast")!.remediationSteps.length).toBeGreaterThan(3);
  });
});

describe("deterministic vs AI boundary", () => {
  it("F: deterministic content independent of AI flag", () => {
    vi.stubEnv("NEXT_PUBLIC_AI_REMEDIATION_ENABLED", "0");
    expect(getDeterministicRemediation("image-alt")!.requiresHumanJudgment).toBe(true);
  });
});
