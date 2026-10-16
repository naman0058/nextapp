"use client";

import { cn } from "@/lib/utils";

export type ToolStep = {
  id: string;
  label: string;
  shortLabel?: string;
};

type ToolStepNavProps = {
  steps: ToolStep[];
  activeStepId?: string;
};

export function ToolStepNav({ steps, activeStepId }: ToolStepNavProps) {
  return (
    <nav
      aria-label="Workflow steps"
      className="surface-soft -mx-1 overflow-x-auto rounded-2xl border border-border bg-card px-2 py-2"
    >
      <ol className="flex min-w-max gap-1 sm:gap-2">
        {steps.map((step, index) => {
          const active = step.id === activeStepId;
          return (
            <li key={step.id} className="list-none">
              <a
                href={`#${step.id}`}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors sm:px-4",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted hover:bg-muted-bg hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    active ? "bg-white/20" : "bg-muted-bg text-foreground",
                  )}
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.shortLabel ?? step.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
