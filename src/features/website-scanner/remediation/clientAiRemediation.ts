/**
 * Client-safe AI remediation availability (no secrets).
 * Mirrors server gate: AI_REMEDIATION_ENABLED + remediation model configured.
 */
export function isClientAiRemediationAvailable(): boolean {
  const flag = process.env.NEXT_PUBLIC_AI_REMEDIATION_ENABLED?.trim();
  if (flag === "0" || flag === "false") return false;
  if (flag === "1" || flag === "true") return true;
  return false;
}
