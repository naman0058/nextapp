export type VideoMetadata = {
  durationSeconds: number;
  width: number;
  height: number;
};

export function readVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = video.duration;
      const width = video.videoWidth;
      const height = video.videoHeight;
      URL.revokeObjectURL(url);
      if (!Number.isFinite(duration)) {
        reject(new Error("Could not read video duration."));
        return;
      }
      resolve({ durationSeconds: duration, width, height });
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load video metadata."));
    };
    video.src = url;
  });
}
