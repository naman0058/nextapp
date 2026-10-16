import type { CaptionCue } from "@/features/video/types/captions";
import type { TranscriptionApiResult } from "@/features/video/types/transcription";
import type { VideoVisualAccessibilityReview } from "@/features/video/types/visualReview";
import type { VideoMetadata } from "@/features/video/utils/client/readVideoMetadata";
import {
  DEFAULT_VIDEO_REVIEW,
  type VideoReviewCheckboxes,
} from "@/features/video/utils/videoSessionStorage";
import type { SocialPlatform } from "@/types";

export type VideoWorkflowPhase = "idle" | "uploading" | "transcribing" | "ready";

export type VideoState = {
  file: File | null;
  previewUrl: string | null;
  metadata: VideoMetadata | null;
  fingerprint: string | null;
  cachedTranscription: TranscriptionApiResult | null;
  cues: CaptionCue[];
  platform: SocialPlatform;
  detectSpeakers: boolean;
  language: string;
  vocabularyHints: string;
  phase: VideoWorkflowPhase;
  uploadPercent: number;
  error: string | null;
  speakerLabels: Record<string, string>;
  review: VideoReviewCheckboxes;
  visualReview: VideoVisualAccessibilityReview | null;
  visualStale: boolean;
  visualLoading: boolean;
  transcribeForce: boolean;
};

export const initialVideoState: VideoState = {
  file: null,
  previewUrl: null,
  metadata: null,
  fingerprint: null,
  cachedTranscription: null,
  cues: [],
  platform: "instagram",
  detectSpeakers: false,
  language: "auto",
  vocabularyHints: "",
  phase: "idle",
  uploadPercent: 0,
  error: null,
  speakerLabels: {},
  review: DEFAULT_VIDEO_REVIEW,
  visualReview: null,
  visualStale: false,
  visualLoading: false,
  transcribeForce: false,
};

export type VideoAction =
  | { type: "SET_FILE"; file: File; previewUrl: string; metadata: VideoMetadata; fingerprint: string }
  | { type: "CLEAR_VIDEO" }
  | { type: "SET_PLATFORM"; platform: SocialPlatform }
  | { type: "SET_DETECT_SPEAKERS"; value: boolean }
  | { type: "SET_LANGUAGE"; value: string }
  | { type: "SET_VOCABULARY"; value: string }
  | { type: "UPLOAD_START" }
  | { type: "UPLOAD_PROGRESS"; percent: number }
  | { type: "TRANSCRIBE_START" }
  | { type: "TRANSCRIBE_SUCCESS"; transcription: TranscriptionApiResult; cues: CaptionCue[] }
  | { type: "SET_ERROR"; message: string | null }
  | { type: "SET_CUES"; cues: CaptionCue[] }
  | { type: "SET_REVIEW"; key: keyof VideoReviewCheckboxes; value: boolean }
  | { type: "SET_SPEAKER_LABELS"; labels: Record<string, string> }
  | { type: "VISUAL_START" }
  | { type: "VISUAL_SUCCESS"; review: VideoVisualAccessibilityReview }
  | { type: "VISUAL_FAIL" }
  | { type: "MARK_VISUAL_STALE" }
  | { type: "PHASE_IDLE" };

function clearTranscriptionState(): Partial<VideoState> {
  return {
    cachedTranscription: null,
    cues: [],
    visualReview: null,
    visualStale: false,
    review: DEFAULT_VIDEO_REVIEW,
    speakerLabels: {},
  };
}

export function videoReducer(state: VideoState, action: VideoAction): VideoState {
  switch (action.type) {
    case "SET_FILE":
      return {
        ...state,
        ...clearTranscriptionState(),
        file: action.file,
        previewUrl: action.previewUrl,
        metadata: action.metadata,
        fingerprint: action.fingerprint,
        phase: "idle",
        error: null,
        transcribeForce: false,
      };
    case "CLEAR_VIDEO":
      return { ...initialVideoState, platform: state.platform };
    case "SET_PLATFORM":
      return { ...state, platform: action.platform };
    case "SET_DETECT_SPEAKERS":
      return { ...state, detectSpeakers: action.value };
    case "SET_LANGUAGE":
      return { ...state, language: action.value };
    case "SET_VOCABULARY":
      return { ...state, vocabularyHints: action.value };
    case "UPLOAD_START":
      return { ...state, phase: "uploading", uploadPercent: 0, error: null };
    case "UPLOAD_PROGRESS":
      return { ...state, uploadPercent: action.percent };
    case "TRANSCRIBE_START":
      return { ...state, phase: "transcribing", error: null };
    case "TRANSCRIBE_SUCCESS":
      return {
        ...state,
        phase: "ready",
        cachedTranscription: action.transcription,
        cues: action.cues,
        visualStale: Boolean(state.visualReview),
        transcribeForce: false,
      };
    case "SET_ERROR":
      return { ...state, error: action.message, phase: "idle" };
    case "SET_CUES":
      return {
        ...state,
        cues: action.cues,
        visualStale: Boolean(state.visualReview),
      };
    case "SET_REVIEW":
      return {
        ...state,
        review: { ...state.review, [action.key]: action.value },
      };
    case "SET_SPEAKER_LABELS":
      return { ...state, speakerLabels: action.labels };
    case "VISUAL_START":
      return { ...state, visualLoading: true, error: null };
    case "VISUAL_SUCCESS":
      return {
        ...state,
        visualLoading: false,
        visualReview: action.review,
        visualStale: false,
      };
    case "VISUAL_FAIL":
      return { ...state, visualLoading: false };
    case "MARK_VISUAL_STALE":
      return { ...state, visualStale: true };
    case "PHASE_IDLE":
      return { ...state, phase: "idle" };
    default:
      return state;
  }
}
