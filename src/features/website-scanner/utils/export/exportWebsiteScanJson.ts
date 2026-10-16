import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";

export function exportWebsiteScanJson(session: WebsiteScanSessionState): void {
  const blob = new Blob([JSON.stringify(session, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `website-accessibility-scan-${session.sessionId.slice(0, 8)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
