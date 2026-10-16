import { FAQ_ITEMS } from "@/constants";

export function FAQ() {
  return (
    <dl className="space-y-4">
      {FAQ_ITEMS.map((item) => (
        <div
          key={item.question}
          className="rounded-xl border border-border bg-card p-5"
        >
          <dt className="text-base font-semibold text-foreground">
            {item.question}
          </dt>
          <dd className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
            {item.answer}
          </dd>
        </div>
      ))}
    </dl>
  );
}
