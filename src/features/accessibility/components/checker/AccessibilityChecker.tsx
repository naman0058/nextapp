"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { AccessibilityCheckerHandoff } from "@/features/accessibility/components/checker/AccessibilityCheckerHandoff";
import { PlatformSelector } from "@/features/accessibility/components/PlatformSelector";
import { PlatformPublishingSection } from "@/features/accessibility/components/platform/PlatformPublishingSection";
import { getPlatformCheckerPath } from "@/features/accessibility/config/platformAccessibility";
import { DEFAULT_PHASE1_PLATFORM } from "@/features/accessibility/constants/platforms";
import { AiAnalysisDisclosure } from "@/features/accessibility/components/checker/AiAnalysisDisclosure";
import { AiImageReviewSection } from "@/features/accessibility/components/checker/AiImageReviewSection";
import { ImageAiRemediationSection } from "@/features/accessibility/components/checker/ImageAiRemediationSection";
import { SocialAiRemediationSection } from "@/features/accessibility/components/checker/SocialAiRemediationSection";
import { AltTextInput } from "@/features/accessibility/components/checker/AltTextInput";
import { CaptionInput } from "@/features/accessibility/components/checker/CaptionInput";
import { ImageUpload } from "@/features/accessibility/components/checker/ImageUpload";
import { WorkingCaption } from "@/features/accessibility/components/checker/WorkingCaption";
import { ScreenReaderExperiencePanel } from "@/features/accessibility/components/screenReader/ScreenReaderExperiencePanel";
import { VisualAccessibilityPanel } from "@/features/accessibility/components/visual/VisualAccessibilityPanel";
import {
  checkerReducer,
  initialCheckerState,
} from "@/features/accessibility/components/checker/checkerReducer";
import { CLIENT_ANALYSIS_COOLDOWN_MS } from "@/features/accessibility/constants/aiLimits";
import { applyAutoFix } from "@/features/accessibility/utils/autoFix/applyAutoFix";
import { runPreflightAnalysis } from "@/features/accessibility/utils/runPreflightAnalysis";
import { buildAiInputFingerprint } from "@/features/accessibility/utils/client/aiInputFingerprint";
import {
  ImagePrepError,
  prepareImageForAnalysis,
} from "@/features/accessibility/utils/client/prepareImageForAnalysis";
import {
  AiRequestError,
  requestAiImageAnalysis,
} from "@/features/accessibility/utils/client/requestAiImageAnalysis";
import { buildScreenReaderPreview } from "@/features/accessibility/utils/screenReaderPreview";
import {
  clearCheckerTextSession,
  loadCheckerTextSession,
  saveCheckerTextSession,
} from "@/features/accessibility/utils/checkerSessionStorage";
import { clearAllPublishingConfirmations } from "@/features/accessibility/utils/publishingConfirmationsSession";
import { AppPanel } from "@/components/app/AppPanel";
import {
  FindingsResultsPanel,
  PreflightResultsDashboard,
  ResultsEmptyState,
} from "@/components/results";
import { ToolWorkspace } from "@/components/app/ToolWorkspace";
import type { ContrastSnapshot } from "@/features/accessibility/utils/platform/types";
import type { SocialPlatform } from "@/types";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import Link from "next/link";
import { PLATFORM_CHECKER_PATHS } from "@/features/accessibility/config/platformAccessibility";
import { PreflightReportGenerator } from "@/features/reports/components/PreflightReportGenerator";
import { useSocialReportSource } from "@/features/reports/hooks/useSocialReportSource";
import {
  collectImageRemediationCandidate,
  collectSocialRemediationCandidate,
} from "@/lib/ai/remediation/report";

type AccessibilityCheckerProps = {
  initialPlatform?: SocialPlatform;
  syncPlatformRoute?: boolean;
  showPlatformHeader?: boolean;
};

function createInitialState(initialPlatform?: SocialPlatform) {
  const session = loadCheckerTextSession();
  const platform = initialPlatform ?? session?.platform ?? DEFAULT_PHASE1_PLATFORM;
  if (session) {
    return {
      ...initialCheckerState,
      platform,
      caption: session.caption,
      workingCaption: session.workingCaption,
      altText: session.altText,
      altTextSource: session.altTextSource,
    };
  }
  return {
    ...initialCheckerState,
    platform,
  };
}

