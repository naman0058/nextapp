"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AppPanel } from "@/components/app/AppPanel";
import { ResultMetricTile } from "@/components/results/ResultMetricTile";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import {
  ACCEPTED_VIDEO_MIME_TYPES,
  MAX_VIDEO_DURATION_SECONDS,
  MAX_VIDEO_FILE_SIZE_BYTES,
  VIDEO_DURATION_LIMIT_MESSAGE,
  VIDEO_UNSUPPORTED_FORMAT_MESSAGE,
} from "@/features/video/constants/videoLimits";
import { getPlatformVideoGuidance } from "@/features/video/config/platformVideoGuidance";
import {
  initialVideoState,
  videoReducer,
} from "@/features/video/components/videoReducer";
import type { CaptionCue } from "@/features/video/types/captions";
import { analyzeCaptionQuality } from "@/features/video/utils/captions/analyzeCaptionQuality";
import { buildCaptionCues } from "@/features/video/utils/captions/buildCaptionCues";
import {
  applySpeakerRename,
  downloadTextFile,
  mergeWithNext,
  splitCue,
} from "@/features/video/utils/captions/captionEditHelpers";
import { generatePlainTranscript } from "@/features/video/utils/captions/generatePlainTranscript";
import { generateSRT } from "@/features/video/utils/captions/generateSRT";
import { generateVTT } from "@/features/video/utils/captions/generateVTT";
import { sanitizeExportBasename } from "@/features/video/utils/captions/sanitizeExportBasename";
import { extractVideoFrames } from "@/features/video/utils/client/extractVideoFrames";
import { readVideoMetadata } from "@/features/video/utils/client/readVideoMetadata";
import { uploadTemporaryVideo } from "@/features/video/utils/client/uploadTemporaryVideo";
import { buildVideoFingerprint } from "@/features/video/utils/client/videoFingerprint";
import {
  loadVideoSession,
  saveVideoSession,
} from "@/features/video/utils/videoSessionStorage";
import type { TranscriptionApiResult } from "@/features/video/types/transcription";
import { SOCIAL_PLATFORM_LABELS } from "@/constants";
import type { SocialPlatform } from "@/types";
import { PreflightReportGenerator } from "@/features/reports/components/PreflightReportGenerator";
import { useVideoReportSource } from "@/features/reports/hooks/useVideoReportSource";
import { VideoCueAiRemediationSection } from "@/features/video/components/VideoCueAiRemediationSection";
import type { AiRemediationEntry } from "@/lib/ai/remediation/client/aiRemediationEntry";
import { collectVideoCueRemediationCandidates } from "@/lib/ai/remediation/report";

const PLATFORMS: SocialPlatform[] = ["instagram", "facebook", "linkedin", "x"];

const SOUND_PRESETS = [
  "[Music]",
  "[Laughter]",
  "[Applause]",
  "[Door slams]",
  "[Alarm sounds]",
] as const;

type VideoAccessibilityCheckerPageProps = {
  storageConfigured: boolean;
};

