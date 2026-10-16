import { PageHeader } from "@/components/shared/PageHeader";
import { LegalProse } from "@/components/shared/LegalProse";
import { InteriorMarketingLayout } from "@/components/marketing/InteriorMarketingLayout";
import { siteConfig } from "@/config/site";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";

export const metadata = metadataForStaticRoute("/terms");

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Use"
        description="Starter terms for using the platform. Consult qualified counsel before relying on this draft."
      />
      <InteriorMarketingLayout>
        <LegalProse>
          <p>
            By accessing {siteConfig.name}, you agree to these starter terms.
            The service provides accessibility preflight assistance and
            educational guidance—not legal certification.
          </p>
          <h2>Acceptable use</h2>
          <p>
            You agree not to misuse the service, attempt unauthorized access, or
            use automated means to disrupt platform availability.
          </p>
          <p>
            The website accessibility scanner may only be used on public pages
            you own, manage, or are authorized to evaluate. You must not use it
            for network probing, scanning private or internal addresses, or
            denial-of-service activity.
          </p>
          <h2>No professional advice</h2>
          <p>
            Output from automated checks is informational. It does not constitute
            legal, compliance, or accessibility consulting advice.
          </p>
          <h2>Changes</h2>
          <p>
            Features and terms may change as new phases are released. Material
            updates will be reflected on this page.
          </p>
        </LegalProse>
      </InteriorMarketingLayout>
    </>
  );
}
