import type {
  EmojiSequenceSummary,
  NoiseFinding,
} from "@/features/accessibility/types/screenReaderPreview";
import { resultPanelClass } from "@/components/results/resultStyles";
import { cn } from "@/lib/utils";

type NoiseSummaryProps = {
  findings: NoiseFinding[];
  emojiSequences: EmojiSequenceSummary[];
};

export function NoiseSummary({ findings, emojiSequences }: NoiseSummaryProps) {
  return (
    <div className="space-y-4">
      {emojiSequences.length > 0 ? (
        <div className={resultPanelClass}>
          <h4 className="font-display text-sm font-bold text-foreground">
            Emoji repetition (approximate)
          </h4>
          <p className="mt-1 text-xs text-muted">Not exact spoken output on every device.</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {emojiSequences.map((s) => (
              <li
                key={`${s.glyph}-${s.count}`}
                className="list-none rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-950"
              >
                {s.glyph} × {s.count}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {findings.length === 0 ? (
        <div className={cn(resultPanelClass, "text-sm text-muted")}>
          No significant noise patterns detected in this preview.
        </div>
      ) : (
        <ul className="space-y-3">
          {findings.map((f) => (
            <li key={f.id} className="list-none">
              <article className={cn(resultPanelClass, "border-l-4 border-l-amber-400")}>
                <h4 className="font-display text-sm font-bold text-foreground">{f.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.detail}</p>
                {f.recommendation ? (
                  <p className="mt-3 rounded-xl bg-muted-bg px-3 py-2 text-xs text-foreground">
                    {f.recommendation}
                  </p>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
