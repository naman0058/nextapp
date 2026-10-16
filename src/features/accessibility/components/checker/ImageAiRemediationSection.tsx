"use client";

import { useMemo } from "react";
import type { CheckerState } from "@/features/accessibility/components/checker/checkerReducer";
import type { CheckerAction } from "@/features/accessibility/components/checker/checkerReducer";
import { buildImageRemediationContext } from "@/lib/ai/remediation/adapters/buildImageRemediationContext";
import { AIRemediationPanel } from "@/lib/ai/remediation/components/AIRemediationPanel";
import { useAiRemediationSession } from "@/lib/ai/remediation/client/useAiRemediationSession";
import type { AiRemediationEntry } from "@/lib/ai/remediation/client/aiRemediationEntry";

type Props = {
  state: CheckerState;
  dispatch: React.Dispatch<CheckerAction>;
};

export function ImageAiRemediationSection({ state, dispatch }: Props) {
  const { sessionId, ready } = useAiRemediationSession();

  const context = useMemo(() => {
    if (!state.imageFile) return null;
    return buildImageRemediationContext({
      sourceTool: "social_checker",
      userAltText: state.altText,
      caption: state.workingCaption,
      hasImage: true,
      results: state.results,
      aiAnalysis: state.aiStatus === "success" ? state.aiAnalysis : null,
    });
  }, [
    state.imageFile,
    state.altText,
    state.workingCaption,
    state.results,
    state.aiAnalysis,
    state.aiStatus,
  ]);

  if (!state.imageFile || !context) return null;

  const scanId = String(context.facts.issueFingerprint ?? "image");

  return (
    <AIRemediationPanel
      panelId="image-alt"
      source="image"
      sessionId={sessionId}
      sessionReady={ready}
      scanId={scanId}
      entry={state.imageRemediation}
      stale={state.imageRemediation?.stale ?? false}
      className="mt-6 border-t border-border pt-4"
      buildRequest={() => ({
        facts: context.facts,
        deterministicGuidance: context.deterministicGuidance,
      })}
      onEntry={(entry: AiRemediationEntry) =>
        dispatch({ type: "SET_IMAGE_REMEDIATION", entry })
      }
      renderSuggestedContent={(report) =>
        report.suggestedContent ? (
          <div>
            <p className="font-medium">Suggested alt (review required)</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{report.suggestedContent}</p>
            <button
              type="button"
              className="mt-2 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              onClick={() =>
                dispatch({
                  type: "SET_ALT_TEXT",
                  altText: report.suggestedContent!,
                  source: "ai_applied",
                })
              }
            >
              Use This Alt Text
            </button>
          </div>
        ) : null
      }
      renderFooterActions={(entry) => (
        <>
          {entry.report.alternatives.map((alt) =>
            alt.content ? (
              <button
                key={alt.label}
                type="button"
                className="rounded border border-border px-3 py-1.5 text-xs"
                onClick={() =>
                  dispatch({
                    type: "SET_ALT_TEXT",
                    altText: alt.content!,
                    source: "ai_applied",
                  })
                }
              >
                Use {alt.label}
              </button>
            ) : null,
          )}
          {entry.report.suggestedContent && (
            <button
              type="button"
              className="rounded border border-border px-3 py-1.5 text-xs"
              onClick={() => {
                void navigator.clipboard.writeText(entry.report.suggestedContent!);
              }}
            >
              Copy Alt
            </button>
          )}
        </>
      )}
    >
      {state.aiStatus !== "success" && (
        <p className="mt-2 text-xs text-amber-900" role="status">
          Run Analyze Image with AI first for stronger alt suggestions. Remediation reuses
          existing session analysis only — it does not upload the image again.
        </p>
      )}
      <p className="mt-2 text-xs text-muted">
        Human review required — AI cannot know your post purpose or brand context perfectly.
      </p>
    </AIRemediationPanel>
  );
}
