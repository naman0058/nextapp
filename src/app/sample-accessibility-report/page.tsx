import { Suspense } from "react";
import { buildSampleAccessibilityReportFixture } from "@/features/sample-report/buildSampleAccessibilityReportFixture";
import { SampleAccessibilityReportPage } from "@/features/sample-report/components/SampleAccessibilityReportPage";
import { buildBreadcrumbJsonLd } from "@/lib/blog/seo/buildBreadcrumbJsonLd";
import { getSiteUrl } from "@/lib/env";
import { getWebsiteScannerPublicCta } from "@/lib/scanner/getWebsiteScannerPublicCta";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";

export const metadata = metadataForStaticRoute("/sample-accessibility-report");

export default function SampleAccessibilityReportRoute() {
  const cta = getWebsiteScannerPublicCta();
  const fixture = buildSampleAccessibilityReportFixture();
  const base = getSiteUrl();
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Sample Accessibility Report", path: "/sample-accessibility-report" },
  ]);
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Sample Website Accessibility Report",
    description:
      "Explore a fictional accessibility preflight report with automated findings, root-cause grouping, human-review checks, remediation guidance, and sample PDF and Excel exports.",
    url: `${base}/sample-accessibility-report`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Suspense
        fallback={
          <p className="mx-auto max-w-6xl px-4 py-14 text-sm text-muted-foreground">
            Loading sample report…
          </p>
        }
      >
        <SampleAccessibilityReportPage cta={cta} fixture={fixture} />
      </Suspense>
    </>
  );
}
