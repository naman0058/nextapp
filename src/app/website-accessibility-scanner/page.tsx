import Link from "next/link";
import { Suspense } from "react";
import { WebsiteAccessibilityScannerPage } from "@/features/website-scanner/components/WebsiteAccessibilityScannerPage";
import { WebsiteScanProvider } from "@/features/website-scanner/context/WebsiteScanProvider";
import { ToolPageExperience } from "@/components/tools/ToolPageExperience";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";

export const metadata = metadataForStaticRoute("/website-accessibility-scanner");

export default function WebsiteAccessibilityScannerRoute() {
  return (
    <ToolPageExperience
      toolId="website"
      afterWorkspace={
        <p className="text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/sample-accessibility-report" className="font-medium text-primary hover:underline">
            View a sample accessibility report
          </Link>{" "}
          with fictional data before you scan your own site.
        </p>
      }
    >
      <WebsiteScanProvider>
        <Suspense
          fallback={
            <p className="text-sm text-muted">Loading website scanner…</p>
          }
        >
          <WebsiteAccessibilityScannerPage />
        </Suspense>
      </WebsiteScanProvider>
    </ToolPageExperience>
  );
}
