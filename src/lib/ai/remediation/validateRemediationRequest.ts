import { AiRemediationError } from "@/lib/ai/remediation/errors";
import { sanitizeRemediationFacts } from "@/lib/ai/remediation/sanitizeRemediationFacts";
import type {
  CodeFramework,
  RemediationApiRequestBody,
  RemediationFacts,
  RemediationSource,
} from "@/lib/ai/remediation/types";

const SOURCES: RemediationSource[] = [
  "website",
  "social",
  "image",
  "contrast",
  "video",
  "batch",
];

const FRAMEWORKS: CodeFramework[] = [
  "generic_html",
  "react",
  "vue",
  "angular",
  "unknown",
];

const ALLOWED_KEYS = new Set([
  "source",
  "facts",
  "sessionId",
  "scanId",
  "frameworkPreference",
  "deterministicGuidance",
]);

export function validateRemediationRequest(body: unknown): RemediationApiRequestBody {
  if (!body || typeof body !== "object") {
    throw new AiRemediationError("AI_REMEDIATION_FAILED", "Invalid request body.");
  }
  const o = body as Record<string, unknown>;

  for (const key of Object.keys(o)) {
    if (!ALLOWED_KEYS.has(key)) {
      throw new AiRemediationError(
        "AI_REMEDIATION_FAILED",
        "Request contains disallowed fields.",
      );
    }
  }

  if (typeof o.source !== "string" || !SOURCES.includes(o.source as RemediationSource)) {
    throw new AiRemediationError("AI_REMEDIATION_FAILED", "Invalid remediation source.");
  }

  if (!o.facts || typeof o.facts !== "object" || Array.isArray(o.facts)) {
    throw new AiRemediationError("AI_REMEDIATION_FAILED", "Missing remediation facts.");
  }

  let sessionId: string | undefined;
  if (o.sessionId !== undefined) {
    if (typeof o.sessionId !== "string" || o.sessionId.length > 128) {
      throw new AiRemediationError("AI_REMEDIATION_FAILED", "Invalid sessionId.");
    }
    sessionId = o.sessionId;
  }

  let scanId: string | undefined;
  if (o.scanId !== undefined) {
    if (typeof o.scanId !== "string" || o.scanId.length > 128) {
      throw new AiRemediationError("AI_REMEDIATION_FAILED", "Invalid scanId.");
    }
    scanId = o.scanId;
  }

  let frameworkPreference: CodeFramework | undefined;
  if (o.frameworkPreference !== undefined) {
    if (
      typeof o.frameworkPreference !== "string" ||
      !FRAMEWORKS.includes(o.frameworkPreference as CodeFramework)
    ) {
      throw new AiRemediationError("AI_REMEDIATION_FAILED", "Invalid framework preference.");
    }
    frameworkPreference = o.frameworkPreference as CodeFramework;
  }

  let deterministicGuidance: string[] | undefined;
  if (o.deterministicGuidance !== undefined) {
    if (!Array.isArray(o.deterministicGuidance)) {
      throw new AiRemediationError("AI_REMEDIATION_FAILED", "Invalid deterministicGuidance.");
    }
    deterministicGuidance = o.deterministicGuidance
      .filter((g): g is string => typeof g === "string")
      .slice(0, 20)
      .map((g) => g.slice(0, 2_000));
  }

  const facts = sanitizeRemediationFacts(o.facts as RemediationFacts);

  return {
    source: o.source as RemediationSource,
    sessionId,
    scanId,
    facts,
    deterministicGuidance,
    frameworkPreference,
  };
}
