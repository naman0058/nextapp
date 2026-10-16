import { PlatformAccessibilityCheckerPage } from "@/features/accessibility/components/platform/PlatformAccessibilityCheckerPage";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";

export const metadata = metadataForStaticRoute("/facebook-accessibility-checker");

export default function FacebookAccessibilityCheckerRoute() {
  return <PlatformAccessibilityCheckerPage platform="facebook" />;
}
