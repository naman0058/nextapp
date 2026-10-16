import type { AIImageAccessibilityAnalysis } from "@/features/accessibility/types/aiImageAnalysis";
import type {
  ColorSample,
  ContrastTextType,
  VisualChecklistState,
} from "@/features/accessibility/types/visualAccessibility";

export type VisualPanelState = {
  foregroundHex: string;
  backgroundHex: string;
  textType: ContrastTextType;
  backgroundSamples: ColorSample[];
  checklist: VisualChecklistState;
  imageKey: string | null;
};

export const initialChecklist: VisualChecklistState = {
  colorOnlyMeaning: null,
  textOverComplexBackground: null,
  importantSmallText: null,
  textOnlyInGraphic: null,
  understandableWithoutColor: null,
};

export function createInitialVisualState(): VisualPanelState {
  return {
    foregroundHex: "#000000",
    backgroundHex: "#FFFFFF",
    textType: "normal",
    backgroundSamples: [],
    checklist: { ...initialChecklist },
    imageKey: null,
  };
}

export type VisualPanelAction =
  | { type: "SET_FOREGROUND_HEX"; hex: string }
  | { type: "SET_BACKGROUND_HEX"; hex: string }
  | { type: "SET_TEXT_TYPE"; textType: ContrastTextType }
  | { type: "SET_FOREGROUND_SAMPLE"; sample: ColorSample }
  | { type: "SET_BACKGROUND_SAMPLE"; sample: ColorSample }
  | { type: "CLEAR_SAMPLES" }
  | { type: "SET_CHECKLIST"; key: keyof VisualChecklistState; value: VisualChecklistState[keyof VisualChecklistState] }
  | { type: "RESET_VISUAL" }
  | { type: "IMAGE_CHANGED"; imageKey: string | null };

export function visualPanelReducer(
  state: VisualPanelState,
  action: VisualPanelAction,
): VisualPanelState {
  switch (action.type) {
    case "SET_FOREGROUND_HEX":
      return { ...state, foregroundHex: action.hex };
    case "SET_BACKGROUND_HEX":
      return { ...state, backgroundHex: action.hex };
    case "SET_TEXT_TYPE":
      return { ...state, textType: action.textType };
    case "SET_FOREGROUND_SAMPLE":
      return {
        ...state,
        foregroundHex: action.sample.hex,
      };
    case "SET_BACKGROUND_SAMPLE":
      return {
        ...state,
        backgroundSamples: [...state.backgroundSamples, action.sample],
        backgroundHex: action.sample.hex,
      };
    case "CLEAR_SAMPLES":
      return { ...state, backgroundSamples: [] };
    case "SET_CHECKLIST":
      return {
        ...state,
        checklist: { ...state.checklist, [action.key]: action.value },
      };
    case "RESET_VISUAL":
      return createInitialVisualState();
    case "IMAGE_CHANGED":
      if (state.imageKey === action.imageKey) return state;
      return {
        ...state,
        imageKey: action.imageKey,
        backgroundSamples: [],
        checklist: { ...initialChecklist },
      };
    default:
      return state;
  }
}

export type VisualPanelMode = "embedded" | "standalone";

export type ContrastSnapshotPayload = {
  measured: boolean;
  primaryVerdict?: "pass" | "fail";
};

export type VisualAccessibilityPanelProps = {
  mode?: VisualPanelMode;
  imageFile?: File | null;
  imagePreviewUrl?: string | null;
  aiAnalysis?: AIImageAccessibilityAnalysis | null;
  onStandaloneImage?: (file: File, previewUrl: string) => void;
  onStandaloneRemoveImage?: () => void;
  standaloneFileName?: string | null;
  onContrastSnapshotChange?: (snapshot: ContrastSnapshotPayload) => void;
};
