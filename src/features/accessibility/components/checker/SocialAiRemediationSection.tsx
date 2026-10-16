"use client";

import { useMemo, useState } from "react";
import type { CheckerState } from "@/features/accessibility/components/checker/checkerReducer";
import type { CheckerAction } from "@/features/accessibility/components/checker/checkerReducer";
import { buildSocialRemediationContext } from "@/lib/ai/remediation/adapters/buildSocialRemediationContext";
import { AIRemediationPanel } from "@/lib/ai/remediation/components/AIRemediationPanel";
import { useAiRemediationSession } from "@/lib/ai/remediation/client/useAiRemediationSession";
import {
  formatContentComparison,
  type ContentComparisonLine,
} from "@/lib/ai/remediation/utils/formatContentComparison";
import type { AiRemediationEntry } from "@/lib/ai/remediation/client/aiRemediationEntry";

type Props = {
  state: CheckerState;
  dispatch: React.Dispatch<CheckerAction>;
};

export function SocialAiRemediationSection({ state, dispatch }: Props) {
  const { sessionId, ready } = useAiRemediationSession();
  const [showCompare, setShowCompare] = useState(false);

  const context = useMemo(() => {
    if (!state.results) return null;
    return buildSocialRemediationContext({
      platform: state.platform,
      originalCaption: state.caption,
      workingCaption: state.workingCaption,
      altText: state.altText,
      hasImage: Boolean(state.imageFile),
      results: state.results,
      aiAnalysis: state.aiStatus === "success" ? state.aiAnalysis : null,
    });
  }, [
    state.results,
    state.platform,
    state.caption,
    state.workingCaption,
    state.altText,
    state.imageFile,
    state.aiAnalysis,
    state.aiStatus,
  ]);

  if (!state.results || !context) return null;

  const scanId = String(context.facts.issueFingerprint ?? "social");

  return (
    <AIRemediationPanel
      panelId="social-caption"
      source="social"
      sessionId={sessionId}
      sessionReady={ready}
      scanId={scanId}
      entry={state.socialRemediation}
      stale={state.socialRemediation?.stale ?? false}
      buildRequest={() => ({
        facts: context.facts,
        deterministicGuidance: context.deterministicGuidance,
      })}
      onEntry={(entry: AiRemediationEntry) =>
        dispatch({ type: "SET_SOCIAL_REMEDIATION", entry })
      }
      headerExtra={
        <span className="rounded border border-border px-2 py-0.5 text-xs">
          Deterministic Findings
        </span>
      }
      renderSuggestedContent={(report) => (
        <SuggestedCaptionBlock
          original={state.caption}
          suggested={report.suggestedContent ?? ""}
          showCompare={showCompare}
          onToggleCompare={() => setShowCompare((v) => !v)}
          onApply={(text) =>
            dispatch({
              type: "APPLY_FIX",
              workingCaption: text,
              undoCaption: state.workingCaption,
            })
          }
        />
      )}
      renderFooterActions={(entry) => (
        <>
          {entry.report.suggestedContent && (
            <button
              type="button"
              className="rounded border border-border px-3 py-1.5 text-xs font-medium"
              onClick={() => {
                void navigator.clipboard.writeText(entry.report.suggestedContent!);
              }}
            >
              Copy Improved Caption
            </button>
          )}
        </>
      )}
    />
  );
}

function SuggestedCaptionBlock({
  original,
  suggested,
  showCompare,
  onToggleCompare,
  onApply,
}: {
  original: string;
  suggested: string;
  showCompare: boolean;
  onToggleCompare: () => void;
  onApply: (text: string) => void;
}) {
  if (!suggested) return null;
  const lines = showCompare ? formatContentComparison(original, suggested) : [];

  return (
    <div>
      <p className="font-medium">Suggested Accessible Version</p>
      <p className="mt-1 whitespace-pre-wrap text-sm">{suggested}</p>
      <p className="mt-1 text-xs text-muted">
        Original caption is unchanged until you apply a suggestion.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          onClick={() => onApply(suggested)}
        >
          Apply Suggested Caption Revision
        </button>
        <button
          type="button"
          className="rounded border border-border px-3 py-1.5 text-xs"
          onClick={onToggleCompare}
        >
          {showCompare ? "Hide comparison" : "Compare Original vs Suggested"}
        </button>
      </div>
      {showCompare && (
        <ComparisonList lines={lines} className="mt-3 rounded border border-border p-2 text-xs" />
      )}
    </div>
  );
}

export function ComparisonList({
  lines,
  className,
}: {
  lines: ContentComparisonLine[];
  className?: string;
}) {
  return (
    <ul className={`space-y-1 ${className ?? ""}`}>
      {lines.map((line, i) => (
        <li key={i}>
          {line.kind === "same" && (
            <span className="text-muted">{line.original}</span>
          )}
          {line.kind === "removed" && (
            <span className="text-red-800 line-through">{line.original}</span>
          )}
          {line.kind === "added" && (
            <span className="text-green-800">{line.suggested}</span>
          )}
          {line.kind === "changed" && (
            <>
              <span className="text-red-800 line-through">{line.original}</span>
              {" → "}
              <span className="text-green-800">{line.suggested}</span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
