import type { ReactNode } from "react";

type AppEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function AppEmptyState({ title, description, action }: AppEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted-bg/50 px-6 py-12 text-center">
      <p className="font-display text-lg font-bold text-foreground">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
