import { SAMPLE_REPORT_DISCLOSURE } from "@/features/sample-report/constants";

export function SampleDisclaimerBanner() {
  return (
    <div
      role="note"
      className="rounded-xl border-2 border-amber-500/50 bg-amber-50 p-4 text-sm dark:bg-amber-950/30"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-amber-900 dark:text-amber-200">
        Sample report
      </p>
      <p className="mt-2 text-amber-950 dark:text-amber-100">{SAMPLE_REPORT_DISCLOSURE}</p>
    </div>
  );
}
