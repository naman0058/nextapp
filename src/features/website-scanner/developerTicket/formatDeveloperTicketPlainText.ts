import type { DeveloperTicket } from "@/features/website-scanner/developerTicket/types";
import { stripUnsafeControlCharacters } from "@/features/website-scanner/developerTicket/sanitizeDeveloperTicketContent";

function plain(text: string): string {
  return stripUnsafeControlCharacters(text);
}

export function formatDeveloperTicketPlainText(ticket: DeveloperTicket): string {
  const lines: string[] = [];
  lines.push(plain(ticket.title.toUpperCase()));
  lines.push("=".repeat(Math.min(60, ticket.title.length)));
  lines.push("");
  lines.push("SUMMARY");
  lines.push(plain(ticket.summary));
  lines.push("");
  lines.push("ACCESSIBILITY IMPACT");
  lines.push(`Automated impact: ${ticket.impact}`);
  lines.push(`Remediation priority: ${ticket.priority}`);
  lines.push(plain(ticket.userImpact));
  lines.push("");
  lines.push("SCOPE");
  lines.push(`Pages affected: ${ticket.scope.affectedPageCount}`);
  lines.push(`Elements affected: ${ticket.scope.affectedElementCount}`);
  if (ticket.rootCause) {
    lines.push(`Likely root cause: ${plain(ticket.rootCause.label)}`);
    if (ticket.rootCause.confidence) {
      lines.push(`Confidence: ${ticket.rootCause.confidence}`);
    }
  }
  if (ticket.scope.affectedPagePaths.length) {
    lines.push("Representative pages:");
    for (const p of ticket.scope.affectedPagePaths) {
      lines.push(`  - ${p}`);
    }
    if (ticket.scope.additionalPageCount > 0) {
      lines.push(`  + ${ticket.scope.additionalPageCount} additional page(s)`);
    }
  }
  lines.push("");
  lines.push("TECHNICAL EVIDENCE");
  if (ticket.ruleId) lines.push(`Rule: ${ticket.ruleId}`);
  if (ticket.standardClassification === "best_practice") {
    lines.push("Standard classification: Best Practice");
  } else if (ticket.standardClassification === "human_review") {
    lines.push("Status: Human Review Required");
  } else if (ticket.wcagCriteria.length) {
    lines.push(`WCAG: ${ticket.wcagCriteria.join(", ")}${ticket.wcagLevel ? ` Level ${ticket.wcagLevel}` : ""}`);
  }
  const withSel = ticket.representativeEvidence.filter((e) => e.selector);
  if (withSel.length) {
    lines.push("Representative selectors:");
    withSel.forEach((e, i) => lines.push(`  ${i + 1}. ${e.selector}`));
  }
  const snippet = ticket.representativeEvidence.find((e) => e.htmlSnippet)?.htmlSnippet;
  if (snippet) {
    lines.push("Example:");
    lines.push(snippet);
  }
  lines.push("");
  lines.push("RECOMMENDED FIX");
  for (const line of ticket.recommendedFix) {
    lines.push(plain(line));
  }
  if (ticket.possibleImplementationPattern) {
    lines.push("");
    lines.push("Possible implementation pattern:");
    lines.push(ticket.possibleImplementationPattern);
  }
  lines.push("");
  lines.push("ACCEPTANCE CRITERIA");
  for (const c of ticket.acceptanceCriteria) {
    lines.push(`[ ] ${plain(c)}`);
  }
  lines.push("");
  lines.push("VERIFICATION");
  ticket.verificationSteps.forEach((step, i) => {
    lines.push(`${i + 1}. ${plain(step)}`);
  });
  lines.push("");
  lines.push("NOTES");
  for (const lim of ticket.limitations) {
    lines.push(`- ${plain(lim)}`);
  }
  if (ticket.aiAssistedGuidance) {
    lines.push("");
    lines.push("AI-ASSISTED ADDITIONAL GUIDANCE");
    lines.push(plain(ticket.aiAssistedGuidance.disclaimer));
    lines.push(plain(ticket.aiAssistedGuidance.plainLanguageExplanation));
  }
  lines.push("");
  return lines.join("\n");
}
