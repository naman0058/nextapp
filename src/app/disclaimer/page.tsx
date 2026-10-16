import { PageHeader } from "@/components/shared/PageHeader";
import { LegalProse } from "@/components/shared/LegalProse";
import { InteriorMarketingLayout } from "@/components/marketing/InteriorMarketingLayout";
import { siteConfig } from "@/config/site";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";

export const metadata = metadataForStaticRoute("/disclaimer");

export default function DisclaimerPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Disclaimer"
        description="Important limitations of automated accessibility assistance."
      />
      <InteriorMarketingLayout>
        <LegalProse>
          <p>
            {siteConfig.name} provides automated accessibility assistance and
            informational results to help you improve content before publishing.
          </p>
          <h2>Informational results only</h2>
          <p>
            Preflight output is provided for guidance and education. Automated
            checks do not constitute legal advice and should not be treated as a
            substitute for qualified legal or accessibility expertise.
          </p>
          <h2>No certification</h2>
          <p>
            Results are not certification of compliance with the ADA, Section 508,
            WCAG, or any other law, regulation, or technical standard. Passing an
            automated check does not guarantee that content meets all applicable
            requirements.
          </p>
          <h2>Human review</h2>
          <p>
            Some accessibility criteria require manual review, user testing, or
            contextual judgment that software alone cannot fully evaluate.
          </p>
          <h2>Screen Reader Experience Preview</h2>
          <p>
            Screen Reader Experience Preview is an approximation for accessibility
            review. Actual output varies across assistive technologies, browsers,
            operating systems, social platforms, and user settings. It is not an
            emulator of a specific screen reader.
          </p>
          <h2>AI-generated suggestions</h2>
          <p>
            AI image and alt-text suggestions may contain errors, omissions, or
            misinterpretations. They require human review before publishing and
            are not legal advice, certification, or proof of ADA, WCAG, or
            Section 508 compliance.
          </p>
          <h2>Preflight reports</h2>
          <p>
            Exported Accessibility Preflight Reports summarize automated,
            measured, AI-assisted, and human-review guidance already shown in
            the tools. They are not legal advice, certification, or proof of
            compliance. PDF exports are readable client documents, not certified
            PDF/UA files.
          </p>
          <h2>Website accessibility scanner</h2>
          <p>
            Website scans visit public URLs you submit and run automated rules on
            the loaded page state. They do not access login-protected content,
            evaluate every WCAG requirement, or certify compliance. Site crawls
            review a limited number of same-origin pages, not necessarily your
            entire website. Use scans only on sites you are authorized to test.
          </p>
          <h2>Video captions and transcripts</h2>
          <p>
            Automatically generated captions, transcripts, and visual descriptions
            can contain errors and require human review. They are not a guarantee
            of accessible or legally compliant video.
          </p>
        </LegalProse>
      </InteriorMarketingLayout>
    </>
  );
}
