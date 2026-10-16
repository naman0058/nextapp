import { ToolPageExperience } from "@/components/tools/ToolPageExperience";
import { VideoAccessibilityCheckerPage } from "@/features/video/components/VideoAccessibilityCheckerPage";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";
import { isVideoProcessingConfigured } from "@/lib/media-storage";

export const metadata = metadataForStaticRoute("/video-accessibility-checker");

export default function VideoAccessibilityCheckerRoute() {
  const storageConfigured = isVideoProcessingConfigured();
  return (
    <ToolPageExperience toolId="video">
      <VideoAccessibilityCheckerPage storageConfigured={storageConfigured} />
    </ToolPageExperience>
  );
}
