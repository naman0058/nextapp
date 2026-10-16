import Link from "next/link";

export function SampleTrustSection() {
  return (
    <section id="sample-trust" aria-labelledby="sample-trust-heading" className="mt-12 space-y-4">
      <h2 id="sample-trust-heading" className="text-2xl font-semibold">
        Automated checks vs human review
      </h2>
      <p className="text-sm text-muted-foreground">
        This sample separates machine-detected issues from guided human-review items. Automated
        findings come from axe-core rules on rendered pages; human-review sections highlight checks
        that still need judgment, context, or content decisions.
      </p>
      <p className="text-sm text-muted-foreground">
        For how we describe limits, tooling, and review posture across the product, see our{" "}
        <Link href="/methodology" className="font-medium text-primary hover:underline">
          methodology
        </Link>{" "}
        page.
      </p>
    </section>
  );
}
