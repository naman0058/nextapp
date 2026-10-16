import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AppFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AppField({
  label,
  htmlFor,
  hint,
  meta,
  children,
  className,
}: AppFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">
          {label}
        </label>
        {meta}
      </div>
      {hint && (
        <p id={htmlFor ? `${htmlFor}-hint` : undefined} className="text-xs leading-relaxed text-muted">
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}
