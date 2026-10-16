import type {
  ExperienceSummary,
  ListeningFatigueMetrics,
} from "@/features/accessibility/types/screenReaderPreview";
import { ResultMetricTile } from "@/components/results/ResultMetricTile";

type AssistiveExperienceSummaryProps = {
  summary: ExperienceSummary;
  metrics: ListeningFatigueMetrics;
};

export function AssistiveExperienceSummary({
  summary,
  metrics,
}: AssistiveExperienceSummaryProps) {
  const showFatigue =
    metrics.wordCount > 80 ||
    metrics.hashtagCount >= 8 ||
    metrics.emojiRepetitionGroups > 0;

  const flags = [
    { label: "Repeated emojis", yes: summary.repeatedEmojis },
    { label: "Fancy Unicode", yes: summary.fancyUnicode },
    { label: "Excess hashtags", yes: summary.excessHashtags },
    { label: "Duplicate caption/alt", yes: summary.duplicateCaptionAlt },
    { label: "Generic link language", yes: summary.genericLinkLanguage },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-lg shadow-indigo-950/5">
      <div className="border-b border-border bg-gradient-to-r from-indigo-50/80 to-white px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          Screen reader preview
        </p>
        <h3 className="font-display mt-1 text-lg font-bold text-foreground">
          Experience summary
        </h3>
        <p className="font-display mt-2 text-2xl font-bold text-foreground">
          {summary.label}
        </p>
      </div>
      <div className="space-y-4 p-5">
        <ul className="grid list-none gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <li>
            <ResultMetricTile
              label="Noise sources"
              value={summary.noiseSourceCount}
              tone={summary.noiseSourceCount > 0 ? "warning" : "success"}
            />
          </li>
          {flags.map((f) => (
            <li key={f.label}>
              <ResultMetricTile
                label={f.label}
                value={f.yes ? "Yes" : "No"}
                tone={f.yes ? "warning" : "muted"}
              />
            </li>
          ))}
        </ul>

        {showFatigue ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
            <p className="font-display text-sm font-bold text-amber-950">
              Potential listening fatigue
            </p>
            <ul className="mt-2 grid gap-1 text-sm text-amber-950/90 sm:grid-cols-2">
              <li>Words: {metrics.wordCount}</li>
              <li>Paragraphs: {metrics.paragraphCount}</li>
              <li>Hashtags: {metrics.hashtagCount}</li>
              <li>Longest sentence: {metrics.longestSentenceWords} words</li>
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
