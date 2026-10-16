import { describe, expect, it } from "vitest";
import { REPORT_VERSION } from "@/features/reports/constants/reportVersion";
import { DEFAULT_REPORT_SETTINGS } from "@/features/reports/types/reportSettings";
import type { PreflightReportSourceSnapshot } from "@/features/reports/types/reportSource";
import { applyReportSettings } from "@/features/reports/utils/applyReportSettings";
import { buildAccessibilityPreflightReport } from "@/features/reports/utils/buildReport";
import { computeSourceFingerprint } from "@/features/reports/utils/computeSourceFingerprint";
import { validatePreflightReport } from "@/features/reports/utils/validatePreflightReport";
import type { PreflightAnalysisResult } from "@/features/accessibility/types/preflight";

const emptySource: PreflightReportSourceSnapshot = {
  platform: "instagram",
  hasImage: false,
  workingCaption: "Hello world",
  altText: "",
  altTextSource: "none",
  phase1: null,
  aiAnalysis: null,
  aiStatus: "idle",
  contrastSnapshot: { measured: false },
  visualSession: null,
  screenReaderEngaged: false,
  screenReaderPreview: null,
  publishingConfirmations: {},
  video: null,
};

const minimalPhase1: PreflightAnalysisResult = {
  score: 80,
  scoreBandLabel: "Good",
  counts: { pass: 2, review: 0, fail: 0, not_checked: 0 },
  checks: [
    {
      id: "empty-caption",
      category: "caption",
      title: "Caption present",
      status: "pass",
      severity: "info",
      summary: "Caption is not empty.",
    },
  ],
};

describe("buildAccessibilityPreflightReport", () => {
  it("derives ready status when only passing phase1 checks", () => {
    const source = {
      ...emptySource,
      platform: null,
      phase1: minimalPhase1,
    };
    const report = buildAccessibilityPreflightReport(
      source,
      {},
      DEFAULT_REPORT_SETTINGS,
    );
    expect(report.summary.overallStatus).toBe("Ready for Final Review");
    expect(validatePreflightReport(report).ok).toBe(true);
  });

  it("marks incomplete when no meaningful checks", () => {
    const report = buildAccessibilityPreflightReport(
      emptySource,
      {},
      DEFAULT_REPORT_SETTINGS,
    );
    expect(report.summary.overallStatus).toBe("Incomplete Preflight");
    expect(report.imageAccessibility?.sectionStatus).toBe("Not Applicable");
    expect(report.screenReaderPreview?.sectionStatus).toBe("Not Checked");
  });

  it("detects stale fingerprint when caption changes", () => {
    const source = { ...emptySource, phase1: minimalPhase1 };
    const fp1 = computeSourceFingerprint(source);
    const fp2 = computeSourceFingerprint({
      ...source,
      workingCaption: "Changed",
    });
    expect(fp1).not.toBe(fp2);
  });

  it("strips caption when privacy toggle off", () => {
    const source = { ...emptySource, phase1: minimalPhase1 };
    const report = buildAccessibilityPreflightReport(
      source,
      {},
      DEFAULT_REPORT_SETTINGS,
    );
    const redacted = applyReportSettings(report, {
      ...DEFAULT_REPORT_SETTINGS,
      includeContentText: false,
    });
    expect(redacted.finalWorkingCaption).toBeUndefined();
  });

  it("maps AI idle to not checked in image section", () => {
    const source = {
      ...emptySource,
      hasImage: true,
      phase1: minimalPhase1,
      aiStatus: "idle" as const,
    };
    const report = buildAccessibilityPreflightReport(
      source,
      {},
      DEFAULT_REPORT_SETTINGS,
    );
    const aiFinding = report.imageAccessibility?.findings.find(
      (f) => f.id === "ai-not-run",
    );
    expect(aiFinding?.status).toBe("not_checked");
  });

  it("uses report version 1.1 and no AI appendix by default", () => {
    const report = buildAccessibilityPreflightReport(
      { ...emptySource, phase1: minimalPhase1 },
      {},
      DEFAULT_REPORT_SETTINGS,
    );
    expect(report.reportVersion).toBe(REPORT_VERSION);
    expect(report.reportVersion).toBe("1.1");
    expect(report.aiRemediationAppendix).toBeUndefined();
  });

  it("rejects malformed report in validate", () => {
    const bad = {
      reportId: "",
    } as unknown as ReturnType<typeof buildAccessibilityPreflightReport>;
    expect(validatePreflightReport(bad).ok).toBe(false);
  });
});
