import { Card } from "@/components/ui/Card";

const FAQ = [
  {
    q: "Is this an actual screen reader?",
    a: "No. This is an approximate reading preview for accessibility review, not NVDA, JAWS, VoiceOver, TalkBack, or another assistive technology.",
  },
  {
    q: "Does every screen reader read content the same way?",
    a: "No. Output varies by platform, browser, operating system, assistive technology, and user settings.",
  },
  {
    q: "Why can emojis become noisy?",
    a: "Some assistive technologies may announce emoji individually or with extra detail, which can lengthen listening time.",
  },
  {
    q: "Should I remove all emojis?",
    a: "Not necessarily. Consider reducing excessive repetition while keeping meaningful expression.",
  },
  {
    q: "Why capitalize hashtags?",
    a: "Capitalizing word boundaries can improve readability. It is not a universal requirement.",
  },
  {
    q: "Does this guarantee accessibility?",
    a: "No. This tool supports preflight review and does not certify legal compliance.",
  },
] as const;

export function ScreenReaderPreviewFaq() {
  return (
    <Card className="p-4">
      <h2 className="text-base font-semibold text-foreground">FAQ</h2>
      <ul className="mt-4 space-y-3">
        {FAQ.map((item) => (
          <li key={item.q}>
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-foreground">
                {item.q}
              </summary>
              <p className="mt-2 text-muted">{item.a}</p>
            </details>
          </li>
        ))}
      </ul>
    </Card>
  );
}
