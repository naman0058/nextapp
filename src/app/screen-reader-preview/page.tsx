import { ScreenReaderPreviewPage } from "@/features/accessibility/components/screenReader/ScreenReaderPreviewPage";
import { ToolPageExperience } from "@/components/tools/ToolPageExperience";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";

export const metadata = metadataForStaticRoute("/screen-reader-preview");

export default function ScreenReaderPreviewRoute() {
  return (
    <ToolPageExperience toolId="screen-reader">
      <ScreenReaderPreviewPage />
    </ToolPageExperience>
  );
}
