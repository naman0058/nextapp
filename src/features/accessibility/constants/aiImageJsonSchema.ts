export const AI_IMAGE_ANALYSIS_SCHEMA_NAME = "image_accessibility_analysis";

export const aiImageAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "imagePurpose",
    "suggestedAltText",
    "altTextRationale",
    "visibleText",
    "importantVisualDetails",
    "captionCoverage",
    "userAltTextReview",
    "humanReview",
    "limitations",
  ],
  properties: {
    imagePurpose: {
      type: "string",
      enum: ["informational", "decorative", "mixed", "uncertain"],
    },
    suggestedAltText: { type: "string" },
    altTextRationale: { type: "string" },
    visibleText: {
      type: "array",
      items: { type: "string" },
    },
    importantVisualDetails: {
      type: "array",
      items: { type: "string" },
    },
    captionCoverage: {
      type: "object",
      additionalProperties: false,
      required: ["status", "missingInformation"],
      properties: {
        status: {
          type: "string",
          enum: ["covered", "partially_covered", "not_covered", "uncertain"],
        },
        missingInformation: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
    userAltTextReview: {
      type: "object",
      additionalProperties: false,
      required: ["provided", "status", "issues", "improvedAltText"],
      properties: {
        provided: { type: "boolean" },
        status: {
          type: "string",
          enum: [
            "good",
            "needs_improvement",
            "possibly_inaccurate",
            "not_provided",
            "uncertain",
          ],
        },
        issues: {
          type: "array",
          items: { type: "string" },
        },
        improvedAltText: {
          type: ["string", "null"],
        },
      },
    },
    humanReview: {
      type: "object",
      additionalProperties: false,
      required: ["required", "reasons"],
      properties: {
        required: { type: "boolean" },
        reasons: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
    limitations: {
      type: "array",
      items: { type: "string" },
    },
  },
} as const;
