import { AccessibilityChecker } from "@/features/accessibility/components/checker/AccessibilityChecker";
import { PlatformFaq } from "@/features/accessibility/components/platform/PlatformFaq";
import { getPlatformAccessibilityConfig } from "@/features/accessibility/config/platformAccessibility";
import type { Phase5Platform } from "@/features/accessibility/config/platformAccessibility";
import { ToolPageExperience } from "@/components/tools/ToolPageExperience";
import type { ToolPageId } from "@/config/toolPages";

const PLATFORM_TOOL_ID: Record<Phase5Platform, ToolPageId> = {
  instagram: "instagram",
  facebook: "facebook",
  linkedin: "linkedin",
  x: "x",
};

type PlatformAccessibilityCheckerPageProps = {
  platform: Phase5Platform;
};

export function PlatformAccessibilityCheckerPage({
  platform,
}: PlatformAccessibilityCheckerPageProps) {
  const config = getPlatformAccessibilityConfig(platform);
  if (!config) return null;

  return (
    <ToolPageExperience
      toolId={PLATFORM_TOOL_ID[platform]}
      afterWorkspace={<PlatformFaq config={config} />}
    >
      <AccessibilityChecker
        initialPlatform={platform}
        syncPlatformRoute
        showPlatformHeader={false}
      />
    </ToolPageExperience>
  );
}
