import { ContrastCheckerPage } from "@/features/accessibility/components/visual/ContrastCheckerPage";
import { ToolPageExperience } from "@/components/tools/ToolPageExperience";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";

export const metadata = metadataForStaticRoute("/image-contrast-checker");

export default function ImageContrastCheckerRoute() {
  return (
    <ToolPageExperience toolId="contrast">
      <ContrastCheckerPage />
    </ToolPageExperience>
  );
}
