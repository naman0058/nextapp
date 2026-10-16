export type WebsiteFixGuidance = {
  ruleId: string;
  plainLanguageExplanation: string;
  whyItMatters: string;
  suggestedFixes: string[];
  developerExample?: string | null;
  verificationSteps: string[];
  humanReviewNeeded: boolean;
};

export type WebsiteFixGuidanceResponse = {
  guidance: WebsiteFixGuidance[];
};
