import { createHash } from "node:crypto";
import {
  AI_REMEDIATION_PROMPT_VERSION,
  AI_REMEDIATION_SCHEMA_VERSION,
} from "@/lib/ai/remediation/constants";
import type { CodeFramework, GenerateRemediationInput } from "@/lib/ai/remediation/types";

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

export function fingerprintRemediationRequest(
  input: GenerateRemediationInput,
  framework: CodeFramework = "generic_html",
  model?: string,
): string {
  const material = [
    input.source,
    AI_REMEDIATION_PROMPT_VERSION,
    AI_REMEDIATION_SCHEMA_VERSION,
    framework,
    model ?? "",
    stableStringify(input.facts),
    stableStringify(input.deterministicGuidance ?? []),
  ].join("|");
  return createHash("sha256").update(material).digest("hex").slice(0, 32);
}
