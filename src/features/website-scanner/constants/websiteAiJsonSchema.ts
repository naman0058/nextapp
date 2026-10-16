export const WEBSITE_AI_GUIDANCE_SCHEMA_NAME = "website_fix_guidance";

export const websiteAiGuidanceJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["guidance"],
  properties: {
    guidance: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "ruleId",
          "plainLanguageExplanation",
          "whyItMatters",
          "suggestedFixes",
          "verificationSteps",
          "humanReviewNeeded",
        ],
        properties: {
          ruleId: { type: "string" },
          plainLanguageExplanation: { type: "string" },
          whyItMatters: { type: "string" },
          suggestedFixes: {
            type: "array",
            items: { type: "string" },
          },
          developerExample: { type: ["string", "null"] },
          verificationSteps: {
            type: "array",
            items: { type: "string" },
          },
          humanReviewNeeded: { type: "boolean" },
        },
      },
    },
  },
} as const;
