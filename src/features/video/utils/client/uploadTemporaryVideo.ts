type UploadAuthorizeResponse = {
  mediaRef: string;
  uploadUrl: string;
  devDirectUploadPath?: string;
  maxBytes: number;
  error?: string;
};

export async function requestUploadAuthorization(
  contentType: string,
): Promise<UploadAuthorizeResponse> {
  const res = await fetch("/api/accessibility/video/upload-authorize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType }),
  });
  const data = (await res.json()) as UploadAuthorizeResponse;
  if (!res.ok) {
    throw new Error(data.error ?? "Upload authorization failed.");
  }
  return data;
}

export async function uploadTemporaryVideo(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const auth = await requestUploadAuthorization(file.type);

  if (auth.devDirectUploadPath) {
    const uploadPath = auth.devDirectUploadPath;
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadPath);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.setRequestHeader("X-Media-Ref", auth.mediaRef);
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable && onProgress) {
          onProgress(Math.round((ev.loaded / ev.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error("Upload failed."));
      };
      xhr.onerror = () => reject(new Error("Upload failed."));
      xhr.send(file);
    });
    return auth.mediaRef;
  }

  const { upload } = await import("@vercel/blob/client");
  await upload(auth.mediaRef, file, {
    access: "private",
    handleUploadUrl: auth.uploadUrl,
    onUploadProgress: (ev) => {
      if (onProgress && ev.total) {
        onProgress(Math.round((ev.loaded / ev.total) * 100));
      }
    },
  });
  return auth.mediaRef;
}
