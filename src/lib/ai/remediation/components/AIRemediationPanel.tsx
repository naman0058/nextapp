"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import type { AiRemediationEntry } from "@/lib/ai/remediation/client/aiRemediationEntry";
import { fetchAiRemediation } from "@/lib/ai/remediation/client/fetchAiRemediation";
import {
  AI_REMEDIATION_BUTTON_LABEL,
  AI_REMEDIATION_DISCLOSURE,
  disclosureForSource,
  buttonLabelForSource,
} from "@/lib/ai/remediation/remediationDisclosure";
import { formatAiRemediationMarkdown } from "@/lib/ai/remediation/utils/formatAiRemediationMarkdown";
import type {
  CodeFramework,
  RemediationFacts,
  RemediationSource,
} from "@/lib/ai/remediation/types";

const DISCLOSURE_KEY = "acps_ai_remediation_disclosure_ack";

const FRAMEWORKS: { value: CodeFramework; label: string }[] = [
  { value: "generic_html", label: "Generic HTML" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
];

export type AIRemediationBuildRequest = {
  facts: RemediationFacts;
  deterministicGuidance?: string[];
  frameworkPreference?: CodeFramework;
};

export type AIRemediationPanelProps = {
  panelId: string;
  source: RemediationSource;
  sessionId: string | null;
  sessionReady?: boolean;
  scanId: string;
  entry: AiRemediationEntry | null;
  stale?: boolean;
  staleMessage?: string;
  onEntry: (entry: AiRemediationEntry) => void;
  buildRequest: () => AIRemediationBuildRequest;
  buttonLabel?: string;
  disclosureText?: string;
  headerExtra?: ReactNode;
  showFrameworkPicker?: boolean;
  frameworkPreference?: CodeFramework;
  onFrameworkChange?: (f: CodeFramework) => void;
  skipGenerateIfCached?: (entry: AiRemediationEntry) => boolean;
  children?: ReactNode;
  renderBeforeReport?: ReactNode;
  renderSuggestedContent?: (report: AiRemediationEntry["report"]) => ReactNode;
  renderFooterActions?: (entry: AiRemediationEntry) => ReactNode;
  onRescanVerify?: () => void;
  className?: string;
};

export function AIRemediationPanel({
  panelId,
  source,
  sessionId,
  sessionReady = sessionId !== null,
  scanId,
  entry,
  stale = false,
  staleMessage = "Generated for previous content — generate again after you update inputs.",
  onEntry,
  buildRequest,
  buttonLabel,
  disclosureText,
  headerExtra,
  showFrameworkPicker = false,
  frameworkPreference = "generic_html",
  onFrameworkChange,
  skipGenerateIfCached,
  children,
  renderBeforeReport,
  renderSuggestedContent,
  renderFooterActions,
  onRescanVerify,
  className = "mt-4 border-t border-border pt-4",
}: AIRemediationPanelProps) {
  const frameworkId = useId();
  const inFlight = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);
  const [showDisclosure, setShowDisclosure] = useState(() => {
    if (typeof sessionStorage === "undefined") return true;
    return sessionStorage.getItem(DISCLOSURE_KEY) !== "1";
  });

  const effectiveButtonLabel =
    buttonLabel ?? buttonLabelForSource(source) ?? AI_REMEDIATION_BUTTON_LABEL;
  const effectiveDisclosure =
    disclosureText ?? disclosureForSource(source) ?? AI_REMEDIATION_DISCLOSURE;

  async function generate(force: boolean) {
    if (inFlight.current || !sessionId || !sessionReady) return;
    if (!force && entry && !stale) {
      const shouldSkip = skipGenerateIfCached
        ? skipGenerateIfCached(entry)
        : true;
      if (shouldSkip) return;
    }
    inFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const { facts, deterministicGuidance, frameworkPreference: fp } =
        buildRequest();
      const framework = showFrameworkPicker ? frameworkPreference : fp;
      const result = await fetchAiRemediation({
        source,
        sessionId,
        scanId,
        facts,
        deterministicGuidance,
        frameworkPreference: framework ?? "generic_html",
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onEntry({
        report: result.data.report,
        facts: result.data.facts,
        stale: false,
        generatedAt: result.data.generatedAt,
        cached: result.data.cached,
        frameworkPreference: framework ?? "generic_html",
      });
    } catch {
      setError("AI remediation could not be generated.");
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }

  function ackDisclosure() {
    sessionStorage.setItem(DISCLOSURE_KEY, "1");
    setShowDisclosure(false);
  }

  async function copyMarkdown() {
    if (!entry) return;
    await navigator.clipboard.writeText(formatAiRemediationMarkdown(entry.report));
    setCopyMsg("AI remediation copied.");
    setTimeout(() => setCopyMsg(null), 3000);
  }

  const displayFacts = entry?.facts ?? {};
  const entryStale = entry?.stale ?? stale;

  return (
    <section className={className} aria-labelledby={`ai-remediation-${panelId}`}>
      <div className="flex flex-wrap items-center gap-2">
        <h4 id={`ai-remediation-${panelId}`} className="font-semibold">
          AI-Assisted Remediation
        </h4>
        <span className="rounded bg-muted px-2 py-0.5 text-xs">Optional</span>
        {headerExtra}
        {typeof displayFacts.impact === "string" && (
          <span className="rounded border border-border px-2 py-0.5 text-xs">
            Impact: {displayFacts.impact}
          </span>
        )}
      </div>

      {children}

      {showDisclosure && (
        <p className="mt-2 text-xs text-muted">{effectiveDisclosure}</p>
      )}

      <div className="mt-3 flex flex-wrap items-end gap-3">
        {showFrameworkPicker && onFrameworkChange && (
          <label className="text-xs">
            <span className="block font-medium" id={frameworkId}>
              Code framework
            </span>
            <select
              className="mt-1 rounded border border-border bg-background px-2 py-1"
              value={frameworkPreference}
              aria-labelledby={frameworkId}
              disabled={loading}
              onChange={(e) => onFrameworkChange(e.target.value as CodeFramework)}
            >
              {FRAMEWORKS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          type="button"
          disabled={loading || !sessionReady}
          className="rounded border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
          onClick={() => {
            if (showDisclosure) ackDisclosure();
            void generate(false);
          }}
        >
          {loading ? "Generating…" : effectiveButtonLabel}
        </button>
        {entry && (
          <button
            type="button"
            disabled={loading || !sessionReady}
            className="rounded border border-border px-3 py-1.5 text-xs disabled:opacity-50"
            onClick={() => {
              if (showDisclosure) ackDisclosure();
              void generate(true);
            }}
          >
            Regenerate
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-700" role="alert">
          {error}
        </p>
      )}

      {renderBeforeReport}

      {entry && (
        <div className="mt-4 space-y-3 rounded-lg border border-border p-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold">
              AI-Assisted
            </span>
            {entryStale && (
              <span className="text-xs text-amber-800" role="status">
                {staleMessage}
              </span>
            )}
            {entry.cached && !entryStale && (
              <span className="text-xs text-muted">Loaded from session cache</span>
            )}
          </div>

          <RemediationBlock title="Problem Summary" body={entry.report.problemSummary} />
          <RemediationBlock title="Why It Matters" body={entry.report.whyItMatters} />
          <RemediationList title="Recommended Approach" items={entry.report.recommendedApproach} />

          {entry.report.suggestedContent &&
            (renderSuggestedContent ? (
              renderSuggestedContent(entry.report)
            ) : (
              <RemediationBlock
                title="Suggested Content"
                body={entry.report.suggestedContent}
              />
            ))}

          {entry.report.suggestedCode?.code && (
            <div>
              <p className="font-medium">Possible Implementation Pattern</p>
              <CopyCodeBlock
                code={entry.report.suggestedCode.code}
                label="Copy suggested code"
              />
              <p className="mt-1 text-xs text-muted">
                {entry.report.suggestedCode.explanation}
              </p>
            </div>
          )}

          {entry.report.alternatives.length > 0 && (
            <div>
              <p className="font-medium">Alternatives</p>
              <ul className="mt-1 list-disc pl-5 text-sm">
                {entry.report.alternatives.map((a) => (
                  <li key={`${a.label}-${a.explanation.slice(0, 40)}`}>
                    <span className="font-medium">{a.label}:</span> {a.explanation}
                    {a.content ? (
                      <p className="mt-1 whitespace-pre-wrap text-muted">{a.content}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <RemediationList title="Mistakes to Avoid" items={entry.report.mistakesToAvoid} />
          <RemediationList title="Acceptance Criteria" items={entry.report.acceptanceCriteria} />
          <RemediationList title="Verification Steps" items={entry.report.verificationSteps} />
          <RemediationList title="Human Review" items={entry.report.humanReview} />
          <RemediationList title="Assumptions" items={entry.report.assumptions} />
          <RemediationList title="Limitations" items={entry.report.limitations} />

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              className="rounded border border-border px-3 py-1.5 text-xs font-medium"
              onClick={() => void copyMarkdown()}
            >
              Copy AI Remediation
            </button>
            {renderFooterActions?.(entry)}
            {onRescanVerify && (
              <button
                type="button"
                className="rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                onClick={onRescanVerify}
              >
                Rescan to Verify
              </button>
            )}
          </div>
          <p className="sr-only" aria-live="polite">
            {copyMsg}
          </p>
        </div>
      )}
    </section>
  );
}

function RemediationBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="font-medium">{title}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm">{body}</p>
    </div>
  );
}

function RemediationList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="font-medium">{title}</p>
      <ul className="mt-1 list-disc pl-5 text-sm">
        {items.map((item) => (
          <li key={item.slice(0, 60)}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function CopyCodeBlock({ code, label }: { code: string; label: string }) {
  const [status, setStatus] = useState<string | null>(null);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Copied");
    } catch {
      setStatus("Could not copy");
    }
    setTimeout(() => setStatus(null), 2000);
  }
  return (
    <div className="mt-2">
      <pre className="max-w-full overflow-x-auto rounded border border-border bg-background p-3 text-xs">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={() => void copy()}
        className="mt-2 rounded border border-border px-2 py-1 text-xs font-medium"
      >
        {label}
      </button>
      {status && (
        <span className="ml-2 text-xs text-muted" role="status">
          {status}
        </span>
      )}
    </div>
  );
}
