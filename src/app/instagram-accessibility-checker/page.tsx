import { PlatformAccessibilityCheckerPage } from "@/features/accessibility/components/platform/PlatformAccessibilityCheckerPage";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";

export const metadata = metadataForStaticRoute("/instagram-accessibility-checker");

export default function InstagramAccessibilityCheckerRoute() {
  return <PlatformAccessibilityCheckerPage platform="instagram" />;
}
