import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

type BlogArticleLayoutProps = {
  breadcrumbs: ReactNode;
  header: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function BlogArticleLayout({
  breadcrumbs,
  header,
  aside,
  children,
  footer,
}: BlogArticleLayoutProps) {
  return (
    <Container className="max-w-6xl py-10 sm:py-14">
      <div className="mb-6">{breadcrumbs}</div>
      <header className="max-w-3xl">{header}</header>
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-8">{children}</div>
        {aside ? <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">{aside}</aside> : null}
      </div>
      {footer ? <footer className="mt-14 border-t border-border pt-10">{footer}</footer> : null}
    </Container>
  );
}
