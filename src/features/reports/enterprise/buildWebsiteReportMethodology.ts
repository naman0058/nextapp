import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import { METHODOLOGY_VERSION } from "@/features/reports/constants/reportVersion";

export function buildWebsiteReportMethodology(
  session: WebsiteScanSessionState,
): { version: string; sections: { title: string; bullets: string[] }[] } {
  const sections: { title: string; bullets: string[] }[] = [
    {
      title: "Automated website testing",
      bullets: [
        "axe-core via Playwright Chromium on selected same-origin pages",
        "Loaded DOM state only; interactive states may require separate manual testing",
      ],
    },
    {
      title: "Deterministic remediation",
      bullets: [
        "Versioned DigitalAccessReady rule knowledge with implementation and verification steps",
      ],
    },
    {
      title: "Human review",
      bullets: [
        "Structured procedures requiring human judgment; results are scoped and non-certifying",
      ],
    },
    {
      title: "Rescan comparison",
      bullets: [
        "Optional automated rescan compares issue fingerprints; disappearance does not imply manual retest is complete",
      ],
    },
    {
      title: "Session data",
      bullets: [
        "Scan results and workspace contributions are held in the current browser session unless you export them",
      ],
    },
  ];

  const contributions = session.accessibilityWorkspace?.contributions ?? [];
  const tools = new Set(contributions.map((c) => c.toolId));
  const measured: string[] = [];
  if (tools.has("contrast_checker")) measured.push("Contrast Checker measurements");
  if (tools.has("image_alt_checker")) measured.push("Image / Alt review");
  if (tools.has("screen_reader_preview")) measured.push("Screen Reader Preview observations");
  if (tools.has("video_accessibility")) measured.push("Video accessibility review");
  if (tools.has("visual_issue_locator")) measured.push("Visual Issue Locator evidence");
  if (tools.has("developer_ticket")) measured.push("Developer ticket handoffs");
  if (measured.length) {
    sections.splice(2, 0, {
      title: "Measured & specialized tools",
      bullets: measured,
    });
  }

  if (session.includeAiRemediationInReport) {
    sections.push({
      title: "AI-assisted remediation (optional)",
      bullets: [
        "Generated only when requested; included in exports when explicitly selected",
        "Review before implementation — not merged with deterministic guidance",
      ],
    });
  }

  return { version: METHODOLOGY_VERSION, sections };
}
