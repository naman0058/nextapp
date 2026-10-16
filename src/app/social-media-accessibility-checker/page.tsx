import { Suspense } from "react";
import { AccessibilityChecker } from "@/features/accessibility/components/checker/AccessibilityChecker";
import { ToolPageExperience } from "@/components/tools/ToolPageExperience";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";

export const metadata = metadataForStaticRoute("/social-media-accessibility-checker");

export default function SocialMediaAccessibilityCheckerPage() {
  return (
    <ToolPageExperience toolId="social">
      <Suspense fallback={null}>
        <AccessibilityChecker />
      </Suspense>
    </ToolPageExperience>
  );
}
