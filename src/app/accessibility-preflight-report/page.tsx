import Link from "next/link";
import { InteriorMarketingLayout } from "@/components/marketing/InteriorMarketingLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";

export const metadata = metadataForStaticRoute("/accessibility-preflight-report");

export default function AccessibilityPreflightReportInfoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Phase 7 export"
        title="Accessibility preflight report"
        description="Client-ready summaries from caption checks, contrast, AI-assisted review, screen reader preview, platform publishing, and video workflows."
      />
      <InteriorMarketingLayout>
        <div className="prose prose-neutral max-w-none dark:prose-invert">
          <p>
            {siteConfig.name} can assemble a deterministic{" "}
            <strong>Accessibility Preflight Report</strong> from work you
            already completed in the social or video checkers. Reports are
            generated entirely in your browser—no new AI calls on export and no
            server-side storage of your draft content.
          </p>
          <h2>Website scan sample report</h2>
          <p>
            For multi-page website preflight output (root causes, fix plan, WCAG matrix, and
            exports), explore the{" "}
            <Link href="/sample-accessibility-report">sample website accessibility report</Link>{" "}
            — a fictional demonstration that does not require running a live scan.
          </p>
          <h2>Where to generate a report</h2>
          <ul>
            <li>
              Social posts: open the{" "}
              <Link href="/social-media-accessibility-checker">
                Social Media Accessibility Checker
              </Link>{" "}
              (or a platform-specific checker), run checks, then scroll to{" "}
              <strong>Publish readiness</strong> →{" "}
              <strong>Accessibility preflight report</strong>.
            </li>
            <li>
              Video: use the{" "}
              <Link href="/video-accessibility-checker">
                Video Accessibility Checker
              </Link>{" "}
              after captions are prepared; the report panel appears at the bottom
              of the workflow.
            </li>
          </ul>
          <h2>Export formats</h2>
          <p>
            Preview HTML, print to PDF from your browser, download a structured
            JSON file, or copy a text executive summary. Optional PDF download
            uses readable text layout (not PDF/UA certification).
          </p>
          <h2>Privacy controls</h2>
          <p>
            Before export, choose whether to include caption text, alt text,
            thumbnails, AI-assisted findings, full transcripts, internal notes,
            and technical check identifiers.
          </p>
          <div className="not-prose mt-8 flex flex-wrap gap-3">
            <Button href="/social-media-accessibility-checker">
              Open social checker
            </Button>
            <Button href="/video-accessibility-checker" variant="secondary">
              Open video checker
            </Button>
          </div>
        </div>
      </InteriorMarketingLayout>
    </>
  );
}