export function VideoAccessibilityCheckerPage({
  storageConfigured,
}: VideoAccessibilityCheckerPageProps) {
  const [state, dispatch] = useReducer(videoReducer, initialVideoState, () => {
    const session = loadVideoSession();
    if (session?.cues.length) {
      return {
        ...initialVideoState,
        cues: session.cues,
        platform: session.platform ?? "instagram",
        speakerLabels: session.speakerLabels,
        review: session.review,
        visualReview: session.visualReview ?? null,
        visualStale: session.visualStale ?? false,
        phase: "ready" as const,
      };
    }
    return initialVideoState;
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const transcribeAbortRef = useRef<AbortController | null>(null);
  const [activeCueId, setActiveCueId] = useState<string | null>(null);
  const [transcribeAgain, setTranscribeAgain] = useState(false);
  const [aiRemediationCueId, setAiRemediationCueId] = useState<string | null>(null);
  const [cueAiRemediation, setCueAiRemediation] = useState<
    Record<string, AiRemediationEntry>
  >(() => loadVideoSession()?.cueAiRemediationByCueId ?? {});

  const quality = useMemo(
    () =>
      analyzeCaptionQuality(
        state.cues,
        state.metadata?.durationSeconds,
      ),
    [state.cues, state.metadata?.durationSeconds],
  );

  useEffect(() => {
    saveVideoSession({
      fingerprint: state.fingerprint ?? undefined,
      cues: state.cues,
      platform: state.platform,
      speakerLabels: state.speakerLabels,
      review: state.review,
      visualReview: state.visualReview,
      visualStale: state.visualStale,
      fileName: state.file?.name,
      durationSeconds: state.metadata?.durationSeconds,
      format: state.file?.type,
      detectSpeakers: state.detectSpeakers,
      captionQuality: quality,
      transcriptGenerated: state.cues.length > 0,
      cueAiRemediationByCueId: cueAiRemediation,
    });
  }, [
    state.fingerprint,
    state.cues,
    state.platform,
    state.speakerLabels,
    state.review,
    state.visualReview,
    state.visualStale,
    state.file,
    state.metadata?.durationSeconds,
    state.detectSpeakers,
    quality,
    cueAiRemediation,
  ]);

  useEffect(() => {
    return () => {
      if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    };
  }, [state.previewUrl]);

  const vttUrl = useMemo(() => {
    if (state.cues.length === 0) return undefined;
    const vtt = generateVTT(state.cues);
    return URL.createObjectURL(new Blob([vtt], { type: "text/vtt" }));
  }, [state.cues]);

  useEffect(() => {
    return () => {
      if (vttUrl) URL.revokeObjectURL(vttUrl);
    };
  }, [vttUrl]);

  const transcript = useMemo(
    () => generatePlainTranscript(state.cues),
    [state.cues],
  );

  const exportBase = sanitizeExportBasename(state.file?.name ?? "video");

  const videoAiCandidates = useMemo(
    () => collectVideoCueRemediationCandidates(cueAiRemediation, state.cues),
    [cueAiRemediation, state.cues],
  );

  const videoReportSource = useVideoReportSource({
    platform: state.platform,
    fileName: state.file?.name,
    durationSeconds: state.metadata?.durationSeconds,
    format: state.file?.type,
    detectSpeakers: state.detectSpeakers,
    cues: state.cues,
    review: state.review,
    visualReview: state.visualReview,
    visualStale: state.visualStale,
    captionQuality: quality,
    transcriptGenerated: state.cues.length > 0,
    aiRemediationCandidates: videoAiCandidates,
  });

  const preflightLabel = useMemo(() => {
    if (quality.error > 0) return "Important items need attention";
    if (
      quality.review > 0 ||
      !state.review.transcriptReviewed ||
      !state.review.timingReviewed
    ) {
      return "Several items need review";
    }
    if (state.cues.length === 0) return "Upload a video to begin";
    return "Ready for final review";
  }, [quality, state.review, state.cues.length]);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    const mime = file.type.toLowerCase();
    if (!ACCEPTED_VIDEO_MIME_TYPES.includes(mime as (typeof ACCEPTED_VIDEO_MIME_TYPES)[number])) {
      dispatch({ type: "SET_ERROR", message: VIDEO_UNSUPPORTED_FORMAT_MESSAGE });
      return;
    }
    if (file.size > MAX_VIDEO_FILE_SIZE_BYTES) {
      dispatch({
        type: "SET_ERROR",
        message: `Maximum upload size is ${Math.floor(MAX_VIDEO_FILE_SIZE_BYTES / (1024 * 1024))} MB.`,
      });
      return;
    }
    try {
      const metadata = await readVideoMetadata(file);
      if (metadata.durationSeconds > MAX_VIDEO_DURATION_SECONDS) {
        dispatch({ type: "SET_ERROR", message: VIDEO_DURATION_LIMIT_MESSAGE });
        return;
      }
      if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
      const previewUrl = URL.createObjectURL(file);
      dispatch({
        type: "SET_FILE",
        file,
        previewUrl,
        metadata,
        fingerprint: buildVideoFingerprint(file),
      });
    } catch {
      dispatch({ type: "SET_ERROR", message: "Could not read video metadata." });
    }
  };

  const runTranscription = useCallback(async () => {
    if (!state.file || !storageConfigured) return;

    if (
      !transcribeAgain &&
      state.cachedTranscription &&
      state.fingerprint &&
      loadVideoSession()?.fingerprint === state.fingerprint &&
      state.cues.length > 0
    ) {
      return;
    }

    transcribeAbortRef.current?.abort();
    const controller = new AbortController();
    transcribeAbortRef.current = controller;

    try {
      dispatch({ type: "UPLOAD_START" });
      const mediaRef = await uploadTemporaryVideo(state.file, (percent) => {
        dispatch({ type: "UPLOAD_PROGRESS", percent });
      });
      if (controller.signal.aborted) return;

      dispatch({ type: "TRANSCRIBE_START" });
      const res = await fetch("/api/accessibility/transcribe-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaRef,
          detectSpeakers: state.detectSpeakers,
          language: state.language,
          vocabularyHints: state.vocabularyHints,
        }),
        signal: controller.signal,
      });
      const data = (await res.json()) as TranscriptionApiResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Transcription failed.");
      }

      const cues = buildCaptionCues(data.words, data.segments, {
        videoDuration: state.metadata?.durationSeconds,
      });

      if (!data.fullText.trim() && cues.length === 0) {
        dispatch({
          type: "TRANSCRIBE_SUCCESS",
          transcription: data,
          cues: [],
        });
        dispatch({
          type: "SET_ERROR",
          message:
            "No clear spoken dialogue was detected. Review non-speech audio and visual information manually.",
        });
        return;
      }

      dispatch({ type: "TRANSCRIBE_SUCCESS", transcription: data, cues });
      setTranscribeAgain(false);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        dispatch({ type: "PHASE_IDLE" });
        return;
      }
      dispatch({
        type: "SET_ERROR",
        message:
          err instanceof Error
            ? err.message
            : "Transcription could not be completed. Please try again.",
      });
    }
  }, [
    state.file,
    state.detectSpeakers,
    state.language,
    state.vocabularyHints,
    state.metadata,
    state.cachedTranscription,
    state.fingerprint,
    state.cues.length,
    storageConfigured,
    transcribeAgain,
  ]);

  const updateCue = (id: string, patch: Partial<CaptionCue>) => {
    dispatch({
      type: "SET_CUES",
      cues: state.cues.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
    dispatch({ type: "MARK_VISUAL_STALE" });
  };

  const runVisualReview = async () => {
    if (!state.previewUrl || state.cues.length === 0) return;
    dispatch({ type: "VISUAL_START" });
    try {
      const frames = await extractVideoFrames(
        state.previewUrl,
        state.metadata?.durationSeconds ?? 60,
      );
      const res = await fetch("/api/accessibility/analyze-video-frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frames,
          platform: state.platform,
          transcriptExcerpt: transcript.slice(0, 4000),
          captionSummary: state.cues
            .slice(0, 12)
            .map((c) => c.text)
            .join(" "),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Visual review failed.");
      }
      dispatch({ type: "VISUAL_SUCCESS", review: data });
    } catch {
      dispatch({ type: "VISUAL_FAIL" });
      dispatch({
        type: "SET_ERROR",
        message:
          "Visual review could not be completed. Your transcript and captions are still available.",
      });
    }
  };

  const busy =
    state.phase === "uploading" || state.phase === "transcribing";

  return (
    <div className="space-y-8">
      {!storageConfigured && (
        <StatusMessage
          variant="error"
          title="Video processing is not configured on this deployment."
        />
      )}

      <AppPanel
        title="Video accessibility preflight"
        description="AI-assisted caption preparation for prerecorded MP4/WebM — human review recommended."
      >
        <p className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm leading-relaxed text-indigo-950/90">
          Video transcription requires temporary processing. Your video is uploaded
          to private temporary storage and sent to OpenAI for transcription. This
          application does not intentionally keep the uploaded video after processing.
          Generated transcript and captions remain in the current browser session unless
          you download them.
        </p>

        <div className="mt-4 space-y-2">
          <label className="block text-sm font-semibold text-foreground" htmlFor="video-file">
            Upload video (MP4 or WebM, max {Math.floor(MAX_VIDEO_FILE_SIZE_BYTES / (1024 * 1024))} MB)
          </label>
          <input
            id="video-file"
            type="file"
            accept={ACCEPTED_VIDEO_MIME_TYPES.join(",")}
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              void handleFile(f ?? null);
              e.target.value = "";
            }}
            className="text-sm"
          />
        </div>

        {state.file && state.metadata && (
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Filename</dt>
              <dd className="font-medium">{state.file.name}</dd>
            </div>
            <div>
              <dt className="text-muted">Size</dt>
              <dd>{(state.file.size / (1024 * 1024)).toFixed(2)} MB</dd>
            </div>
            <div>
              <dt className="text-muted">Duration</dt>
              <dd>{state.metadata.durationSeconds.toFixed(1)}s</dd>
            </div>
            <div>
              <dt className="text-muted">Dimensions</dt>
              <dd>
                {state.metadata.width}×{state.metadata.height}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Format</dt>
              <dd>{state.file.type}</dd>
            </div>
          </dl>
        )}

        {state.previewUrl && (
          <div className="mt-4">
            <video
              ref={videoRef}
              controls
              className="max-h-80 w-full rounded-2xl border border-border bg-black"
              src={state.previewUrl}
              onTimeUpdate={() => {
                const t = videoRef.current?.currentTime ?? 0;
                const active = state.cues.find((c) => t >= c.start && t <= c.end);
                setActiveCueId(active?.id ?? null);
              }}
            >
              {vttUrl ? (
                <track kind="captions" src={vttUrl} label="Preflight captions" default />
              ) : null}
            </video>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-semibold">Audio language</span>
            <select
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              value={state.language}
              onChange={(e) => dispatch({ type: "SET_LANGUAGE", value: e.target.value })}
            >
              <option value="auto">Auto detect</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={state.detectSpeakers}
              onChange={(e) =>
                dispatch({ type: "SET_DETECT_SPEAKERS", value: e.target.checked })
              }
            />
            Detect speaker changes (optional, may use a different model)
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="font-semibold">Names or special terms (optional)</span>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              value={state.vocabularyHints}
              onChange={(e) => dispatch({ type: "SET_VOCABULARY", value: e.target.value })}
              placeholder="OpenAI, Dr. Rivera"
            />
          </label>
        </div>

        {state.phase === "uploading" && (
          <div className="mt-4">
            <progress max={100} value={state.uploadPercent} className="w-full" />
            <p className="text-sm text-muted">Uploading… {state.uploadPercent}%</p>
          </div>
        )}

        {state.phase === "transcribing" && (
          <p className="mt-4 text-sm font-medium text-foreground" aria-live="polite">
            Generating transcript and timed captions…
          </p>
        )}

        {state.error && (
          <div className="mt-4">
            <StatusMessage variant="error" title={state.error} />
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="primary"
            disabled={!state.file || busy || !storageConfigured}
            onClick={() => void runTranscription()}
          >
            {busy ? "Generating Transcript & Captions…" : "Generate Transcript & Captions"}
          </Button>
          {state.cues.length > 0 && (
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => {
                setTranscribeAgain(true);
                void runTranscription();
              }}
            >
              Transcribe again
            </Button>
          )}
          {busy && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => transcribeAbortRef.current?.abort()}
            >
              Cancel
            </Button>
          )}
        </div>
      </AppPanel>

      {state.cues.length > 0 && (
        <>
          <AppPanel title="Transcript" description="Plain text from your caption cues.">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{transcript}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => void navigator.clipboard.writeText(transcript)}
              >
                Copy transcript
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  downloadTextFile(transcript, `${exportBase}-transcript.txt`)
                }
              >
                Download TXT
              </Button>
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state.review.transcriptReviewed}
                onChange={(e) =>
                  dispatch({
                    type: "SET_REVIEW",
                    key: "transcriptReviewed",
                    value: e.target.checked,
                  })
                }
              />
              I reviewed the transcript against the original audio.
            </label>
            <p className="mt-2 text-xs text-muted">
              Automatic transcription can contain mistakes, especially with names,
              accents, technical terms, background noise, and overlapping speakers.
            </p>
          </AppPanel>

          <AppPanel title="Caption timeline" description="Edit timed cues — source of truth for exports and preview.">
            <ul className="space-y-4">
              {state.cues.map((cue, index) => (
                <li
                  key={cue.id}
                  className={`list-none rounded-2xl border p-4 ${activeCueId === cue.id ? "border-primary bg-primary/5" : "border-border"}`}
                  aria-current={activeCueId === cue.id ? "true" : undefined}
                >
                  <p className="text-xs font-bold text-muted">Caption {index + 1}</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    <label className="text-sm">
                      Caption {index + 1} start time (s)
                      <input
                        type="number"
                        step="0.001"
                        className="mt-1 w-full rounded-lg border border-border px-2 py-1"
                        value={cue.start}
                        onChange={(e) =>
                          updateCue(cue.id, { start: Number(e.target.value) })
                        }
                      />
                    </label>
                    <label className="text-sm">
                      Caption {index + 1} end time (s)
                      <input
                        type="number"
                        step="0.001"
                        className="mt-1 w-full rounded-lg border border-border px-2 py-1"
                        value={cue.end}
                        onChange={(e) =>
                          updateCue(cue.id, { end: Number(e.target.value) })
                        }
                      />
                    </label>
                    {cue.speaker != null && (
                      <label className="text-sm">
                        Speaker
                        <input
                          type="text"
                          className="mt-1 w-full rounded-lg border border-border px-2 py-1"
                          value={state.speakerLabels[cue.speaker] ?? cue.speaker}
                          onChange={(e) => {
                            const labels = {
                              ...state.speakerLabels,
                              [cue.speaker!]: e.target.value,
                            };
                            dispatch({ type: "SET_SPEAKER_LABELS", labels });
                            dispatch({
                              type: "SET_CUES",
                              cues: applySpeakerRename(
                                state.cues,
                                cue.speaker!,
                                e.target.value,
                              ),
                            });
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <label className="mt-2 block text-sm">
                    Caption {index + 1} text
                    <textarea
                      className="mt-1 w-full rounded-lg border border-border px-2 py-1"
                      rows={3}
                      value={cue.text}
                      onChange={(e) => updateCue(cue.id, { text: e.target.value })}
                    />
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        videoRef.current!.currentTime = cue.start;
                      }}
                    >
                      Preview at this cue
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        setAiRemediationCueId((id) => (id === cue.id ? null : cue.id))
                      }
                    >
                      {aiRemediationCueId === cue.id
                        ? "Hide AI caption help"
                        : "AI caption help"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        const [a, b] = splitCue(cue);
                        const next = [...state.cues];
                        next.splice(index, 1, a, b);
                        dispatch({ type: "SET_CUES", cues: next });
                      }}
                    >
                      Split cue
                    </Button>
                    {index < state.cues.length - 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          dispatch({
                            type: "SET_CUES",
                            cues: mergeWithNext(state.cues, index),
                          })
                        }
                      >
                        Merge with next
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        dispatch({
                          type: "SET_CUES",
                          cues: state.cues.filter((c) => c.id !== cue.id),
                        })
                      }
                    >
                      Delete
                    </Button>
                  </div>
                  {aiRemediationCueId === cue.id && (
                    <VideoCueAiRemediationSection
                      cue={cue}
                      cues={state.cues}
                      platform={state.platform}
                      quality={quality}
                      visualReview={state.visualReview}
                      speakerLabelsUserSet={Object.keys(state.speakerLabels).length > 0}
                      onApplySuggested={(cueId, text) => updateCue(cueId, { text })}
                      entry={cueAiRemediation[cue.id] ?? null}
                      onEntryChange={(cueId, newEntry) =>
                        setCueAiRemediation((prev) => ({
                          ...prev,
                          [cueId]: newEntry,
                        }))
                      }
                    />
                  )}
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() => {
                const start = state.metadata?.durationSeconds
                  ? Math.max(0, state.metadata.durationSeconds - 2)
                  : 0;
                dispatch({
                  type: "SET_CUES",
                  cues: [
                    ...state.cues,
                    {
                      id: `cue-${Date.now()}`,
                      start,
                      end: start + 2,
                      text: "[Sound]",
                      soundCue: true,
                    },
                  ],
                });
              }}
            >
              Add caption / sound cue
            </Button>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state.review.timingReviewed}
                onChange={(e) =>
                  dispatch({
                    type: "SET_REVIEW",
                    key: "timingReviewed",
                    value: e.target.checked,
                  })
                }
              />
              I reviewed caption timing while playing the video.
            </label>
          </AppPanel>

          <AppPanel title="Exports">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  downloadTextFile(generateSRT(state.cues), `${exportBase}-captions.srt`)
                }
              >
                Download SRT
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  downloadTextFile(generateVTT(state.cues), `${exportBase}-captions.vtt`)
                }
              >
                Download VTT
              </Button>
            </div>
          </AppPanel>

          <AppPanel title="Non-speech audio review">
            <p className="text-sm text-muted">
              Automatic speech transcription may miss meaningful sounds such as music,
              alarms, laughter, applause, or other audio cues. Review the video manually
              and add important sound descriptions where they affect meaning.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SOUND_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    const start = videoRef.current?.currentTime ?? 0;
                    dispatch({
                      type: "SET_CUES",
                      cues: [
                        ...state.cues,
                        {
                          id: `cue-${Date.now()}`,
                          start,
                          end: start + 2,
                          text: preset,
                          soundCue: true,
                        },
                      ].sort((a, b) => a.start - b.start),
                    });
                  }}
                >
                  Add {preset}
                </Button>
              ))}
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state.review.nonSpeechReviewed}
                onChange={(e) =>
                  dispatch({
                    type: "SET_REVIEW",
                    key: "nonSpeechReviewed",
                    value: e.target.checked,
                  })
                }
              />
              I reviewed meaningful non-speech sounds.
            </label>
          </AppPanel>

          <AppPanel title="Caption quality review">
            <ul className="grid list-none gap-2 sm:grid-cols-3">
              <li>
                <ResultMetricTile label="Ready" value={quality.ready} tone="success" />
              </li>
              <li>
                <ResultMetricTile label="Review" value={quality.review} tone="warning" />
              </li>
              <li>
                <ResultMetricTile label="Error" value={quality.error} tone="danger" />
              </li>
            </ul>
            {quality.findings.length > 0 && (
              <ul className="mt-4 space-y-2 text-sm">
                {quality.findings.slice(0, 12).map((f) => (
                  <li key={f.id} className="rounded-lg border border-border px-3 py-2">
                    <span className="font-semibold">{f.title}</span> — {f.detail}
                  </li>
                ))}
              </ul>
            )}
          </AppPanel>

          {state.detectSpeakers && (
            <AppPanel title="Speaker labels">
              <p className="text-sm text-muted">
                Speaker labels indicate detected speaker changes. Review and rename
                speakers manually.
              </p>
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={state.review.speakerLabelsReviewed}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_REVIEW",
                      key: "speakerLabelsReviewed",
                      value: e.target.checked,
                    })
                  }
                />
                I reviewed speaker labels.
              </label>
            </AppPanel>
          )}

          <AppPanel title="Optional visual information review">
            <p className="text-sm text-muted">
              Visual review is based on sampled frames and may miss brief or unsampled
              visual information.
            </p>
            {state.visualStale && (
              <StatusMessage variant="review" title="Transcript changed — rerun visual coverage review." />
            )}
            <Button
              type="button"
              variant="secondary"
              className="mt-3"
              disabled={state.visualLoading}
              onClick={() => void runVisualReview()}
            >
              {state.visualLoading ? "Reviewing…" : "Review visual information with AI"}
            </Button>
            {state.visualReview && (
              <ul className="mt-4 space-y-3">
                {state.visualReview.observations.map((obs, i) => (
                  <li key={`${obs.timestamp}-${i}`} className="rounded-xl border border-border p-3 text-sm">
                    <p className="font-semibold">
                      {obs.timestamp.toFixed(1)}s — {obs.category.replaceAll("_", " ")}
                    </p>
                    <p className="mt-1">{obs.description}</p>
                    {obs.suggestedAudioDescription && (
                      <p className="mt-2 text-muted">
                        Suggested description: {obs.suggestedAudioDescription}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted">
                      Covered by audio: {obs.likelyCoveredByAudio} · Priority: {obs.priority}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state.review.visualInformationReviewed}
                onChange={(e) =>
                  dispatch({
                    type: "SET_REVIEW",
                    key: "visualInformationReviewed",
                    value: e.target.checked,
                  })
                }
              />
              I reviewed visual information not conveyed by the original audio.
            </label>
          </AppPanel>

          <AppPanel title="Platform publishing guidance">
            <label className="text-sm font-semibold">
              Platform (optional)
              <select
                className="mt-1 block w-full max-w-xs rounded-lg border border-border px-3 py-2"
                value={state.platform}
                onChange={(e) =>
                  dispatch({
                    type: "SET_PLATFORM",
                    platform: e.target.value as SocialPlatform,
                  })
                }
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {SOCIAL_PLATFORM_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>
            {getPlatformVideoGuidance(state.platform) && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
                {getPlatformVideoGuidance(state.platform)!.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </AppPanel>

          <AppPanel title="Video accessibility preflight summary">
            <p className="font-display text-xl font-bold">{preflightLabel}</p>
            <p className="mt-2 text-sm text-muted">
              Prepared in this tool — apply caption files and settings inside your
              platform composer before publishing.
            </p>
          </AppPanel>

          <PreflightReportGenerator
            source={videoReportSource}
            heading="Video accessibility preflight report"
          />
        </>
      )}
    </div>
  );
}
