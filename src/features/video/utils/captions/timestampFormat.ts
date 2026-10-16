/** Format seconds to SRT timestamp HH:MM:SS,mmm */
export function formatSrtTimestamp(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const secs = Math.floor(clamped % 60);
  const ms = Math.round((clamped - Math.floor(clamped)) * 1000);
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(ms, 3)}`;
}

/** Format seconds to VTT timestamp HH:MM:SS.mmm */
export function formatVttTimestamp(seconds: number): string {
  return formatSrtTimestamp(seconds).replace(",", ".");
}