export function AccessibilityChecker({
  initialPlatform,
  syncPlatformRoute = false,
  showPlatformHeader = true,
}: AccessibilityCheckerProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(
    checkerReducer,
    initialPlatform,
    createInitialState,
  );
  const [contrastSnapshot, setContrastSnapshot] = useState<ContrastSnapshot>({
    measured: false,
  });
  const [screenReaderEngaged, setScreenReaderEngaged] = useState(false);
  const aiInFlightRef = useRef(false);
  const cooldownUntilRef = useRef(0);

  useEffect(() => {
    return () => {
      if (state.imagePreviewUrl) {
        URL.revokeObjectURL(state.imagePreviewUrl);
      }
    };
  }, [state.imagePreviewUrl]);

  useEffect(() => {
    saveCheckerTextSession({
      platform: state.platform,
      caption: state.caption,
      workingCaption: state.workingCaption,
      altText: state.altText,
      altTextSource: state.altTextSource,
    });
  }, [
    state.platform,
    state.caption,
    state.workingCaption,
    state.altText,
    state.altTextSource,
  ]);

  const experienceLevel = useMemo(() => {
    return buildScreenReaderPreview({
      caption: state.workingCaption,
      altText: state.altText,
      hasImage: Boolean(state.imageFile),
      platform: state.platform,
      altTextSource: state.altTextSource,
      imagePurpose: state.aiAnalysis?.imagePurpose ?? null,
    }).experienceSummary.level;
  }, [
    state.workingCaption,
    state.altText,
    state.imageFile,
    state.platform,
    state.altTextSource,
    state.aiAnalysis?.imagePurpose,
  ]);

  const aiRemediationCandidates = useMemo(() => {
    const list = [];
    const social = collectSocialRemediationCandidate(
      state.socialRemediation,
      state.workingCaption,
    );
    if (social) list.push(social);
    const imageProv =
      state.aiAnalysis && state.aiStatus === "success" ? "vision" : "text_only";
    const image = collectImageRemediationCandidate(
      state.imageRemediation,
      state.altText,
      imageProv,
    );
    if (image) list.push(image);
    return list;
  }, [
    state.socialRemediation,
    state.workingCaption,
    state.imageRemediation,
    state.altText,
    state.aiAnalysis,
    state.aiStatus,
  ]);

  const reportSource = useSocialReportSource({
    platform: state.platform,
    hasImage: Boolean(state.imageFile),
    workingCaption: state.workingCaption,
    altText: state.altText,
    altTextSource: state.altTextSource,
    imageFileName: state.imageFile?.name ?? null,
    phase1: state.results,
    aiAnalysis: state.aiAnalysis,
    aiStatus: state.aiStatus,
    aiError: state.aiError,
    contrastSnapshot,
    screenReaderEngaged,
    imagePurpose: state.aiAnalysis?.imagePurpose ?? null,
    aiRemediationCandidates,
  });

  function handlePlatformChange(platform: SocialPlatform) {
    dispatch({ type: "SET_PLATFORM", platform });
    if (syncPlatformRoute) {
      const path = getPlatformCheckerPath(platform);
      if (path) router.replace(path);
    }
  }

  function handleStartOver() {
    clearCheckerTextSession();
    clearAllPublishingConfirmations();
    dispatch({ type: "RESET" });
  }

  const workflowSteps = [
    { id: "workspace-compose", label: "Compose content", shortLabel: "Compose" },
    { id: "workspace-results", label: "Review results", shortLabel: "Results" },
    { id: "workspace-enhance", label: "Enhance & preview", shortLabel: "Enhance" },
    { id: "workspace-publish", label: "Publish readiness", shortLabel: "Publish" },
  ] as const;

  const activeStepId = state.results
    ? "workspace-results"
    : "workspace-compose";

  function handleLocalPreflight() {
    const result = runPreflightAnalysis({
      platform: state.platform,
      caption: state.workingCaption,
      hasImage: Boolean(state.imageFile),
      altText: state.altText,
    });
    dispatch({ type: "SET_RESULTS", results: result });
  }

  async function handleAiAnalyze(options?: { force?: boolean }) {
    if (!state.imageFile || aiInFlightRef.current) return;
    if (Date.now() < cooldownUntilRef.current) return;

    const fingerprint =
      buildAiInputFingerprint({
        platform: state.platform,
        caption: state.workingCaption,
        altText: state.altText,
        file: state.imageFile,
      }) ?? "";

    const canReuseCached =
      !options?.force &&
      state.aiStatus === "success" &&
      state.aiAnalysis !== null &&
      fingerprint === state.lastAiInputFingerprint;

    if (canReuseCached) {
      dispatch({
        type: "SET_AI_LIVE_MESSAGE",
        message: "Using recent AI analysis for this content.",
      });
      setTimeout(
        () => dispatch({ type: "SET_AI_LIVE_MESSAGE", message: null }),
        3000,
      );
      return;
    }

    aiInFlightRef.current = true;
    dispatch({ type: "AI_START", fingerprint });

    try {
      const prepared = await prepareImageForAnalysis(state.imageFile);
      const analysis = await requestAiImageAnalysis({
        imageBlob: prepared.blob,
        fileName: prepared.fileName,
        platform: state.platform,
        caption: state.workingCaption,
        altText: state.altText,
      });
      dispatch({ type: "AI_SUCCESS", analysis, fingerprint });
      cooldownUntilRef.current = Date.now() + CLIENT_ANALYSIS_COOLDOWN_MS;
    } catch (error) {
      const message =
        error instanceof AiRequestError || error instanceof ImagePrepError
          ? error.message
          : "AI image analysis is temporarily unavailable. Your local accessibility checks are still available.";
      dispatch({ type: "AI_ERROR", message });
      cooldownUntilRef.current = Date.now() + CLIENT_ANALYSIS_COOLDOWN_MS;
    } finally {
      aiInFlightRef.current = false;
    }
  }

  function handleApplyFix(fixId: string, previewCaption: string) {
    const applied = applyAutoFix(state.workingCaption, fixId, previewCaption);
    if (!applied) return;
    dispatch({
      type: "APPLY_FIX",
      workingCaption: applied.nextCaption,
      undoCaption: applied.undoCaption,
    });
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(state.workingCaption);
      dispatch({ type: "SET_COPY_MESSAGE", message: "Caption copied." });
      setTimeout(() => dispatch({ type: "SET_COPY_MESSAGE", message: null }), 3000);
    } catch {
      dispatch({
        type: "SET_ERROR",
        message: "Could not copy to clipboard. Select the text and copy manually.",
      });
    }
  }

  const aiBusy = state.aiStatus === "loading";

  return (
    <ToolWorkspace steps={[...workflowSteps]} activeStepId={activeStepId}>
      <Suspense fallback={null}>
        <AccessibilityCheckerHandoff dispatch={dispatch} />
      </Suspense>
      <p className="sr-only" role="status" aria-live="polite">
        {state.aiLiveMessage ?? ""}
      </p>

      <div id="workspace-compose" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
        <AppPanel
          title="Compose your post"
          description="Platform checklists update when you switch networks. Caption checks are shared across platforms."
          headerAside={
            <p className="max-w-xs text-right text-xs text-muted">
              {Object.entries(PLATFORM_CHECKER_PATHS).map(([key, href], i, arr) => (
                <span key={key}>
                  <Link href={href} className="font-semibold text-primary hover:underline">
                    {key === "x" ? "X" : key.charAt(0).toUpperCase() + key.slice(1)}
                  </Link>
                  {i < arr.length - 1 ? " · " : ""}
                </span>
              ))}
            </p>
          }
        >
          <div className="space-y-6">
            <PlatformSelector value={state.platform} onChange={handlePlatformChange} />
            <CaptionInput
              id="checker-caption"
              value={state.caption}
              onChange={(caption) => dispatch({ type: "SET_CAPTION", caption })}
            />
            <ImageUpload
              fileName={state.imageFileName}
              previewUrl={state.imagePreviewUrl}
              onError={(message) => dispatch({ type: "SET_ERROR", message })}
              onFileSelected={(file) => {
                if (state.imagePreviewUrl) URL.revokeObjectURL(state.imagePreviewUrl);
                dispatch({
                  type: "SET_IMAGE",
                  file,
                  previewUrl: URL.createObjectURL(file),
                  fileName: file.name,
                });
              }}
              onRemove={() => {
                if (state.imagePreviewUrl) URL.revokeObjectURL(state.imagePreviewUrl);
                dispatch({
                  type: "SET_IMAGE",
                  file: null,
                  previewUrl: null,
                  fileName: null,
                });
              }}
            />
            <AltTextInput
              id="checker-alt"
              visible={Boolean(state.imageFile)}
              value={state.altText}
              onChange={(altText) =>
                dispatch({ type: "SET_ALT_TEXT", altText, source: "user" })
              }
            />
            {state.errorMessage && (
              <StatusMessage variant="error" title={state.errorMessage} />
            )}
            <div className="flex flex-wrap gap-3 border-t border-border pt-5">
              <Button type="button" variant="primary" onClick={handleLocalPreflight}>
                Run local preflight
              </Button>
              <Button type="button" variant="secondary" onClick={handleStartOver}>
                Reset workspace
              </Button>
            </div>
            {state.imageFile && (
              <div className="space-y-3 rounded-2xl border border-border bg-muted-bg/60 p-4">
                <h3 className="font-display text-sm font-bold text-foreground">
                  Optional AI image review
                </h3>
                <AiAnalysisDisclosure />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={aiBusy}
                    onClick={() => handleAiAnalyze()}
                  >
                    {aiBusy ? "Analyzing…" : "Analyze image with AI"}
                  </Button>
                  {state.aiStatus === "success" && !aiBusy && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleAiAnalyze({ force: true })}
                    >
                      Analyze again
                    </Button>
                  )}
                </div>
                {state.aiError && <StatusMessage variant="error" title={state.aiError} />}
                {state.aiStatus === "stale" && (
                  <StatusMessage variant="review" title="Content changed">
                    Run AI analysis again to refresh image findings.
                  </StatusMessage>
                )}
              </div>
            )}
          </div>
        </AppPanel>

        <div id="workspace-results">
          {!state.results && (
            <>
              {state.inputsDirty && (
                <StatusMessage variant="review" title="Inputs changed">
                  Run local preflight again to refresh results.
                </StatusMessage>
              )}
              {!state.inputsDirty && (
                <ResultsEmptyState onRunPreflight={handleLocalPreflight} />
              )}
            </>
          )}
          {state.results && (
            <PreflightResultsDashboard
              results={state.results}
              onRefresh={handleLocalPreflight}
              inputsDirty={state.inputsDirty}
            />
          )}
        </div>
      </div>

      {state.results && (
        <FindingsResultsPanel
          results={state.results}
          workingCaption={state.workingCaption}
          onApplyFix={handleApplyFix}
        />
      )}

      {state.results && (
        <SocialAiRemediationSection state={state} dispatch={dispatch} />
      )}

      {state.aiAnalysis && state.aiStatus === "success" && (
        <AiImageReviewSection
          analysis={state.aiAnalysis}
          onUseSuggestedAlt={() =>
            dispatch({
              type: "SET_ALT_TEXT",
              altText: state.aiAnalysis!.suggestedAltText,
              source: "ai_applied",
            })
          }
          onUseImprovedAlt={(text) =>
            dispatch({ type: "SET_ALT_TEXT", altText: text, source: "ai_applied" })
          }
        />
      )}

      <ImageAiRemediationSection state={state} dispatch={dispatch} />

      <div id="workspace-enhance" className="space-y-6">
        <AppPanel
          id="visual-accessibility"
          title="Visual accessibility"
          description="Measure WCAG contrast in your browser. Does not change your readiness score or call AI."
        >
          <VisualAccessibilityPanel
            mode="embedded"
            imageFile={state.imageFile}
            imagePreviewUrl={state.imagePreviewUrl}
            aiAnalysis={state.aiStatus === "success" ? state.aiAnalysis : null}
            onContrastSnapshotChange={setContrastSnapshot}
          />
        </AppPanel>

        <AppPanel
          id="screen-reader-preview"
          title="Screen reader experience preview"
          description="Approximate reading order and listening noise—local only, not an emulator."
        >
          <ScreenReaderExperiencePanel
            mode="embedded"
            caption={state.workingCaption}
            altText={state.altText}
            hasImage={Boolean(state.imageFile)}
            platform={state.platform}
            altTextSource={state.altTextSource}
            aiAnalysis={state.aiStatus === "success" ? state.aiAnalysis : null}
            onApplyDraft={(draft) =>
              dispatch({
                type: "APPLY_FIX",
                workingCaption: draft,
                undoCaption: state.workingCaption,
              })
            }
            onEngaged={() => setScreenReaderEngaged(true)}
          />
        </AppPanel>
      </div>

      <div id="workspace-publish">
        <PlatformPublishingSection
          platform={state.platform}
          caption={state.workingCaption}
          altText={state.altText}
          hasImage={Boolean(state.imageFile)}
          phase1={state.results}
          aiStatus={state.aiStatus}
          hasAiAnalysis={Boolean(state.aiAnalysis)}
          contrastSnapshot={contrastSnapshot}
          experienceLevel={experienceLevel}
          showPlatformHeader={showPlatformHeader}
        />
        <div className="mt-8">
          <PreflightReportGenerator
            source={reportSource}
            imagePreviewUrl={state.imagePreviewUrl}
          />
        </div>
      </div>

      <WorkingCaption
        value={state.workingCaption}
        onChange={(workingCaption) =>
          dispatch({ type: "SET_WORKING_CAPTION", workingCaption })
        }
        onCopy={handleCopy}
        copyMessage={state.copyMessage}
        canUndo={Boolean(state.undoCaption)}
        onUndo={() => {
          if (state.undoCaption) {
            dispatch({ type: "UNDO_FIX", workingCaption: state.undoCaption });
          }
        }}
      />
    </ToolWorkspace>
  );
}
