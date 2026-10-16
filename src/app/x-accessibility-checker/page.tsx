import { PlatformAccessibilityCheckerPage } from "@/features/accessibility/components/platform/PlatformAccessibilityCheckerPage";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";

export const metadata = metadataForStaticRoute("/x-accessibility-checker");

export default function XAccessibilityCheckerRoute() {
  return <PlatformAccessibilityCheckerPage platform="x" />;
}
