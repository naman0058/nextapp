type AnswerSummaryProps = {
  summary: string;
};

export function AnswerSummary({ summary }: AnswerSummaryProps) {
  return (
    <section
      aria-labelledby="answer-summary-heading"
      className="rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6"
    >
      <h2 id="answer-summary-heading" className="text-lg font-semibold">
        Quick answer
      </h2>
      <p className="mt-2 text-base leading-relaxed text-muted-foreground">{summary}</p>
    </section>
  );
}
