import type { PreflightReportSourceSnapshot } from "@/features/reports/types/reportSource";

export function hasMeaningfulChecks(
  source: PreflightReportSourceSnapshot,
): boolean {
  if (source.phase1 && source.phase1.checks.length > 0) return true;
  if (source.contrastSnapshot.measured) return true;
  if (source.visualSession?.measured) return true;
  if (source.aiStatus === "success" || source.aiStatus === "error") return true;
  if (source.screenReaderEngaged) return true;
  if (source.video && source.video.cues.length > 0) return true;
  return false;
}
