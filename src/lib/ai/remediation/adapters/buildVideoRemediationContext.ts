import type { CaptionCue, CaptionQualityFinding } from "@/features/video/types/captions";
import type { RemediationFacts } from "@/lib/ai/remediation/types";
import type { SocialPlatform } from "@/types";
import { hashRemediationMaterial } from "@/lib/ai/remediation/adapters/remediationFingerprint";

export type BuildVideoRemediationContextInput = {
  platform: SocialPlatform;
  cue: CaptionCue;
  cues: CaptionCue[];
  qualityFindings: CaptionQualityFinding[];
  visualReviewExcerpt?: string | null;
  speakerLabelsUserSet?: boolean;
};

export type VideoRemediationContext = {
  facts: RemediationFacts;
  deterministicGuidance: string[];
};

const CONTEXT_CUE_CHARS = 120;

function neighborContext(cues: CaptionCue[], index: number): {
  before: string;
  after: string;
} {
  const before =
    index > 0 ? cues[index - 1]!.text.slice(0, CONTEXT_CUE_CHARS) : "";
  const after =
    index < cues.length - 1 ? cues[index + 1]!.text.slice(0, CONTEXT_CUE_CHARS) : "";
  return { before, after };
}

export function buildVideoRemediationContext(
  input: BuildVideoRemediationContextInput,
): VideoRemediationContext {
  const {
    platform,
    cue,
    cues,
    qualityFindings,
    visualReviewExcerpt,
    speakerLabelsUserSet,
  } = input;

  const index = cues.findIndex((c) => c.id === cue.id);
  const { before, after } =
    index >= 0 ? neighborContext(cues, index) : { before: "", after: "" };

  const cueFindings = qualityFindings
    .filter((f) => f.cueId === cue.id || !f.cueId)
    .slice(0, 8)
    .map((f) => ({
      id: f.id,
      status: f.status,
      title: f.title,
      detail: f.detail.slice(0, 400),
    }));

  const issueFingerprint = hashRemediationMaterial("video:cue", [
    platform,
    cue.id,
    cue.start,
    cue.end,
    cue.text,
  ]);

  const facts: RemediationFacts = {
    source: "video",
    issueFingerprint,
    platform,
    cueId: cue.id,
    cueStart: cue.start,
    cueEnd: cue.end,
    originalCueText: cue.text,
    speakerLabel: speakerLabelsUserSet && cue.speaker ? cue.speaker : undefined,
    soundCue: cue.soundCue ?? false,
    transcriptContextBefore: before,
    transcriptContextAfter: after,
    captionQualityFindings: cueFindings,
    visualReviewExcerpt: visualReviewExcerpt?.slice(0, 800) ?? null,
    doNotInventSpeech: true,
    doNotChangeTimestamps: true,
  };

  const deterministicGuidance: string[] = [
    "Preserve critical spoken facts; do not invent non-speech sounds or speaker identity without evidence.",
    "Do not send or assume full video; remediate this cue only.",
    "Do not change cue timing unless explicit timing evidence is provided.",
  ];

  return { facts, deterministicGuidance };
}
