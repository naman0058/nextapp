import type { AIRemediationReport } from "@/lib/ai/remediation/types";

function section(title: string, lines: string[]): string {
  if (lines.length === 0) return "";
  return `## ${title}\n${lines.map((l) => `- ${l}`).join("\n")}\n\n`;
}

export function formatAiRemediationMarkdown(report: AIRemediationReport): string {
  const parts: string[] = [
    `# ${report.title}`,
    "",
    `**AI-Assisted Remediation** — review before implementation. Not a compliance certification.`,
    "",
    `### Problem Summary\n${report.problemSummary}\n`,
    `### Why It Matters\n${report.whyItMatters}\n`,
    section("Recommended Approach", report.recommendedApproach),
  ];

  if (report.suggestedCode?.code) {
    parts.push(
      `### Possible Implementation Pattern (${report.suggestedCode.language})\n\`\`\`\n${report.suggestedCode.code}\n\`\`\`\n${report.suggestedCode.explanation}\n`,
    );
  }
  if (report.suggestedContent) {
    parts.push(`### Suggested Content\n${report.suggestedContent}\n`);
  }
  if (report.alternatives.length > 0) {
    parts.push("### Alternatives\n");
    for (const alt of report.alternatives) {
      parts.push(`- **${alt.label}:** ${alt.explanation}`);
      if (alt.content) parts.push(`  ${alt.content}`);
    }
    parts.push("");
  }

  parts.push(
    section("Mistakes to Avoid", report.mistakesToAvoid),
    section("Acceptance Criteria", report.acceptanceCriteria),
    section("Verification Steps", report.verificationSteps),
    section("Human Review", report.humanReview),
    section("Assumptions", report.assumptions),
    section("Limitations", report.limitations),
  );

  return parts.join("\n").trim();
}
