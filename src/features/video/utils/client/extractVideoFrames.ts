import { getMaxVisualReviewFrames, getVisualFrameLongEdgePx } from "@/features/video/constants/visualReviewLimits";

export type ExtractedFrame = {
  base64: string;
  mimeType: string;
  timestampSeconds: number;
};

function sampleTimestamps(duration: number, count: number): number[] {
  if (duration <= 0) return [0];
  const offsets = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 0.98];
  const stamps: number[] = [];
  for (let i = 0; i < count; i++) {
    const ratio = offsets[i % offsets.length] ?? i / count;
    stamps.push(Math.min(duration * ratio, Math.max(0, duration - 0.1)));
  }
  return stamps.slice(0, count);
}

function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = time;
    video.addEventListener("error", () => reject(new Error("Seek failed")), {
      once: true,
    });
  });
}

export async function extractVideoFrames(
  videoUrl: string,
  durationSeconds: number,
): Promise<ExtractedFrame[]> {
  const maxFrames = getMaxVisualReviewFrames();
  const longEdge = getVisualFrameLongEdgePx();
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.muted = true;
  video.playsInline = true;
  video.src = videoUrl;

  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = () => reject(new Error("Could not load video for frames."));
  });

  const timestamps = sampleTimestamps(durationSeconds, maxFrames);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable.");

  const frames: ExtractedFrame[] = [];

  for (const t of timestamps) {
    await seekVideo(video, t);
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) continue;
    const scale = longEdge / Math.max(vw, vh);
    canvas.width = Math.round(vw * scale);
    canvas.height = Math.round(vh * scale);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    const base64 = dataUrl.split(",")[1] ?? "";
    frames.push({
      base64,
      mimeType: "image/jpeg",
      timestampSeconds: t,
    });
  }

  video.removeAttribute("src");
  video.load();

  return frames;
}
