import type { AIImageAccessibilityAnalysis } from "@/features/accessibility/types/aiImageAnalysis";
import { Card } from "@/components/ui/Card";

type AiVisualObservationsProps = {
  analysis: AIImageAccessibilityAnalysis;
};

function isPosterLike(analysis: AIImageAccessibilityAnalysis): boolean {
  const textLen = analysis.visibleText.join(" ").length;
  const purpose = analysis.imagePurpose;
  return (
    textLen > 40 ||
    purpose === "informational" ||
    (purpose === "mixed" && textLen > 20)
  );
}

export function AiVisualObservations({ analysis }: AiVisualObservationsProps) {
  const posterLike = isPosterLike(analysis);
  const items: string[] = [];

  if (analysis.visibleText.length > 0) {
    items.push(
      `Visible text in image: ${analysis.visibleText.slice(0, 5).join("; ")}${analysis.visibleText.length > 5 ? "…" : ""}`,
    );
  }
  if (analysis.importantVisualDetails.length > 0) {
    items.push(
      `Important visuals: ${analysis.importantVisualDetails.slice(0, 3).join("; ")}`,
    );
  }
  if (analysis.imagePurpose !== "uncertain") {
    items.push(`Image purpose (AI): ${analysis.imagePurpose.replace("_", " ")}`);
  }
  if (analysis.humanReview.required && analysis.humanReview.reasons.length > 0) {
    items.push(
      `Human review suggested: ${analysis.humanReview.reasons.slice(0, 2).join("; ")}`,
    );
  }

  if (items.length === 0) return null;

  return (
    <Card className="space-y-2 p-4">
      <h4 className="text-sm font-semibold text-foreground">
        AI observations — not measured contrast
      </h4>
      <p className="text-xs text-muted">
        Use the color sampler and calculator below to measure WCAG contrast.
        AI does not provide numeric contrast ratios.
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {posterLike ? (
        <p className="text-xs text-foreground">
          Tip: For posters or flyers, pick foreground text color and sample
          several background areas behind the text.
        </p>
      ) : null}
    </Card>
  );
}
