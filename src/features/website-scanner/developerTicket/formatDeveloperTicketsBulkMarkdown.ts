import type { DeveloperTicket } from "@/features/website-scanner/developerTicket/types";
import { formatDeveloperTicketMarkdown } from "@/features/website-scanner/developerTicket/formatDeveloperTicketMarkdown";

export function formatDeveloperTicketsBulkMarkdown(tickets: DeveloperTicket[]): string {
  if (tickets.length === 0) {
    return "# Accessibility developer tickets\n\nNo actionable root-cause tickets in this scan.\n";
  }
  const lines: string[] = [
    "# Accessibility developer tickets",
    "",
    `Generated from scan session (${tickets.length} ticket(s)).`,
    "",
    "## Table of contents",
    "",
  ];
  tickets.forEach((t, i) => {
    lines.push(`${i + 1}. ${t.title}`);
  });
  lines.push("");
  tickets.forEach((t, i) => {
    lines.push("---");
    lines.push("");
    lines.push(`<!-- Ticket ${i + 1} -->`);
    lines.push("");
    lines.push(formatDeveloperTicketMarkdown(t));
  });
  return lines.join("\n");
}
