import type { ReadingOrderItem } from "@/features/accessibility/types/screenReaderPreview";
import { resultPanelClass } from "@/components/results/resultStyles";
import { cn } from "@/lib/utils";

type ReadingOrderPreviewProps = {
  items: ReadingOrderItem[];
  contentOrderLabels: string[];
};

export function ReadingOrderPreview({
  items,
  contentOrderLabels,
}: ReadingOrderPreviewProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-muted">
        Preflight reading order — not the platform accessibility tree.
      </p>
      {contentOrderLabels.length > 0 ? (
        <ol className="flex flex-wrap gap-2 text-sm">
          {contentOrderLabels.map((label, index) => (
            <li
              key={label}
              className="list-none rounded-full border border-border bg-muted-bg/60 px-3 py-1 text-muted"
            >
              <span className="font-semibold text-foreground">{index + 1}.</span>{" "}
              {label}
            </li>
          ))}
        </ol>
      ) : null}
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={item.id} className="list-none">
            <article className={cn(resultPanelClass, "border-l-4 border-l-primary/40")}>
              <div className="flex items-start gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-sm font-bold text-primary"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-display text-sm font-bold text-foreground">
                    {item.label}
                  </h4>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {item.content}
                  </p>
                  {item.warnings?.map((w) => (
                    <p
                      key={w}
                      className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-950"
                    >
                      Review — {w}
                    </p>
                  ))}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
