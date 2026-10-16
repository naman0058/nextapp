"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import type { AiRemediationEntry } from "@/lib/ai/remediation/client/aiRemediationEntry";
import { loadVisualPreflightSession } from "@/features/accessibility/utils/visualPreflightSession";
import { ACCEPTED_IMAGE_MIME_TYPES } from "@/constants";
import { MAX_IMAGE_SIZE_BYTES } from "@/features/accessibility/constants/thresholds";
import { AccessibleColorSuggestion } from "@/features/accessibility/components/visual/AccessibleColorSuggestion";
import { ContrastAiRemediationSection } from "@/features/accessibility/components/visual/ContrastAiRemediationSection";
import { AiVisualObservations } from "@/features/accessibility/components/visual/AiVisualObservations";
import { ContrastCalculator } from "@/features/accessibility/components/visual/ContrastCalculator";
import { ContrastResultCard } from "@/features/accessibility/components/visual/ContrastResultCard";
import { ImageColorSampler } from "@/features/accessibility/components/visual/ImageColorSampler";
import { VisualAccessibilitySummary } from "@/features/accessibility/components/visual/VisualAccessibilitySummary";
import { VisualPrivacyNote } from "@/features/accessibility/components/visual/VisualPrivacyNote";
import { VisualReviewChecklist } from "@/features/accessibility/components/visual/VisualReviewChecklist";
import {
  createInitialVisualState,
  visualPanelReducer,
  type VisualAccessibilityPanelProps,
} from "@/features/accessibility/components/visual/visualPanelState";
import {
  ColorParseError,
  evaluateContrast,
  parseHexColor,
} from "@/features/accessibility/utils/contrast";
import { saveVisualPreflightSession } from "@/features/accessibility/utils/visualPreflightSession";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { Card } from "@/components/ui/Card";

