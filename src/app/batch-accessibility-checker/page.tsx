import { Suspense } from "react";
import { BatchSessionProvider } from "@/features/batch/context/BatchSessionProvider";
import { BatchAccessibilityCheckerPage } from "@/features/batch/components/BatchAccessibilityCheckerPage";
import { ToolPageExperience } from "@/components/tools/ToolPageExperience";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";

export const metadata = metadataForStaticRoute("/batch-accessibility-checker");

export default function BatchAccessibilityCheckerRoute() {
  return (
    <ToolPageExperience toolId="batch">
      <Suspense fallback={null}>
        <BatchSessionProvider>
          <BatchAccessibilityCheckerPage />
        </BatchSessionProvider>
      </Suspense>
    </ToolPageExperience>
  );
}
