import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

type ToolPageLayoutProps = {
  children: ReactNode;
};

export function ToolPageLayout({ children }: ToolPageLayoutProps) {
  return (
    <div className="border-t border-border bg-gradient-to-b from-muted-bg/80 to-background">
      <Container className="max-w-6xl py-8 lg:py-12">{children}</Container>
    </div>
  );
}
