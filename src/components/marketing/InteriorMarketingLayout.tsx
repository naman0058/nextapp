import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

const RESOURCE_LINKS = [
  { href: "/methodology", label: "Methodology" },
  { href: "/privacy", label: "Privacy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/contact", label: "Contact" },
] as const;

type InteriorMarketingLayoutProps = {
  children: ReactNode;
};

export function InteriorMarketingLayout({ children }: InteriorMarketingLayoutProps) {
  return (
    <div className="border-t border-border bg-gradient-to-b from-muted-bg/60 to-background">
      <Container className="py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[14rem_1fr] lg:gap-14">
          <aside className="hidden lg:block">
            <nav aria-label="Related pages" className="sticky top-24">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Resources
              </p>
              <ul className="mt-4 space-y-2">
                {RESOURCE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-muted hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          <div className="surface-soft rounded-3xl border border-border bg-card p-8 sm:p-10 lg:p-12">
            {children}
          </div>
        </div>
      </Container>
    </div>
  );
}
