import type { PreflightStatus } from "@/types";
import { cn } from "@/lib/utils";

const LABELS: Record<PreflightStatus, string> = {
  pass: "Passed",
  review: "Needs review",
  fail: "Needs attention",
  not_checked: "Not checked",
};

const STYLES: Record<PreflightStatus, string> = {
  pass: "border-teal-200/80 bg-teal-50 text-teal-950",
  review: "border-amber-200/80 bg-amber-50 text-amber-950",
  fail: "border-rose-200/80 bg-rose-50 text-rose-950",
  not_checked: "border-border bg-slate-50 text-muted",
};

const DOT: Record<PreflightStatus, string> = {
  pass: "bg-teal-500",
  review: "bg-amber-500",
  fail: "bg-rose-500",
  not_checked: "bg-slate-300",
};

type StatusLabelProps = {
  status: PreflightStatus;
  className?: string;
};

export function StatusLabel({ status, className }: StatusLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        STYLES[status],
        className,
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT[status])}
        aria-hidden="true"
      />
      {LABELS[status]}
    </span>
  );
}
