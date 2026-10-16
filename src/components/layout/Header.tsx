"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { BrandLogo } from "@/components/marketing/BrandLogo";
import { siteConfig } from "@/config/site";
import { MARKETING_TOOLS } from "@/config/marketing";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const menuId = useId();
  const toolsMenuId = useId();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-card/90 backdrop-blur-md">
      <Container>
        <div className="flex h-[4.25rem] items-center justify-between gap-4">
          <BrandLogo />

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Main navigation"
          >
            {siteConfig.nav.primary.map((item) => {
              if (item.label === "Tools") {
                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setToolsOpen(true)}
                    onMouseLeave={() => setToolsOpen(false)}
                  >
                    <button
                      type="button"
                      className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-muted-bg hover:text-foreground"
                      aria-expanded={toolsOpen}
                      aria-controls={toolsMenuId}
                      onClick={() => setToolsOpen((v) => !v)}
                    >
                      Tools
                    </button>
                    {toolsOpen && (
                      <div
                        id={toolsMenuId}
                        className="surface-card absolute left-0 top-full z-50 mt-1 w-[22rem] rounded-2xl border border-border bg-card p-3"
                      >
                        <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
                          Live checkers
                        </p>
                        <ul className="mt-1 max-h-[20rem] overflow-y-auto">
                          {MARKETING_TOOLS.filter((t) => t.badge === "live").map(
                            (tool) => (
                              <li key={tool.href}>
                                <Link
                                  href={tool.href}
                                  className="block rounded-xl px-3 py-2.5 hover:bg-muted-bg"
                                  onClick={() => setToolsOpen(false)}
                                >
                                  <span className="text-sm font-semibold text-foreground">
                                    {tool.name}
                                  </span>
                                  <span className="mt-0.5 block text-xs text-muted line-clamp-2">
                                    {tool.description}
                                  </span>
                                </Link>
                              </li>
                            ),
                          )}
                        </ul>
                        <Link
                          href="/tools"
                          className="mt-2 block rounded-xl px-3 py-2 text-center text-xs font-semibold text-primary hover:bg-muted-bg"
                        >
                          View all tools
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-muted-bg hover:text-foreground"
                >
                  {item.label}
                </Link>
              );
            })}
            <Button href={siteConfig.nav.cta.href} variant="primary" className="ml-2">
              {siteConfig.nav.cta.label}
            </Button>
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            <Button
              href={siteConfig.nav.cta.href}
              variant="primary"
              className="px-3 py-2 text-xs"
            >
              Preflight
            </Button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-border p-2.5 text-foreground hover:bg-muted-bg"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="sr-only">
                {menuOpen ? "Close menu" : "Open menu"}
              </span>
              <span aria-hidden="true" className="flex flex-col gap-1">
                <span
                  className={cn(
                    "block h-0.5 w-5 bg-foreground transition-transform",
                    menuOpen && "translate-y-1.5 rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "block h-0.5 w-5 bg-foreground",
                    menuOpen && "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "block h-0.5 w-5 bg-foreground transition-transform",
                    menuOpen && "-translate-y-1.5 -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id={menuId}
            className="border-t border-border pb-5 pt-3 lg:hidden"
            aria-label="Mobile navigation"
          >
            <ul className="flex flex-col gap-1">
              {siteConfig.nav.primary.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted-bg"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 border-t border-border pt-2">
                <p className="px-3 py-1 text-xs font-semibold uppercase text-muted">
                  Tools
                </p>
                {MARKETING_TOOLS.filter((t) => t.badge === "live")
                  .slice(0, 5)
                  .map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="block rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted-bg"
                      onClick={() => setMenuOpen(false)}
                    >
                      {tool.name}
                    </Link>
                  ))}
              </li>
            </ul>
          </nav>
        )}
      </Container>
    </header>
  );
}
