import type { PlatformPublishingReadiness } from "@/features/accessibility/config/platformAccessibility/types";

type ReadyToPublishPanelProps = {
  summary: PlatformPublishingReadiness;
  platformName: string;
};

const STEPS = [
  "Resolve content issues flagged in preflight",
  "Copy your final caption from the workspace",
  "Copy alt text or image description",
  "Apply accessibility fields in the platform composer",
  "Review the post once more before going live",
] as const;

export function ReadyToPublishPanel({
  summary,
  platformName,
}: ReadyToPublishPanelProps) {
  return (
    <div className="rounded-3xl border border-border bg-gradient-to-br from-white to-teal-50/40 p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
        Final checklist
      </p>
      <h3 className="font-display mt-1 text-lg font-bold text-foreground">
        Ready to publish on {platformName}?
      </h3>
      <p className="mt-2 text-sm font-semibold text-foreground">{summary.label}</p>
      <ol className="mt-4 space-y-3">
        {STEPS.map((step, index) => (
          <li
            key={step}
            className="flex gap-3 rounded-xl border border-border/80 bg-white/90 px-3 py-2.5 text-sm text-muted"
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-xs font-bold text-primary"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <span className="pt-0.5 text-foreground">{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Controls and labels can vary by post type and app version—confirm in{" "}
        {platformName}&apos;s publishing UI before you ship.
      </p>
    </div>
  );
}
