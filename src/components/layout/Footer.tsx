import Link from "next/link";
import { Suspense } from "react";
import { BrandLogo } from "@/components/marketing/BrandLogo";
import { CurrentYear } from "@/components/shared/CurrentYear";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function Footer() {
  const socialEntries = Object.entries(siteConfig.social).filter(
    ([, url]) => typeof url === "string" && url.length > 0,
  );

  return (
    <footer className="mt-auto border-t border-border bg-[#0b1020] text-indigo-100">
      <Container className="py-14">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
          <div>
            <BrandLogo variant="light" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-indigo-200/80">
              {siteConfig.description} Built for teams who publish on social
              platforms and want clearer, more inclusive content before it goes
              live.
            </p>
            <div className="mt-6">
              <Button
                href={siteConfig.nav.cta.href}
                variant="primary"
                className="bg-white text-indigo-950 hover:bg-indigo-50"
              >
                {siteConfig.nav.cta.label}
              </Button>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {siteConfig.footer.sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
                  {section.title}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {section.links.map((link) => (
                    <li key={`${section.title}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-sm text-indigo-200/80 hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {socialEntries.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-4 border-t border-white/10 pt-8">
            {socialEntries.map(([name, url]) => (
              <li key={name}>
                <a
                  href={url}
                  className="text-sm text-indigo-200/80 hover:text-white"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-8 text-sm text-indigo-300/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            ©{" "}
            <Suspense fallback={null}>
              <CurrentYear />
            </Suspense>{" "}
            {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-xs">
            Automated guidance is not legal advice or certification.
          </p>
        </div>
      </Container>
    </footer>
  );
}
