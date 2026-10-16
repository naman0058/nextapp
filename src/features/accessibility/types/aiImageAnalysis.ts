export type ImagePurpose = "informational" | "decorative" | "mixed" | "uncertain";

export type CaptionCoverageStatus =
  | "covered"
  | "partially_covered"
  | "not_covered"
  | "uncertain";

export type UserAltTextReviewStatus =
  | "good"
  | "needs_improvement"
  | "possibly_inaccurate"
  | "not_provided"
  | "uncertain";

export type AIImageAccessibilityAnalysis = {
  imagePurpose: ImagePurpose;
  suggestedAltText: string;
  altTextRationale: string;
  visibleText: string[];
  importantVisualDetails: string[];
  captionCoverage: {
    status: CaptionCoverageStatus;
    missingInformation: string[];
  };
  userAltTextReview: {
    provided: boolean;
    status: UserAltTextReviewStatus;
    issues: string[];
    improvedAltText: string | null;
  };
  humanReview: {
    required: boolean;
    reasons: string[];
  };
  limitations: string[];
};
