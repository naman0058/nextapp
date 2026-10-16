import { InteriorMarketingLayout } from "@/components/marketing/InteriorMarketingLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { LegalProse } from "@/components/shared/LegalProse";
import { siteConfig } from "@/config/site";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";
import Link from "next/link";

export const metadata = metadataForStaticRoute("/about");

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Company"
        title="About Content Preflight"
        description="Independent accessibility preflight for social and digital publishing teams."
      />
      <InteriorMarketingLayout>
        <LegalProse>
          <p className="text-lg text-foreground">
            {siteConfig.name} is a free accessibility preflight platform for social
            media and related digital content. It helps creators, social media
            managers, and organizations catch common barriers before
            publishing—using local automated checks, measured contrast, optional
            AI-assisted image review, and platform-specific guidance.
          </p>
          <p>
            This is an independent tool. It is not affiliated with Instagram,
            Facebook, LinkedIn, X, or any government accessibility program. It
            does not certify legal compliance.
          </p>
          <h2 id="v1-capabilities">What V1 includes</h2>
          <ul>
            <li>Local caption and alt-text heuristic checks</li>
            <li>Optional OpenAI image analysis (explicit user action only)</li>
            <li>Browser-based WCAG contrast measurement</li>
            <li>Screen Reader Experience Preview (approximation, not an emulator)</li>
            <li>Instagram, Facebook, LinkedIn, and X publishing checklists</li>
          </ul>
          <p>
            See our{" "}
            <Link href="/methodology" className="font-medium text-primary hover:underline">
              methodology
            </Link>{" "}
            for how each category of check works.
          </p>
          <h2 id="roadmap">Roadmap</h2>
          <p>
            Phase 6 adds a{" "}
            <Link href="/video-accessibility-checker" className="font-medium text-primary hover:underline">
              Video Accessibility Checker
            </Link>{" "}
            for prerecorded MP4/WebM caption preflight. The{" "}
            <Link
              href="/website-accessibility-scanner"
              className="font-medium text-primary hover:underline"
            >
              Website Accessibility Scanner
            </Link>{" "}
            adds public URL checks with Playwright and axe-core. Accounts remain
            future work.
          </p>
        </LegalProse>
      </InteriorMarketingLayout>
    </>
  );
}
