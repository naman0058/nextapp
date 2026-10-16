export const VIDEO_VISUAL_REVIEW_SCHEMA_NAME = "video_visual_accessibility_review";

export const videoVisualReviewJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["observations", "overallHumanReviewRequired", "limitations"],
  properties: {
    observations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "timestamp",
          "category",
          "description",
          "likelyCoveredByAudio",
          "priority",
        ],
        properties: {
          timestamp: { type: "number" },
          category: {
            type: "string",
            enum: [
              "on_screen_text",
              "important_action",
              "scene_context",
              "chart_or_graph",
              "instruction",
              "other",
            ],
          },
          description: { type: "string" },
          likelyCoveredByAudio: {
            type: "string",
            enum: ["yes", "partially", "no", "uncertain"],
          },
          suggestedAudioDescription: { type: ["string", "null"] },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
        },
      },
    },
    overallHumanReviewRequired: { type: "boolean" },
    limitations: {
      type: "array",
      items: { type: "string" },
    },
  },
} as const;
