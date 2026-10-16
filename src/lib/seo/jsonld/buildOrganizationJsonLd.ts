import { getSiteSeoConfig } from "@/lib/seo/site-config";

export function buildOrganizationJsonLd(): Record<string, unknown> {
  const seo = getSiteSeoConfig();
  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: seo.organizationName,
    url: seo.siteUrl,
    logo: seo.logoUrl,
  };
  if (seo.contactEmail) {
    org.email = seo.contactEmail;
  }
  if (seo.sameAs.length > 0) {
    org.sameAs = seo.sameAs;
  }
  return org;
}
