import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";

const STRIP_KEYS = new Set([
  "siteBatchId",
]);

export function sanitizeSampleSessionForExport(
  session: WebsiteScanSessionState,
): Record<string, unknown> {
  const clone = structuredClone(session) as Record<string, unknown>;
  for (const key of STRIP_KEYS) {
    delete clone[key];
  }
  clone.sampleExport = true;
  clone.disclaimer = "Fictional demonstration data — not a real audit.";
  return clone;
}

export function downloadSampleSessionJson(
  session: WebsiteScanSessionState,
  filename: string,
): void {
  const payload = sanitizeSampleSessionForExport(session);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
