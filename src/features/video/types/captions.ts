export type CaptionCue = {
  id: string;
  start: number;
  end: number;
  text: string;
  speaker?: string;
  soundCue?: boolean;
};

export type TimedWord = {
  word: string;
  start: number;
  end: number;
  speaker?: string;
};

export type TimedSegment = {
  start: number;
  end: number;
  text: string;
  speaker?: string;
};

export type CaptionQualityStatus = "ready" | "review" | "error" | "not_checked";

export type CaptionQualityFinding = {
  id: string;
  cueId?: string;
  status: Exclude<CaptionQualityStatus, "not_checked">;
  title: string;
  detail: string;
  suggestion?: string;
};

export type CaptionQualitySummary = {
  ready: number;
  review: number;
  error: number;
  findings: CaptionQualityFinding[];
};
