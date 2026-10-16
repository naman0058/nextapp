import {
  escapeMarkdownInline,
  fenceCodeBlock,
} from "@/features/website-scanner/developerTicket/sanitizeDeveloperTicketContent";
import type { DeveloperTicket } from "@/features/website-scanner/developerTicket/types";

function wcagLine(ticket: DeveloperTicket): string {
  if (ticket.standardClassification === "best_practice") {
    return "**Standard classification:** Best Practice (not a WCAG failure)";
  }
  if (ticket.standardClassification === "human_review") {
    return "**Status:** Human Review Required";
  }
  const crit = ticket.wcagCriteria.join(", ") || "See rule documentation";
  const level = ticket.wcagLevel ? ` — Level ${ticket.wcagLevel}` : "";
  return `**WCAG:** ${escapeMarkdownInline(crit)}${level}`;
}

export function formatDeveloperTicketMarkdown(ticket: DeveloperTicket): string {
  const lines: string[] = [];
  lines.push(`# ${escapeMarkdownInline(ticket.title)}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(escapeMarkdownInline(ticket.summary));
  lines.push("");
  lines.push("## Accessibility impact");
  lines.push("");
  lines.push(`**Automated impact:** ${ticket.impact}`);
  lines.push(`**Remediation priority:** ${ticket.priority}`);
  lines.push("");
  lines.push(escapeMarkdownInline(ticket.userImpact));
  lines.push("");
  lines.push("## Scope");
  lines.push("");
  lines.push(`- Pages affected: ${ticket.scope.affectedPageCount}`);
  lines.push(`- Elements affected: ${ticket.scope.affectedElementCount}`);
  if (ticket.rootCause?.likelySharedComponent) {
    lines.push("- Potential shared fix: Yes");
  }
  if (ticket.rootCause) {
    lines.push(`- Likely root cause: ${escapeMarkdownInline(ticket.rootCause.label)}`);
    if (ticket.rootCause.confidence) {
      lines.push(`- Confidence: ${ticket.rootCause.confidence}`);
    }
    if (ticket.rootCause.confidenceNote) {
      lines.push(`- ${escapeMarkdownInline(ticket.rootCause.confidenceNote)}`);
    }
  }
  if (ticket.scope.affectedPagePaths.length > 0) {
    lines.push("");
    lines.push("### Representative pages");
    lines.push("");
    for (const p of ticket.scope.affectedPagePaths) {
      lines.push(`- \`${escapeMarkdownInline(p)}\``);
    }
    if (ticket.scope.additionalPageCount > 0) {
      lines.push(
        `- + ${ticket.scope.additionalPageCount} additional affected page(s)`,
      );
    }
  }
  lines.push("");
  lines.push("## Technical evidence");
  lines.push("");
  if (ticket.ruleId) {
    lines.push(`**Rule:** \`${ticket.ruleId}\``);
  }
  lines.push("");
  lines.push(wcagLine(ticket));
  const hasSelectors = ticket.representativeEvidence.some((e) => e.selector);
  if (!hasSelectors && ticket.ruleId) {
    lines.push("");
    lines.push("_Document-level finding (no element selector)._");
  }
  if (hasSelectors) {
    lines.push("");
    lines.push("Representative selectors:");
    lines.push("");
    ticket.representativeEvidence.forEach((e, i) => {
      if (e.selector) {
        lines.push(`${i + 1}. \`${escapeMarkdownInline(e.selector)}\``);
      }
    });
  }
  const snippet = ticket.representativeEvidence.find((e) => e.htmlSnippet)?.htmlSnippet;
  if (snippet) {
    lines.push("");
    lines.push("Example:");
    lines.push("");
    lines.push(fenceCodeBlock(snippet));
  }
  lines.push("");
  lines.push("## Recommended fix");
  lines.push("");
  for (const line of ticket.recommendedFix) {
    if (line.startsWith("- ") || line.startsWith("Recommended") || line.startsWith("Avoid:")) {
      lines.push(line.startsWith("- ") ? line : escapeMarkdownInline(line));
    } else {
      lines.push(escapeMarkdownInline(line));
    }
  }
  if (ticket.possibleImplementationPattern) {
    lines.push("");
    lines.push("Possible implementation pattern:");
    lines.push("");
    lines.push(fenceCodeBlock(ticket.possibleImplementationPattern, "html"));
  }
  lines.push("");
  lines.push("## Acceptance criteria");
  lines.push("");
  for (const c of ticket.acceptanceCriteria) {
    lines.push(`- [ ] ${escapeMarkdownInline(c)}`);
  }
  lines.push("");
  lines.push("## Verification");
  lines.push("");
  ticket.verificationSteps.forEach((step, i) => {
    lines.push(`${i + 1}. ${escapeMarkdownInline(step)}`);
  });
  lines.push("");
  lines.push("## Standard reference");
  lines.push("");
  if (ticket.standardClassification === "best_practice") {
    lines.push("Axe best-practice rule (not mapped as WCAG failure).");
  } else if (ticket.wcagCriteria.length) {
    lines.push(
      `WCAG 2.2 — ${escapeMarkdownInline(ticket.wcagCriteria.join(", "))}${ticket.wcagLevel ? ` — Level ${ticket.wcagLevel}` : ""}`,
    );
  }
  if (ticket.ruleId) {
    lines.push(`Automated source: axe-core \`${ticket.ruleId}\``);
  }
  if (ticket.scanContext) {
    lines.push("");
    lines.push("## Scan context");
    lines.push("");
    if (ticket.scanContext.scannedOrigin) {
      lines.push(`- Origin: ${escapeMarkdownInline(ticket.scanContext.scannedOrigin)}`);
    }
    lines.push(`- Viewport: ${escapeMarkdownInline(ticket.scanContext.viewportLabel)}`);
    if (ticket.scanContext.scanCompletedAt) {
      lines.push(`- Scan completed: ${ticket.scanContext.scanCompletedAt}`);
    }
    if (ticket.scanContext.verificationStatus) {
      lines.push(`- Verification status: ${escapeMarkdownInline(ticket.scanContext.verificationStatus)}`);
    }
    if (ticket.scanContext.verificationOccurrenceDelta) {
      lines.push(`- Occurrence change: ${escapeMarkdownInline(ticket.scanContext.verificationOccurrenceDelta)}`);
    }
    if (ticket.scanContext.visualLocatorNote) {
      lines.push(`- ${escapeMarkdownInline(ticket.scanContext.visualLocatorNote)}`);
    }
  }
  if (ticket.aiAssistedGuidance) {
    lines.push("");
    lines.push("## AI-assisted additional guidance");
    lines.push("");
    lines.push(`_${escapeMarkdownInline(ticket.aiAssistedGuidance.disclaimer)}_`);
    lines.push("");
    lines.push(escapeMarkdownInline(ticket.aiAssistedGuidance.plainLanguageExplanation));
    if (ticket.aiAssistedGuidance.suggestedFixes.length) {
      lines.push("");
      for (const s of ticket.aiAssistedGuidance.suggestedFixes) {
        lines.push(`- ${escapeMarkdownInline(s)}`);
      }
    }
    if (ticket.aiAssistedGuidance.developerExample) {
      lines.push("");
      lines.push(fenceCodeBlock(ticket.aiAssistedGuidance.developerExample, "html"));
    }
  }
  lines.push("");
  lines.push("## Notes / limitations");
  lines.push("");
  for (const lim of ticket.limitations) {
    lines.push(`- ${escapeMarkdownInline(lim)}`);
  }
  lines.push("");
  return lines.join("\n");
}
