import { PlatformAccessibilityCheckerPage } from "@/features/accessibility/components/platform/PlatformAccessibilityCheckerPage";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";

export const metadata = metadataForStaticRoute("/linkedin-accessibility-checker");

export default function LinkedInAccessibilityCheckerRoute() {
  return <PlatformAccessibilityCheckerPage platform="linkedin" />;
}
