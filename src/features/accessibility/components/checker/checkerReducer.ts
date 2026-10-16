import { DEFAULT_PHASE1_PLATFORM } from "@/features/accessibility/constants/platforms";
import type { AIImageAccessibilityAnalysis } from "@/features/accessibility/types/aiImageAnalysis";
import type { AltTextSource } from "@/features/accessibility/types/screenReaderPreview";
import type { PreflightAnalysisResult } from "@/features/accessibility/types/preflight";
import type { AiRemediationEntry } from "@/lib/ai/remediation/client/aiRemediationEntry";
import type { SocialPlatform } from "@/types";

function markRemediationStale(
  entry: AiRemediationEntry | null,
): AiRemediationEntry | null {
  if (!entry) return null;
  return { ...entry, stale: true };
}

export type AiStatus = "idle" | "loading" | "success" | "error" | "stale";

export type CheckerState = {
  platform: SocialPlatform;
  caption: string;
  workingCaption: string;
  altText: string;
  altTextSource: AltTextSource;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  imageFileName: string | null;
  results: PreflightAnalysisResult | null;
  undoCaption: string | null;
  copyMessage: string | null;
  errorMessage: string | null;
  inputsDirty: boolean;
  aiAnalysis: AIImageAccessibilityAnalysis | null;
  aiStatus: AiStatus;
  aiError: string | null;
  aiLiveMessage: string | null;
  lastAiInputFingerprint: string | null;
  socialRemediation: AiRemediationEntry | null;
  imageRemediation: AiRemediationEntry | null;
};

export const initialCheckerState: CheckerState = {
  platform: DEFAULT_PHASE1_PLATFORM,
  caption: "",
  workingCaption: "",
  altText: "",
  altTextSource: "none",
  imageFile: null,
  imagePreviewUrl: null,
  imageFileName: null,
  results: null,
  undoCaption: null,
  copyMessage: null,
  errorMessage: null,
  inputsDirty: false,
  aiAnalysis: null,
  aiStatus: "idle",
  aiError: null,
  aiLiveMessage: null,
  lastAiInputFingerprint: null,
  socialRemediation: null,
  imageRemediation: null,
};

export type CheckerAction =
  | { type: "SET_PLATFORM"; platform: SocialPlatform }
  | { type: "SET_CAPTION"; caption: string }
  | { type: "SET_WORKING_CAPTION"; workingCaption: string }
  | {
      type: "SET_ALT_TEXT";
      altText: string;
      source?: Extract<AltTextSource, "user" | "ai_applied">;
    }
  | {
      type: "SET_IMAGE";
      file: File | null;
      previewUrl: string | null;
      fileName: string | null;
    }
  | { type: "SET_RESULTS"; results: PreflightAnalysisResult }
  | { type: "CLEAR_RESULTS" }
  | { type: "APPLY_FIX"; workingCaption: string; undoCaption: string }
  | { type: "UNDO_FIX"; workingCaption: string }
  | { type: "SET_COPY_MESSAGE"; message: string | null }
  | { type: "SET_ERROR"; message: string | null }
  | { type: "AI_START"; fingerprint: string }
  | {
      type: "AI_SUCCESS";
      analysis: AIImageAccessibilityAnalysis;
      fingerprint: string;
    }
  | { type: "AI_ERROR"; message: string }
  | { type: "AI_CLEAR" }
  | { type: "AI_MARK_STALE" }
  | { type: "SET_AI_LIVE_MESSAGE"; message: string | null }
  | { type: "SET_SOCIAL_REMEDIATION"; entry: AiRemediationEntry | null }
  | { type: "SET_IMAGE_REMEDIATION"; entry: AiRemediationEntry | null }
  | { type: "RESET" };

function clearPhase1ResultsIfNeeded(
  state: CheckerState,
): Partial<CheckerState> {
  if (!state.results) return {};
  return { results: null, inputsDirty: true };
}

function clearAiState(): Partial<CheckerState> {
  return {
    aiAnalysis: null,
    aiStatus: "idle",
    aiError: null,
    aiLiveMessage: null,
    lastAiInputFingerprint: null,
  };
}

