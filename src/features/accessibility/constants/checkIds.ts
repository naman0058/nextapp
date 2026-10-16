export const CHECK_IDS = {
  EMPTY_CAPTION: "empty-caption",
  EXCESSIVE_CAPS: "excessive-caps",
  CONSECUTIVE_EMOJI: "consecutive-emoji",
  EMOJI_HEAVY_START: "emoji-heavy-start",
  FANCY_UNICODE: "fancy-unicode",
  HASHTAG_READABILITY: "hashtag-readability",
  HASHTAG_OVERLOAD: "hashtag-overload",
  REPEATED_PUNCTUATION: "repeated-punctuation",
  LONG_UNBROKEN_TEXT: "long-unbroken-text",
  GENERIC_LINK_LANGUAGE: "generic-link-language",
  ALT_TEXT_PRESENCE: "alt-text-presence",
  ALT_TEXT_PREFIX: "alt-text-prefix",
  ALT_TEXT_LENGTH: "alt-text-length",
  ALT_TEXT_FILENAME: "alt-text-filename",
  DUPLICATE_CAPTION_ALT: "duplicate-caption-alt",
  LONG_WORD_OR_URL: "long-word-or-url",
} as const;

export type CheckId = (typeof CHECK_IDS)[keyof typeof CHECK_IDS];
