export type VideoVisualObservationCategory =
  | "on_screen_text"
  | "important_action"
  | "scene_context"
  | "chart_or_graph"
  | "instruction"
  | "other";

export type LikelyCoveredByAudio = "yes" | "partially" | "no" | "uncertain";

export type VisualObservationPriority = "low" | "medium" | "high";

export type VideoVisualObservation = {
  timestamp: number;
  category: VideoVisualObservationCategory;
  description: string;
  likelyCoveredByAudio: LikelyCoveredByAudio;
  suggestedAudioDescription?: string | null;
  priority: VisualObservationPriority;
};

export type VideoVisualAccessibilityReview = {
  observations: VideoVisualObservation[];
  overallHumanReviewRequired: boolean;
  limitations: string[];
};
