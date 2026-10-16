"use client";

import type {
  HumanReviewAnswer,
  VisualChecklistState,
} from "@/features/accessibility/types/visualAccessibility";
import { cn } from "@/lib/utils";

type Item = {
  key: keyof VisualChecklistState;
  question: string;
  reviewWhen: HumanReviewAnswer[];
  guidance: string;
};

const ITEMS: Item[] = [
  {
    key: "colorOnlyMeaning",
    question: "Is important meaning conveyed by color alone?",
    reviewWhen: ["yes", "not_sure"],
    guidance:
      "Add text, icons, or patterns so meaning does not depend on color alone.",
  },
  {
    key: "textOverComplexBackground",
    question: "Is text placed over a busy photo, gradient, or texture?",
    reviewWhen: ["yes", "not_sure"],
    guidance:
      "Sample several background areas or add a solid overlay behind text.",
  },
  {
    key: "importantSmallText",
    question: "Is critical text small or thin in the image?",
    reviewWhen: ["yes", "not_sure"],
    guidance:
      "Small text needs higher contrast. Consider larger type or simpler backgrounds.",
  },
  {
    key: "textOnlyInGraphic",
    question: "Is essential text only inside the image (not in caption)?",
    reviewWhen: ["yes", "not_sure"],
    guidance:
      "Repeat key information in the caption or alt text where platforms allow.",
  },
  {
    key: "understandableWithoutColor",
    question: "Would the message still make sense in grayscale?",
    reviewWhen: ["no", "not_sure"],
    guidance:
      "Check contrast and non-color cues so the design works without hue differences.",
  },
];

type VisualReviewChecklistProps = {
  checklist: VisualChecklistState;
  onChange: (
    key: keyof VisualChecklistState,
    value: HumanReviewAnswer,
  ) => void;
};

const ANSWER_LABELS: Record<Exclude<HumanReviewAnswer, null>, string> = {
  yes: "Yes",
  no: "No",
  not_sure: "Not sure",
};

export function VisualReviewChecklist({
  checklist,
  onChange,
}: VisualReviewChecklistProps) {
  return (
    <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-primary">
        Human review
      </p>
      <h4 className="font-display mt-1 text-lg font-bold text-foreground">
        Visual design checklist
      </h4>
      <p className="mt-2 text-sm text-muted">
        Not automatic pass/fail—answer honestly before you publish.
      </p>
      <ul className="mt-5 space-y-4">
        {ITEMS.map((item) => {
          const answer = checklist[item.key];
          const needsReview =
            answer !== null && item.reviewWhen.includes(answer);
          return (
            <li
              key={item.key}
              className={cn(
                "list-none rounded-2xl border border-border p-4",
                needsReview && "border-amber-200 bg-amber-50/50",
              )}
            >
              <p className="text-sm font-semibold text-foreground">{item.question}</p>
              <div
                className="mt-3 flex flex-wrap gap-2"
                role="radiogroup"
                aria-label={item.question}
              >
                {(["yes", "no", "not_sure"] as const).map((value) => {
                  const selected = answer === value;
                  return (
                    <label
                      key={value}
                      className={cn(
                        "cursor-pointer rounded-xl border px-3 py-2 text-sm font-medium transition",
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted-bg/50 text-muted hover:border-primary/30",
                      )}
                    >
                      <input
                        type="radio"
                        name={item.key}
                        className="sr-only"
                        checked={selected}
                        onChange={() => onChange(item.key, value)}
                      />
                      {ANSWER_LABELS[value]}
                    </label>
                  );
                })}
              </div>
              {needsReview ? (
                <p className="mt-3 rounded-xl bg-amber-100/80 px-3 py-2 text-xs font-medium text-amber-950">
                  Review suggested — {item.guidance}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
