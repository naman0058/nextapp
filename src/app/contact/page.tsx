import { InteriorMarketingLayout } from "@/components/marketing/InteriorMarketingLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { appInputClassName, appTextareaClassName } from "@/components/app/appStyles";
import { siteConfig } from "@/config/site";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";

export const metadata = metadataForStaticRoute("/contact");

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Contact"
        description="Product feedback, accessibility barriers on this site, and general inquiries."
      />
      <InteriorMarketingLayout>
        <div className="max-w-xl">
          <p className="text-base leading-relaxed text-muted">
            Email us at{" "}
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="font-semibold text-primary hover:underline"
            >
              {siteConfig.contact.email}
            </a>
            . Replace this address with your production contact before public launch.
          </p>

          <form
            className="mt-10 space-y-5"
            action={`mailto:${siteConfig.contact.email}`}
            method="GET"
          >
            <div>
              <label htmlFor="contact-name" className="text-sm font-semibold text-foreground">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                className={`mt-2 ${appInputClassName}`}
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="text-sm font-semibold text-foreground">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                className={`mt-2 ${appInputClassName}`}
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="text-sm font-semibold text-foreground">
                Message
              </label>
              <textarea
                id="contact-message"
                name="body"
                rows={5}
                className={`mt-2 ${appTextareaClassName}`}
              />
            </div>
            <p className="text-xs text-muted">
              Submitting opens your email client. No message is sent through a server in this
              release.
            </p>
            <button
              type="submit"
              className="inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              Open email draft
            </button>
          </form>
        </div>
      </InteriorMarketingLayout>
    </>
  );
}
