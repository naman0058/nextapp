/**
 * @vitest-environment node
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

const runRemediationRequest = vi.fn();

vi.mock("@/lib/ai/remediation/runRemediationRequest", () => ({
  runRemediationRequest: (...args: unknown[]) => runRemediationRequest(...args),
}));

vi.mock("@/lib/ai/remediation/client/fetchAiRemediation", () => ({
  fetchAiRemediation: vi.fn(() => {
    throw new Error("OpenAI must not be called during export");
  }),
}));

import { POST } from "@/app/api/accessibility/ai-remediation/route";
import { validateRemediationRequest } from "@/lib/ai/remediation/validateRemediationRequest";
import { AiRemediationError } from "@/lib/ai/remediation/errors";
import { buildEvidencePackageZip } from "@/features/website-scanner/utils/export/buildEvidencePackage";
import { createInitialWebsiteSession } from "@/features/website-scanner/state/websiteScanReducer";
import { aiR4AllSourceCandidates } from "@/lib/ai/remediation/report/__tests__/aiR4ReportFixture";

function stubRemediationReady() {
  vi.stubEnv("OPENAI_API_KEY", "sk-test");
  vi.stubEnv("AI_REMEDIATION_ENABLED", "1");
  vi.stubEnv("OPENAI_REMEDIATION_MODEL", "gpt-4.1-mini");
}

describe("AI-R5 final launch audit", () => {
  beforeEach(() => {
    runRemediationRequest.mockReset();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("API route availability (kill switch / missing config)", () => {
    async function postMinimal() {
      return POST(
        new Request("http://localhost/api/accessibility/ai-remediation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "website",
            facts: { ruleId: "button-name" },
            sessionId: "sess-r5",
          }),
        }),
      );
    }

    it("returns 503 when AI_REMEDIATION_ENABLED is off", async () => {
      stubRemediationReady();
      vi.stubEnv("AI_REMEDIATION_ENABLED", "0");
      const res = await postMinimal();
      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.code).toBe("AI_REMEDIATION_UNAVAILABLE");
      expect(runRemediationRequest).not.toHaveBeenCalled();
    });

    it("returns 503 when client NEXT_PUBLIC flag is on but server AI is disabled", async () => {
      stubRemediationReady();
      vi.stubEnv("NEXT_PUBLIC_AI_REMEDIATION_ENABLED", "1");
      vi.stubEnv("AI_REMEDIATION_ENABLED", "0");
      const res = await postMinimal();
      expect(res.status).toBe(503);
      expect((await res.json()).code).toBe("AI_REMEDIATION_UNAVAILABLE");
      expect(runRemediationRequest).not.toHaveBeenCalled();
    });

    it("returns 503 when OPENAI_API_KEY is missing", async () => {
      stubRemediationReady();
      vi.stubEnv("OPENAI_API_KEY", "");
      const res = await postMinimal();
      expect(res.status).toBe(503);
      expect((await res.json()).code).toBe("AI_REMEDIATION_UNAVAILABLE");
      expect(runRemediationRequest).not.toHaveBeenCalled();
    });

    it("returns 503 when OPENAI_REMEDIATION_MODEL is missing", async () => {
      vi.stubEnv("OPENAI_API_KEY", "sk-test");
      vi.stubEnv("AI_REMEDIATION_ENABLED", "1");
      vi.stubEnv("OPENAI_REMEDIATION_MODEL", "");
      const res = await postMinimal();
      expect(res.status).toBe(503);
      expect((await res.json()).code).toBe("AI_REMEDIATION_UNAVAILABLE");
      expect(runRemediationRequest).not.toHaveBeenCalled();
    });

    it("calls runRemediationRequest when configured", async () => {
      stubRemediationReady();
      runRemediationRequest.mockResolvedValue({ report: { version: "1.0" } });
      const res = await postMinimal();
      expect(res.status).toBe(200);
      expect(runRemediationRequest).toHaveBeenCalledOnce();
    });
  });

  it("rejects client-supplied model override", () => {
    expect(() =>
      validateRemediationRequest({
        source: "website",
        facts: { ruleId: "x" },
        model: "gpt-4o",
      }),
    ).toThrow(AiRemediationError);
  });

  it(
    "evidence ZIP build does not call fetchAiRemediation",
    async () => {
      const { fetchAiRemediation } = await import(
        "@/lib/ai/remediation/client/fetchAiRemediation"
      );
      const base = createInitialWebsiteSession();
      const rem = aiR4AllSourceCandidates[0];
      const session = {
        ...base,
        sessionId: "gate-evidence-r5",
        rootUrl: "https://example.com",
        aiRemediationByGroup: {
          g1: {
            report: rem.remediation,
            facts: { ruleId: "button-name" },
            frameworkPreference: "generic_html" as const,
            stale: false,
            generatedAt: "2026-01-01",
          },
        },
        includeAiRemediationInReport: true,
        exportPreferences: {
          ...base.exportPreferences,
          includeAiRemediationInExports: true,
        },
        aiRemediationInclusionById: { "website-g1": true },
      };
      const blob = await buildEvidencePackageZip(session, []);
      expect(blob.size).toBeGreaterThan(100);
      expect(fetchAiRemediation).not.toHaveBeenCalled();
    },
    30_000,
  );
});
