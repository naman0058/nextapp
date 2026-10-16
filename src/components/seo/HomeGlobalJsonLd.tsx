import { buildOrganizationJsonLd } from "@/lib/seo/jsonld/buildOrganizationJsonLd";
import { buildWebSiteJsonLd } from "@/lib/seo/jsonld/buildWebSiteJsonLd";

export function HomeGlobalJsonLd() {
  const webSite = buildWebSiteJsonLd();
  const organization = buildOrganizationJsonLd();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSite) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
    </>
  );
}
