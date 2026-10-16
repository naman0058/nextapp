import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AppPanelProps = {
  id?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerAside?: ReactNode;
  variant?: "default" | "elevated" | "inset";
};

export function AppPanel({
  id,
  title,
  description,
  children,
  className,
  headerAside,
  variant = "elevated",
}: AppPanelProps) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-2xl border border-border",
        variant === "elevated" && "surface-card bg-card",
        variant === "default" && "bg-card",
        variant === "inset" && "bg-muted-bg/80",
        className,
      )}
    >
      {(title || description || headerAside) && (
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div>
            {title && (
              <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
                {description}
              </p>
            )}
          </div>
          {headerAside}
        </header>
      )}
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}
