import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "src");

function readSrc(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("AI-R3 explicit action gate", () => {
  it("AIRemediationPanel only calls fetchAiRemediation inside generate handler", () => {
    const src = readSrc("lib/ai/remediation/components/AIRemediationPanel.tsx");
    expect(src).toContain("async function generate(");
    expect(src).toContain("fetchAiRemediation");
    expect(src).not.toMatch(/useEffect[\s\S]*fetchAiRemediation/);
  });

  const r3Sections = [
    "features/accessibility/components/checker/SocialAiRemediationSection.tsx",
    "features/accessibility/components/checker/ImageAiRemediationSection.tsx",
    "features/accessibility/components/visual/ContrastAiRemediationSection.tsx",
    "features/video/components/VideoCueAiRemediationSection.tsx",
    "features/website-scanner/components/results/WebsiteAiRemediationSection.tsx",
  ];

  it.each(r3Sections)("%s does not auto-fetch remediation on mount", (rel) => {
    const src = readSrc(rel);
    expect(src).not.toMatch(/useEffect[\s\S]*fetchAiRemediation/);
    expect(src).not.toContain("fetchAiRemediation(");
  });

  it("batch remediation queue uses fetchAiRemediation only in processOne", () => {
    const src = readSrc("features/batch/utils/ai/runBatchRemediationQueue.ts");
    expect(src).toContain("fetchAiRemediation");
    expect(src).not.toMatch(/useEffect/);
  });
});
