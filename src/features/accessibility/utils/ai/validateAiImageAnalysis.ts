import type { AIImageAccessibilityAnalysis } from "@/features/accessibility/types/aiImageAnalysis";

const IMAGE_PURPOSES = new Set([
  "informational",
  "decorative",
  "mixed",
  "uncertain",
]);

const COVERAGE_STATUSES = new Set([
  "covered",
  "partially_covered",
  "not_covered",
  "uncertain",
]);

const ALT_REVIEW_STATUSES = new Set([
  "good",
  "needs_improvement",
  "possibly_inaccurate",
  "not_provided",
  "uncertain",
]);

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export type ValidateResult =
  | { ok: true; data: AIImageAccessibilityAnalysis }
  | { ok: false; errors: string[] };

export function validateAiImageAnalysis(payload: unknown): ValidateResult {
  const errors: string[] = [];

  if (!payload || typeof payload !== "object") {
    return { ok: false, errors: ["Response is not an object."] };
  }

  const data = payload as Record<string, unknown>;

  if (
    typeof data.imagePurpose !== "string" ||
    !IMAGE_PURPOSES.has(data.imagePurpose)
  ) {
    errors.push("Invalid imagePurpose.");
  }

  if (typeof data.suggestedAltText !== "string") {
    errors.push("Invalid suggestedAltText.");
  }

  if (typeof data.altTextRationale !== "string") {
    errors.push("Invalid altTextRationale.");
  }

  if (!isStringArray(data.visibleText)) {
    errors.push("Invalid visibleText.");
  }

  if (!isStringArray(data.importantVisualDetails)) {
    errors.push("Invalid importantVisualDetails.");
  }

  if (!data.captionCoverage || typeof data.captionCoverage !== "object") {
    errors.push("Invalid captionCoverage.");
  } else {
    const cc = data.captionCoverage as Record<string, unknown>;
    if (
      typeof cc.status !== "string" ||
      !COVERAGE_STATUSES.has(cc.status)
    ) {
      errors.push("Invalid captionCoverage.status.");
    }
    if (!isStringArray(cc.missingInformation)) {
      errors.push("Invalid captionCoverage.missingInformation.");
    }
  }

  if (!data.userAltTextReview || typeof data.userAltTextReview !== "object") {
    errors.push("Invalid userAltTextReview.");
  } else {
    const review = data.userAltTextReview as Record<string, unknown>;
    if (typeof review.provided !== "boolean") {
      errors.push("Invalid userAltTextReview.provided.");
    }
    if (
      typeof review.status !== "string" ||
      !ALT_REVIEW_STATUSES.has(review.status)
    ) {
      errors.push("Invalid userAltTextReview.status.");
    }
    if (!isStringArray(review.issues)) {
      errors.push("Invalid userAltTextReview.issues.");
    }
    if (
      review.improvedAltText !== null &&
      typeof review.improvedAltText !== "string"
    ) {
      errors.push("Invalid userAltTextReview.improvedAltText.");
    }
  }

  if (!data.humanReview || typeof data.humanReview !== "object") {
    errors.push("Invalid humanReview.");
  } else {
    const hr = data.humanReview as Record<string, unknown>;
    if (typeof hr.required !== "boolean") {
      errors.push("Invalid humanReview.required.");
    }
    if (!isStringArray(hr.reasons)) {
      errors.push("Invalid humanReview.reasons.");
    }
  }

  if (!isStringArray(data.limitations)) {
    errors.push("Invalid limitations.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: data as unknown as AIImageAccessibilityAnalysis,
  };
}
