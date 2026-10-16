const stringArray = {
  type: "array",
  items: { type: "string" },
} as const;

export const aiRemediationJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "version",
    "source",
    "title",
    "problemSummary",
    "whyItMatters",
    "recommendedApproach",
    "alternatives",
    "mistakesToAvoid",
    "acceptanceCriteria",
    "verificationSteps",
    "humanReview",
    "assumptions",
    "limitations",
  ],
  properties: {
    version: { type: "string" },
    source: {
      type: "string",
      enum: ["website", "social", "image", "contrast", "video", "batch"],
    },
    title: { type: "string" },
    problemSummary: { type: "string" },
    whyItMatters: { type: "string" },
    recommendedApproach: stringArray,
    suggestedCode: {
      type: ["object", "null"],
      additionalProperties: false,
      required: ["language", "code", "explanation"],
      properties: {
        language: { type: "string" },
        code: { type: "string" },
        explanation: { type: "string" },
      },
    },
    suggestedContent: { type: ["string", "null"] },
    alternatives: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "explanation"],
        properties: {
          label: { type: "string" },
          explanation: { type: "string" },
          code: { type: ["string", "null"] },
          content: { type: ["string", "null"] },
        },
      },
    },
    mistakesToAvoid: stringArray,
    acceptanceCriteria: stringArray,
    verificationSteps: stringArray,
    humanReview: stringArray,
    assumptions: stringArray,
    limitations: stringArray,
    confidenceNote: { type: ["string", "null"] },
  },
} as const;
