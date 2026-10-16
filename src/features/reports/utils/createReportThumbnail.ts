export async function createReportThumbnailFromUrl(
  imageUrl: string,
  maxSize = 240,
): Promise<string | null> {
  if (typeof document === "undefined") return null;
  try {
    const img = await loadImage(imageUrl);
    const canvas = document.createElement("canvas");
    const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.72);
  } catch {
    return null;
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = url;
  });
}
