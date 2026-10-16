import { cn } from "@/lib/utils";

type ScoreCardProps = {
  score: number;
  bandLabel: string;
};

export function ScoreCard({ score, bandLabel }: ScoreCardProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const ringColor =
    clamped >= 75 ? "text-teal-500" : clamped >= 50 ? "text-amber-500" : "text-rose-500";

  return (
    <div className="rounded-2xl border border-border/60 bg-white/80 p-2 sm:p-4">
      <div className="flex flex-wrap items-center gap-6">
        <div
          className={cn(
            "relative flex h-28 w-28 items-center justify-center rounded-full bg-muted-bg",
            ringColor,
          )}
          role="img"
          aria-label={`Accessibility readiness score ${score} out of 100. ${bandLabel}`}
        >
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
            <path
              className="text-border"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${clamped}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="font-display text-3xl font-bold tabular-nums text-foreground">
            {score}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">
            Accessibility readiness
          </p>
          <p className="font-display mt-1 text-2xl font-bold text-foreground">{bandLabel}</p>
          <p className="mt-2 text-sm text-muted">
            Local heuristic score only—not legal certification or platform approval.
          </p>
        </div>
      </div>
    </div>
  );
}
