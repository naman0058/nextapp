import { Button } from "@/components/ui/Button";

type ResultsEmptyStateProps = {
  onRunPreflight: () => void;
};

export function ResultsEmptyState({ onRunPreflight }: ResultsEmptyStateProps) {
  return (
    <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-3xl border border-dashed border-indigo-200 bg-gradient-to-b from-indigo-50/80 to-white px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">
        ◎
      </div>
      <p className="font-display mt-5 text-xl font-bold text-foreground">
        Your results will appear here
      </p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
        Run local preflight to generate your readiness score, summary counts, and
        finding-by-finding guidance. Optional AI review appears after you analyze an
        image.
      </p>
      <Button type="button" variant="primary" className="mt-6 px-6" onClick={onRunPreflight}>
        Run local preflight
      </Button>
    </div>
  );
}
