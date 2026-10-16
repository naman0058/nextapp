import type { DeveloperTicketFormat } from "@/features/website-scanner/developerTicket/types";
import { sanitizeDeveloperTicketFilename } from "@/features/website-scanner/developerTicket/sanitizeDeveloperTicketFilename";

export function downloadDeveloperTicketFile(
  content: string,
  ruleId: string,
  format: DeveloperTicketFormat,
): void {
  const ext = format === "markdown" ? "md" : "txt";
  const mime =
    format === "markdown"
      ? "text/markdown;charset=utf-8"
      : "text/plain;charset=utf-8";
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = sanitizeDeveloperTicketFilename(ruleId, ext);
  a.click();
  URL.revokeObjectURL(url);
}
