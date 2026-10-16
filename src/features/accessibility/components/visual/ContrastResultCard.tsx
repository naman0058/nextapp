import type { ContrastEvaluation } from "@/features/accessibility/types/visualAccessibility";
import { StatusLabel } from "@/features/accessibility/components/checker/StatusLabel";
import type { PreflightStatus } from "@/types";
import { cn } from "@/lib/utils";

function verdictToStatus(verdict: "pass" | "fail" | "review"): PreflightStatus {
  if (verdict === "pass") return "pass";
  if (verdict === "fail") return "fail";
  return "review";
}

type ContrastResultCardProps = {
  evaluation: ContrastEvaluation | null;
};

export function ContrastResultCard({ evaluation }: ContrastResultCardProps) {
  if (!evaluation) {
    return (
      <div className="flex min-h-[12rem] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted-bg/40 px-6 py-8 text-center">
        <p className="font-display text-sm font-bold text-foreground">Contrast results</p>
        <p className="mt-2 text-sm text-muted">
          Pick foreground and background colors—or sample from an image—to measure WCAG
          contrast here.
        </p>
      </div>
    );
  }

  const status = verdictToStatus(evaluation.primaryVerdict);
  const ringClass =
    status === "pass"
      ? "from-teal-500/20 to-white border-teal-200"
      : status === "fail"
        ? "from-rose-500/20 to-white border-rose-200"
        : "from-amber-500/20 to-white border-amber-200";

  const criteria = [
    { label: "AA normal", value: evaluation.aaNormal },
    { label: "AA large", value: evaluation.aaLarge },
    { label: "AAA normal", value: evaluation.aaaNormal },
    { label: "AAA large", value: evaluation.aaaLarge },
  ] as const;

  return (
    <div
      className={cn(
        "rounded-3xl border bg-gradient-to-br p-5 shadow-md shadow-slate-950/5",
        ringClass,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            Contrast ratio
          </p>
          <p className="font-display mt-1 text-4xl font-bold tabular-nums text-foreground">
            {evaluation.displayRatio}
          </p>
        </div>
        <StatusLabel status={status} />
      </div>
      <p className="mt-4 text-base font-semibold text-foreground">
        {evaluation.primaryLabel}
      </p>
      <p className="mt-1 text-sm text-muted">
        Required for selected type (AA): {evaluation.requiredRatio}:1
      </p>
      <dl className="mt-5 grid gap-2 sm:grid-cols-2">
        {criteria.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-xl border border-border/80 bg-white/80 px-3 py-2 text-sm"
          >
            <dt className="text-muted">{row.label}</dt>
            <dd className="font-semibold capitalize text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
