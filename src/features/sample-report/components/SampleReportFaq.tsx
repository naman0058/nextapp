const FAQ = [
  {
    q: "Is this a real audit of a live website?",
    a: "No. The Northstar Community Library example uses fictional branding and synthetic findings on example.com paths. It demonstrates report structure and exports, not conformance of any real organization.",
  },
  {
    q: "Does the sample report prove WCAG compliance?",
    a: "No. Automated checks cover a subset of success criteria and cannot certify compliance. The sample shows transparency about automation limits and human-review signals.",
  },
  {
    q: "What file formats can I download?",
    a: "From this page you can generate sample PDF, Excel (.xlsx), CSV, JSON, and a fictional evidence ZIP — all in your browser from the same fixture dataset.",
  },
  {
    q: "Do I need an account?",
    a: "No account, OpenAI call, or scanner worker is required to explore the sample report or download exports.",
  },
] as const;

export function SampleReportFaq() {
  return (
    <section id="sample-faq" aria-labelledby="sample-faq-heading" className="mt-12 space-y-4">
      <h2 id="sample-faq-heading" className="text-2xl font-semibold">
        Frequently asked questions
      </h2>
      <dl className="space-y-4">
        {FAQ.map((item) => (
          <div key={item.q} className="rounded-lg border border-border p-4">
            <dt className="font-medium">{item.q}</dt>
            <dd className="mt-2 text-sm text-muted-foreground">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
