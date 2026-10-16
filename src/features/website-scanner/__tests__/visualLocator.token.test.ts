import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { signVisualLocatorToken } from "@/features/website-scanner/server/visualLocator/signVisualLocatorToken";
import { verifyVisualLocatorToken } from "@/features/website-scanner/server/visualLocator/verifyVisualLocatorToken";
import type { VisualLocatorPayload } from "@/features/website-scanner/types/visualLocator";
import { isNodeVisuallyLocatable } from "@/features/website-scanner/utils/visualLocator/isFindingVisuallyLocatable";

const SECRET = "test-visual-locator-secret-32chars";

function samplePayload(overrides: Partial<VisualLocatorPayload> = {}): VisualLocatorPayload {
  const now = Date.now();
  return {
    version: 1,
    url: "https://example.com/page",
    viewport: { id: "desktop", width: 1440, height: 900, label: "Desktop 1440 × 900" },
    ruleId: "button-name",
    issueFingerprint: "fp1",
    target: ["button"],
    selectorLabel: "button",
    occurrenceIndex: 0,
    occurrenceTotal: 1,
    ruleTitle: "Buttons must have discernible text",
    issuedAt: now,
    expiresAt: now + 60_000,
    ...overrides,
  };
}

describe("visual locator token", () => {
  afterEach(() => {
    delete process.env.VISUAL_LOCATOR_SIGNING_SECRET;
  });

  it("signs and verifies a valid token", () => {
    process.env.VISUAL_LOCATOR_SIGNING_SECRET = SECRET;
    const token = signVisualLocatorToken(samplePayload());
    const result = verifyVisualLocatorToken(token);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.ruleId).toBe("button-name");
    }
  });

  it("rejects tampered signature", () => {
    process.env.VISUAL_LOCATOR_SIGNING_SECRET = SECRET;
    const token = signVisualLocatorToken(samplePayload());
    const [body] = token.split(".");
    const bad = `${body}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`;
    const result = verifyVisualLocatorToken(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("bad_signature");
  });

  it("rejects expired tokens", () => {
    process.env.VISUAL_LOCATOR_SIGNING_SECRET = SECRET;
    const token = signVisualLocatorToken(
      samplePayload({ expiresAt: Date.now() - 1000 }),
    );
    const result = verifyVisualLocatorToken(token);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("expired");
  });
});

describe("isNodeVisuallyLocatable", () => {
  it("blocks document-level rules", () => {
    expect(
      isNodeVisuallyLocatable({
        ruleId: "html-has-lang",
        target: ["html"],
        selectorLabel: "html",
      }),
    ).toBe(false);
  });

  it("allows element targets", () => {
    expect(
      isNodeVisuallyLocatable({
        ruleId: "button-name",
        target: ["#submit"],
        selectorLabel: "#submit",
      }),
    ).toBe(true);
  });
});
