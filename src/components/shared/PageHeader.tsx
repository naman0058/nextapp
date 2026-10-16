import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type PageHeaderAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  variant?: "default" | "marketing";
  actions?: PageHeaderAction[];
};

export function PageHeader({
  title,
  description,
  eyebrow,
  variant = "marketing",
  actions,
}: PageHeaderProps) {
  if (variant === "default") {
    return (
      <div className="border-b border-border bg-card py-12">
        <Container>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-3xl text-lg text-muted">{description}</p>
          )}
        </Container>
      </div>
    );
  }

  return (
    <div className="marketing-gradient relative overflow-hidden border-b border-white/10">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgb(99 102 241 / 0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgb(20 184 166 / 0.25), transparent 40%)",
        }}
      />
      <Container className="relative py-14 sm:py-16">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-200">
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "font-display max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl",
            eyebrow && "mt-3",
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-indigo-100/90">
            {description}
          </p>
        )}
        {actions && actions.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {actions.map((action) => (
              <Button
                key={action.href}
                href={action.href}
                variant={action.variant ?? "primary"}
                className={
                  action.variant === "secondary"
                    ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
                    : "bg-white text-indigo-950 hover:bg-indigo-50"
                }
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
