import { FAQ_ITEMS } from "@/constants";

export function FaqAccordion() {
  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item) => (
        <details
          key={item.question}
          className="group surface-soft overflow-hidden rounded-2xl border border-border bg-white"
        >
          <summary className="cursor-pointer list-none px-6 py-5 font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-4">
              {item.question}
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted-bg text-lg font-normal text-primary transition-transform group-open:rotate-45"
                aria-hidden="true"
              >
                +
              </span>
            </span>
          </summary>
          <div className="border-t border-border px-6 pb-6 pt-2 text-sm leading-relaxed text-muted">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