function imageFingerprint(file: File | null | undefined): string | null {
  if (!file) return null;
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function VisualAccessibilityPanel({
  mode = "embedded",
  imageFile = null,
  imagePreviewUrl = null,
  aiAnalysis = null,
  onStandaloneImage,
  onStandaloneRemoveImage,
  standaloneFileName = null,
  onContrastSnapshotChange,
}: VisualAccessibilityPanelProps) {
  const [state, dispatch] = useReducer(
    visualPanelReducer,
    undefined,
    createInitialVisualState,
  );
  const [contrastAiRemediation, setContrastAiRemediation] = useState<AiRemediationEntry | null>(
    () => loadVisualPreflightSession()?.contrastAiRemediation ?? null,
  );
  const [contrastRemKey, setContrastRemKey] = useState("");

  const effectiveFile = imageFile;
  const effectivePreview = imagePreviewUrl;
  const effectiveName = standaloneFileName ?? imageFile?.name ?? null;

  useEffect(() => {
    dispatch({
      type: "IMAGE_CHANGED",
      imageKey: imageFingerprint(effectiveFile),
    });
  }, [effectiveFile]);

  const parseError = useMemo(() => {
    try {
      parseHexColor(state.foregroundHex);
      parseHexColor(state.backgroundHex);
      return null;
    } catch (err) {
      if (err instanceof ColorParseError) return err.message;
      return "Invalid color.";
    }
  }, [state.foregroundHex, state.backgroundHex]);

  const evaluation = useMemo(() => {
    if (parseError) return null;
    try {
      const fg = parseHexColor(state.foregroundHex);
      const bg = parseHexColor(state.backgroundHex);
      return evaluateContrast(fg, bg, state.textType);
    } catch {
      return null;
    }
  }, [parseError, state.foregroundHex, state.backgroundHex, state.textType]);

  const rgbPair = useMemo(() => {
    try {
      return {
        fg: parseHexColor(state.foregroundHex),
        bg: parseHexColor(state.backgroundHex),
      };
    } catch {
      return null;
    }
  }, [state.foregroundHex, state.backgroundHex]);

  useEffect(() => {
    if (!onContrastSnapshotChange) return;
    const initial = createInitialVisualState();
    const measured =
      state.backgroundSamples.length > 0 ||
      state.foregroundHex !== initial.foregroundHex ||
      state.backgroundHex !== initial.backgroundHex ||
      state.textType !== initial.textType;
    onContrastSnapshotChange({
      measured: measured && !parseError && Boolean(evaluation),
      primaryVerdict:
        evaluation?.primaryVerdict === "pass" ? "pass" : "fail",
    });
  }, [
    state.backgroundSamples.length,
    state.foregroundHex,
    state.backgroundHex,
    state.textType,
    parseError,
    evaluation,
    onContrastSnapshotChange,
  ]);

  useEffect(() => {
    const initial = createInitialVisualState();
    const measured =
      state.backgroundSamples.length > 0 ||
      state.foregroundHex !== initial.foregroundHex ||
      state.backgroundHex !== initial.backgroundHex ||
      state.textType !== initial.textType;
    const remKey = `${state.foregroundHex}-${state.backgroundHex}-${state.textType}-${evaluation?.ratio ?? ""}`;
    const staleRem =
      contrastAiRemediation && contrastRemKey && contrastRemKey !== remKey
        ? { ...contrastAiRemediation, stale: true }
        : contrastAiRemediation;
    saveVisualPreflightSession({
      measured: measured && !parseError && Boolean(evaluation),
      foregroundHex: state.foregroundHex,
      backgroundHex: state.backgroundHex,
      textType: state.textType,
      evaluation,
      backgroundSampleCount: state.backgroundSamples.length,
      checklist: state.checklist,
      contrastAiRemediation: staleRem,
    });
  }, [
    state.foregroundHex,
    state.backgroundHex,
    state.textType,
    state.backgroundSamples.length,
    state.checklist,
    parseError,
    evaluation,
    contrastAiRemediation,
    contrastRemKey,
  ]);

  const aiObservationCount = aiAnalysis
    ? (aiAnalysis.visibleText.length > 0 ? 1 : 0) +
      (aiAnalysis.importantVisualDetails.length > 0 ? 1 : 0) +
      (aiAnalysis.humanReview.required ? 1 : 0)
    : 0;

  function handleStandaloneFile(file: File) {
    const mime = file.type.toLowerCase();
    const allowed = ACCEPTED_IMAGE_MIME_TYPES as readonly string[];
    if (!allowed.includes(mime)) return;
    if (file.size > MAX_IMAGE_SIZE_BYTES) return;
    const url = URL.createObjectURL(file);
    onStandaloneImage?.(file, url);
  }

  return (
    <div className="space-y-6">
      <VisualPrivacyNote />

      {mode === "standalone" ? (
        <Card className="space-y-3 p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Image for sampling (optional)
          </h3>
          {effectiveFile && effectivePreview ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted">{effectiveName}</span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onStandaloneRemoveImage?.()}
              >
                Remove image
              </Button>
            </div>
          ) : (
            <input
              type="file"
              accept={ACCEPTED_IMAGE_MIME_TYPES.join(",")}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleStandaloneFile(file);
                e.target.value = "";
              }}
              className="text-sm"
            />
          )}
        </Card>
      ) : null}

      {aiAnalysis ? <AiVisualObservations analysis={aiAnalysis} /> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <ContrastCalculator
          foregroundHex={state.foregroundHex}
          backgroundHex={state.backgroundHex}
          textType={state.textType}
          parseError={parseError}
          onForegroundHex={(hex) =>
            dispatch({ type: "SET_FOREGROUND_HEX", hex })
          }
          onBackgroundHex={(hex) =>
            dispatch({ type: "SET_BACKGROUND_HEX", hex })
          }
          onTextType={(textType) =>
            dispatch({ type: "SET_TEXT_TYPE", textType })
          }
        />
        <div className="space-y-4">
          <ContrastResultCard evaluation={evaluation} />
          {rgbPair && evaluation ? (
            <AccessibleColorSuggestion
              foreground={rgbPair.fg}
              background={rgbPair.bg}
              textType={state.textType}
              evaluationFails={evaluation.primaryVerdict === "fail"}
            />
          ) : null}
          {rgbPair && evaluation && evaluation.primaryVerdict === "fail" ? (
            <ContrastAiRemediationSection
              foreground={rgbPair.fg}
              background={rgbPair.bg}
              foregroundHex={state.foregroundHex}
              backgroundHex={state.backgroundHex}
              textType={state.textType}
              evaluation={evaluation}
              entry={contrastAiRemediation}
              onEntry={(newEntry) => {
                const remKey = `${state.foregroundHex}-${state.backgroundHex}-${state.textType}-${evaluation.ratio}`;
                setContrastRemKey(remKey);
                setContrastAiRemediation(newEntry);
              }}
            />
          ) : null}
        </div>
      </div>

      {effectiveFile && effectivePreview ? (
        <section aria-labelledby="sampler-heading">
          <h3
            id="sampler-heading"
            className="text-sm font-semibold text-foreground"
          >
            Sample colors from image
          </h3>
          <p className="mt-1 text-xs text-muted">
            Sight-assisted sampling only. You can measure contrast using manual
            hex inputs without clicking the image.
          </p>
          <div className="mt-4">
            <ImageColorSampler
              key={imageFingerprint(effectiveFile) ?? "no-image"}
              imageFile={effectiveFile}
              previewUrl={effectivePreview}
              foregroundHex={state.foregroundHex}
              backgroundSamples={state.backgroundSamples}
              onForegroundSample={(sample) =>
                dispatch({ type: "SET_FOREGROUND_SAMPLE", sample })
              }
              onBackgroundSample={(sample) =>
                dispatch({ type: "SET_BACKGROUND_SAMPLE", sample })
              }
              onApplyDominant={(hex, target) => {
                if (target === "foreground") {
                  dispatch({ type: "SET_FOREGROUND_HEX", hex });
                } else {
                  dispatch({ type: "SET_BACKGROUND_HEX", hex });
                }
              }}
              onClearSamples={() => dispatch({ type: "CLEAR_SAMPLES" })}
            />
          </div>
        </section>
      ) : mode === "embedded" ? (
        <StatusMessage variant="review" title="No image uploaded">
          Upload an image in the checker above to sample colors from pixels, or
          use the hex fields to measure contrast manually.
        </StatusMessage>
      ) : null}

      <VisualReviewChecklist
        checklist={state.checklist}
        onChange={(key, value) =>
          dispatch({ type: "SET_CHECKLIST", key, value })
        }
      />

      <VisualAccessibilitySummary
        evaluation={evaluation}
        checklist={state.checklist}
        aiObservationCount={aiObservationCount}
      />

      <p className="text-xs text-muted">
        Measured ratios apply to solid foreground and background colors. This
        tool supports preflight review, not legal WCAG certification.
      </p>

      <Button
        type="button"
        variant="secondary"
        onClick={() => dispatch({ type: "RESET_VISUAL" })}
      >
        Reset visual analysis
      </Button>
    </div>
  );
}
