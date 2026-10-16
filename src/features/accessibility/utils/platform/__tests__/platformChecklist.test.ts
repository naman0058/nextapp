import { describe, expect, it } from "vitest";
import { getPlatformAccessibilityConfig } from "@/features/accessibility/config/platformAccessibility";
import { runPreflightAnalysis } from "@/features/accessibility/utils/runPreflightAnalysis";
import {
  buildPlatformChecklist,
  summarizePlatformReadiness,
} from "@/features/accessibility/utils/platform/buildPlatformChecklist";
import type { PlatformChecklistInput } from "@/features/accessibility/utils/platform/types";

function baseInput(
  overrides: Partial<PlatformChecklistInput>,
): PlatformChecklistInput {
  return {
    platform: "instagram",
    caption: "Hello world",
    altText: "A descriptive alt text.",
    hasImage: true,
    phase1: null,
    phase2: null,
    phase3: { measured: false },
    phase4: null,
    userPublishingConfirmations: {},
    ...overrides,
  };
}

describe("platform checklist", () => {
  it("Instagram alt ready, contrast not checked", () => {
    const phase1 = runPreflightAnalysis({
      platform: "instagram",
      caption: "Join us Friday #CommunityWorkshop",
      hasImage: true,
      altText: "People at a workshop table.",
    });
    const items = buildPlatformChecklist(
      baseInput({ platform: "instagram", phase1 }),
    );
    const alt = items.find((i) => i.id === "alt-text-prepared");
    const contrast = items.find((i) => i.id === "visual-contrast");
    expect(alt?.status).toBe("ready");
    expect(contrast?.status).toBe("not_checked");
  });

  it("X alt over 1000 characters", () => {
    const longAlt = "a".repeat(1100);
    const items = buildPlatformChecklist(
      baseInput({ platform: "x", altText: longAlt }),
    );
    const limit = items.find((i) => i.id === "x-alt-limit");
    expect(limit?.status).toBe("review");
    expect(limit?.detail).toContain("1,000");
  });

  it("text-only post marks image items N/A", () => {
    const items = buildPlatformChecklist(
      baseInput({ hasImage: false, altText: "" }),
    );
    expect(items.find((i) => i.id === "alt-text-prepared")?.status).toBe(
      "not_applicable",
    );
  });

  it("Facebook empty alt review", () => {
    const items = buildPlatformChecklist(
      baseInput({ platform: "facebook", altText: "" }),
    );
    expect(items.find((i) => i.id === "alt-text-prepared")?.status).toBe(
      "review",
    );
  });

  it("config metadata present", () => {
    const config = getPlatformAccessibilityConfig("x");
    expect(config?.sourceMetadata.lastReviewed).toBe("2026-10-08");
    expect(config?.imageDescriptionLimit).toBe(1000);
  });

  it("readiness summary", () => {
    const items = buildPlatformChecklist(
      baseInput({ platform: "x", altText: "Short alt." }),
    );
    const summary = summarizePlatformReadiness(items);
    expect(summary.totalApplicable).toBeGreaterThan(0);
    expect(summary.label.length).toBeGreaterThan(0);
  });
});
