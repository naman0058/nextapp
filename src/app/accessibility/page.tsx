import { PageHeader } from "@/components/shared/PageHeader";
import { LegalProse } from "@/components/shared/LegalProse";
import { InteriorMarketingLayout } from "@/components/marketing/InteriorMarketingLayout";
import { siteConfig } from "@/config/site";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";

export const metadata = metadataForStaticRoute("/accessibility");

export default function AccessibilityStatementPage() {
  return (
    <>
      <PageHeader
        eyebrow="Trust"
        title="Accessibility Statement"
        description="Our commitment to an accessible experience on this website."
      />
      <InteriorMarketingLayout>
        <LegalProse>
          <p>
            {siteConfig.name} is designed to support accessible digital
            content creation. We aim for this website to follow semantic HTML,
            keyboard accessibility, visible focus indicators, and readable
            contrast in its default light theme.
          </p>
          <h2>Conformance goal</h2>
          <p>
            We strive to align with widely recognized accessibility practices
            (including WCAG-oriented patterns) as features are implemented and
            tested. This statement will be updated as the product matures.
          </p>
          <h2>Feedback</h2>
          <p>
            If you encounter accessibility barriers on this site, contact us at{" "}
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="font-medium text-primary hover:underline"
            >
              {siteConfig.contact.email}
            </a>
            . Please include the page URL and a description of the issue.
          </p>
        </LegalProse>
      </InteriorMarketingLayout>
    </>
  );
}
