export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "x"
  | "tiktok"
  | "youtube";

export type AccessibilityCategory =
  | "caption"
  | "hashtags"
  | "emoji"
  | "links"
  | "image"
  | "alt_text"
  | "readability"
  | "contrast"
  | "screen_reader"
  | "platform";

export type PreflightSeverity = "info" | "warning" | "error";

export type PreflightStatus = "pass" | "review" | "fail" | "not_checked";
