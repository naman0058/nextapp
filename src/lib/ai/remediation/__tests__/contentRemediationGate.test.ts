import { describe, expect, it } from "vitest";
import { buildRemediationUserPayload } from "@/lib/ai/remediation/buildRemediationUserPayload";
import { sanitizeRemediationFacts } from "@/lib/ai/remediation/sanitizeRemediationFacts";
import { AiRemediationError } from "@/lib/ai/remediation/errors";

describe("content remediation gate", () => {
  it("includes source task in user payload", () => {
    const payload = buildRemediationUserPayload({
      source: "social",
      facts: { issueFingerprint: "x" },
      deterministicGuidance: [],
    });
    expect(payload).toContain("accessible caption revision");
    expect(payload).toContain("Remediation source: social");
  });

  it("rejects oversize finding lists in facts", () => {
    const hugeFindings = Array.from({ length: 500 }, (_, i) => ({
      id: `check-${i}`,
      summary: "x".repeat(500),
    }));
    expect(() =>
      sanitizeRemediationFacts({
        deterministicFindings: hugeFindings,
        filler: "y".repeat(20_000),
      }),
    ).toThrow(AiRemediationError);
  });
});