export function checkerReducer(
  state: CheckerState,
  action: CheckerAction,
): CheckerState {
  switch (action.type) {
    case "SET_PLATFORM":
      return {
        ...state,
        platform: action.platform,
        ...clearPhase1ResultsIfNeeded(state),
        ...clearAiState(),
        aiStatus: "idle",
        socialRemediation: null,
        imageRemediation: null,
      };
    case "SET_CAPTION": {
      return {
        ...state,
        caption: action.caption,
        workingCaption: action.caption,
        undoCaption: null,
        ...clearPhase1ResultsIfNeeded(state),
        aiAnalysis: null,
        aiStatus: state.lastAiInputFingerprint ? "stale" : "idle",
        aiError: null,
        socialRemediation: markRemediationStale(state.socialRemediation),
        imageRemediation: markRemediationStale(state.imageRemediation),
      };
    }
    case "SET_WORKING_CAPTION":
      return {
        ...state,
        workingCaption: action.workingCaption,
        ...clearPhase1ResultsIfNeeded(state),
        aiAnalysis: null,
        aiStatus: state.lastAiInputFingerprint ? "stale" : "idle",
        aiError: null,
        socialRemediation: markRemediationStale(state.socialRemediation),
        imageRemediation: markRemediationStale(state.imageRemediation),
      };
    case "SET_ALT_TEXT": {
      const trimmed = action.altText.trim();
      const source: AltTextSource = trimmed
        ? (action.source ?? state.altTextSource === "ai_applied"
            ? "ai_applied"
            : "user")
        : "none";
      return {
        ...state,
        altText: action.altText,
        altTextSource: source,
        ...clearPhase1ResultsIfNeeded(state),
        aiAnalysis: null,
        aiStatus: state.lastAiInputFingerprint ? "stale" : "idle",
        aiError: null,
        socialRemediation: markRemediationStale(state.socialRemediation),
        imageRemediation: markRemediationStale(state.imageRemediation),
      };
    }
    case "SET_IMAGE":
      return {
        ...state,
        imageFile: action.file,
        imagePreviewUrl: action.previewUrl,
        imageFileName: action.fileName,
        altText: action.file ? state.altText : "",
        altTextSource: action.file ? state.altTextSource : "none",
        ...clearPhase1ResultsIfNeeded(state),
        ...clearAiState(),
        socialRemediation: markRemediationStale(state.socialRemediation),
        imageRemediation: null,
      };
    case "SET_RESULTS":
      return {
        ...state,
        results: action.results,
        inputsDirty: false,
        errorMessage: null,
        socialRemediation: markRemediationStale(state.socialRemediation),
        imageRemediation: markRemediationStale(state.imageRemediation),
      };
    case "CLEAR_RESULTS":
      return { ...state, results: null };
    case "APPLY_FIX":
      return {
        ...state,
        workingCaption: action.workingCaption,
        undoCaption: action.undoCaption,
        results: null,
        inputsDirty: true,
        aiAnalysis: null,
        aiStatus: state.lastAiInputFingerprint ? "stale" : "idle",
        socialRemediation: markRemediationStale(state.socialRemediation),
      };
    case "UNDO_FIX":
      return {
        ...state,
        workingCaption: action.workingCaption,
        undoCaption: null,
        results: null,
        inputsDirty: true,
      };
    case "SET_COPY_MESSAGE":
      return { ...state, copyMessage: action.message };
    case "SET_ERROR":
      return { ...state, errorMessage: action.message };
    case "AI_START":
      return {
        ...state,
        aiStatus: "loading",
        aiError: null,
        aiLiveMessage: "Analyzing image accessibility…",
        lastAiInputFingerprint: action.fingerprint,
      };
    case "AI_SUCCESS":
      return {
        ...state,
        aiAnalysis: action.analysis,
        aiStatus: "success",
        aiError: null,
        aiLiveMessage: "AI image analysis complete.",
        lastAiInputFingerprint: action.fingerprint,
        imageRemediation: markRemediationStale(state.imageRemediation),
      };
    case "AI_ERROR":
      return {
        ...state,
        aiStatus: "error",
        aiError: action.message,
        aiLiveMessage: "AI image analysis could not be completed.",
      };
    case "AI_CLEAR":
      return { ...state, ...clearAiState() };
    case "AI_MARK_STALE":
      return {
        ...state,
        aiAnalysis: null,
        aiStatus: "stale",
        aiError: null,
      };
    case "SET_AI_LIVE_MESSAGE":
      return { ...state, aiLiveMessage: action.message };
    case "SET_SOCIAL_REMEDIATION":
      return { ...state, socialRemediation: action.entry };
    case "SET_IMAGE_REMEDIATION":
      return { ...state, imageRemediation: action.entry };
    case "RESET":
      if (state.imagePreviewUrl) {
        URL.revokeObjectURL(state.imagePreviewUrl);
      }
      return { ...initialCheckerState };
    default:
      return state;
  }
}
