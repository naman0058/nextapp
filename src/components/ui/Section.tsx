import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";

type SectionProps = {
  id?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  headingLevel?: 2 | 3;
  align?: "left" | "center";
};

export function Section({
  id,
  title,
  description,
  children,
  className,
  containerClassName,
  headingLevel = 2,
  align = "left",
}: SectionProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <section
      id={id}
      className={cn("py-16 sm:py-20 lg:py-24", className)}
      aria-labelledby={title && id ? `${id}-heading` : undefined}
    >
      <Container className={containerClassName}>
        {(title || description) && (
          <header
            className={cn(
              "mb-10 max-w-2xl",
              align === "center" && "mx-auto text-center",
            )}
          >
            {title && (
              <Heading
                id={id ? `${id}-heading` : undefined}
                className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              >
                {title}
              </Heading>
            )}
            {description && (
              <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
                {description}
              </p>
            )}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
