import type { ImagePurpose } from "@/features/accessibility/types/aiImageAnalysis";
import type { SocialPlatform } from "@/types";

export type ReadingOrderItemType =
  | "caption"
  | "hashtag"
  | "image_description"
  | "link"
  | "other";

export type ReadingOrderItem = {
  id: string;
  type: ReadingOrderItemType;
  label: string;
  content: string;
  warnings?: string[];
};

export type NoiseFinding = {
  id: string;
  category: string;
  title: string;
  detail: string;
  recommendation?: string;
};

export type ExperienceSummaryLevel =
  | "clear"
  | "mostly_clear"
  | "review"
  | "high_verbosity";

export type ExperienceSummary = {
  level: ExperienceSummaryLevel;
  label: string;
  noiseSourceCount: number;
  repeatedEmojis: boolean;
  fancyUnicode: boolean;
  excessHashtags: boolean;
  duplicateCaptionAlt: boolean;
  genericLinkLanguage: boolean;
};

export type SpeechPlaybackStatus =
  | "idle"
  | "playing"
  | "paused"
  | "stopped"
  | "unsupported";

export type AltTextSource = "user" | "ai_applied" | "none";

export type ListeningFatigueMetrics = {
  wordCount: number;
  paragraphCount: number;
  hashtagCount: number;
  emojiRepetitionGroups: number;
  longestSentenceWords: number;
};

export type EmojiSequenceSummary = {
  glyph: string;
  count: number;
};

export type HashtagPreviewItem = {
  original: string;
  suggestedReadable: string | null;
  ambiguous: boolean;
};

export type CaptionAltDuplicationPreview = {
  isExactDuplicate: boolean;
  isSubstantiallySimilar: boolean;
  similarityRatio: number;
};

export type ScreenReaderPreviewInput = {
  caption: string;
  altText: string;
  hasImage: boolean;
  platform?: SocialPlatform;
  linkLabel?: string;
  altTextSource?: AltTextSource;
  imagePurpose?: ImagePurpose | null;
};

export type ScreenReaderPreviewResult = {
  readingOrder: ReadingOrderItem[];
  contentOrderLabels: string[];
  noiseFindings: NoiseFinding[];
  experienceSummary: ExperienceSummary;
  speechText: string;
  accessibleDraft: string;
  draftChanged: boolean;
  metrics: ListeningFatigueMetrics;
  emojiSequences: EmojiSequenceSummary[];
  hashtagItems: HashtagPreviewItem[];
  fancyUnicodeOriginal: string | null;
  fancyUnicodeNormalized: string | null;
  duplication: CaptionAltDuplicationPreview | null;
  imagePurposeNote: string | null;
  altTextSource: AltTextSource;
  preflightReviewCount: number;
};
