import { CAPTION_STYLE } from "@/features/video/constants/captionStyle";
import type {
  CaptionCue,
  CaptionQualityFinding,
  CaptionQualitySummary,
} from "@/features/video/types/captions";

export function analyzeCaptionQuality(
  cues: CaptionCue[],
  videoDuration?: number,
): CaptionQualitySummary {
  const findings: CaptionQualityFinding[] = [];
  const sorted = [...cues].sort((a, b) => a.start - b.start);

  for (let i = 0; i < sorted.length; i++) {
    const cue = sorted[i]!;
    const label = `Caption ${i + 1}`;

    if (!cue.text.trim()) {
      findings.push({
        id: `empty-${cue.id}`,
        cueId: cue.id,
        status: "error",
        title: "Empty caption",
        detail: `${label} has no text.`,
      });
    }

    if (cue.end <= cue.start) {
      findings.push({
        id: `time-${cue.id}`,
        cueId: cue.id,
        status: "error",
        title: "Invalid timing",
        detail: `${label} end time must be after start time.`,
      });
    }

    if (cue.start < 0) {
      findings.push({
        id: `neg-${cue.id}`,
        cueId: cue.id,
        status: "error",
        title: "Negative start time",
        detail: `${label} starts before zero.`,
      });
    }

    const duration = cue.end - cue.start;
    if (duration > 0 && duration < 0.3) {
      findings.push({
        id: `flash-${cue.id}`,
        cueId: cue.id,
        status: "review",
        title: "Very short cue",
        detail: `${label} may flash too quickly to read.`,
      });
    }
    if (duration > CAPTION_STYLE.maxCueDurationSeconds) {
      findings.push({
        id: `long-${cue.id}`,
        cueId: cue.id,
        status: "review",
        title: "Very long cue",
        detail: `${label} stays on screen for a long time — consider splitting.`,
      });
    }

    const lines = cue.text.split("\n");
    if (lines.length > CAPTION_STYLE.maxLines) {
      findings.push({
        id: `lines-${cue.id}`,
        cueId: cue.id,
        status: "review",
        title: "More than two lines",
        detail: `${label} has ${lines.length} lines.`,
        suggestion: "Split into shorter cues for readability.",
      });
    }
    for (const line of lines) {
      if (line.length > CAPTION_STYLE.targetMaxCharsPerLine + 10) {
        findings.push({
          id: `len-${cue.id}-${line.slice(0, 8)}`,
          cueId: cue.id,
          status: "review",
          title: "Long caption line",
          detail: `${label} includes a long line (${line.length} characters).`,
        });
      }
    }

    const chars = cue.text.replace(/\s/g, "").length;
    if (duration > 0) {
      const cps = chars / duration;
      if (cps > CAPTION_STYLE.reviewCharsPerSecond) {
        findings.push({
          id: `cps-${cue.id}`,
          cueId: cue.id,
          status: "review",
          title: "Fast reading speed",
          detail: `${label} may be hard to read at ~${cps.toFixed(1)} characters per second.`,
        });
      }
    }

    if (cue.text === cue.text.toUpperCase() && cue.text.length > 12) {
      findings.push({
        id: `caps-${cue.id}`,
        cueId: cue.id,
        status: "review",
        title: "Excessive ALL CAPS",
        detail: `${label} is mostly uppercase.`,
      });
    }

    const prev = sorted[i - 1];
    if (prev && cue.start < prev.end) {
      findings.push({
        id: `overlap-${cue.id}`,
        cueId: cue.id,
        status: "review",
        title: "Timing overlap",
        detail: `${label} overlaps the previous cue.`,
      });
    }
    if (prev && cue.text.trim() === prev.text.trim() && cue.text.trim()) {
      findings.push({
        id: `dup-${cue.id}`,
        cueId: cue.id,
        status: "review",
        title: "Repeated text",
        detail: `${label} duplicates the previous cue.`,
      });
    }

    if (videoDuration != null && cue.end > videoDuration + 0.05) {
      findings.push({
        id: `beyond-${cue.id}`,
        cueId: cue.id,
        status: "review",
        title: "Beyond video duration",
        detail: `${label} extends past the video length.`,
      });
    }
  }

  if (sorted.length >= 2) {
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i]!.start - sorted[i - 1]!.end;
      if (gap > 4) {
        findings.push({
          id: `gap-${sorted[i]!.id}`,
          cueId: sorted[i]!.id,
          status: "review",
          title: "Large timing gap",
          detail: `Gap of ${gap.toFixed(1)}s before caption ${i + 1}.`,
        });
      }
    }
  }

  let ready = 0;
  let review = 0;
  let error = 0;
  for (const f of findings) {
    if (f.status === "error") error += 1;
    else if (f.status === "review") review += 1;
  }
  ready = Math.max(0, sorted.length - review - error);

  return { ready, review, error, findings };
}
