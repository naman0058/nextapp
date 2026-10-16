"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RGBColor } from "@/features/accessibility/types/visualAccessibility";
import {
  dominantColorsToHex,
  extractDominantColorsFromImageData,
} from "@/features/accessibility/utils/contrast/dominantColors";
import { rgbToHex } from "@/features/accessibility/utils/contrast/parseColor";

export type SampleResult = {
  rgb: RGBColor;
  hex: string;
};

export type ObjectContainLayout = {
  offsetX: number;
  offsetY: number;
  drawWidth: number;
  drawHeight: number;
};

export function getObjectContainLayout(
  containerWidth: number,
  containerHeight: number,
  naturalWidth: number,
  naturalHeight: number,
): ObjectContainLayout {
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return {
      offsetX: 0,
      offsetY: 0,
      drawWidth: containerWidth,
      drawHeight: containerHeight,
    };
  }
  const scale = Math.min(
    containerWidth / naturalWidth,
    containerHeight / naturalHeight,
  );
  const drawWidth = naturalWidth * scale;
  const drawHeight = naturalHeight * scale;
  return {
    offsetX: (containerWidth - drawWidth) / 2,
    offsetY: (containerHeight - drawHeight) / 2,
    drawWidth,
    drawHeight,
  };
}

export function clientPointToNormalizedImage(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  naturalWidth: number,
  naturalHeight: number,
): { x: number; y: number } | null {
  const localX = clientX - rect.left;
  const localY = clientY - rect.top;
  const layout = getObjectContainLayout(
    rect.width,
    rect.height,
    naturalWidth,
    naturalHeight,
  );
  const xInImage = localX - layout.offsetX;
  const yInImage = localY - layout.offsetY;
  if (
    xInImage < 0 ||
    yInImage < 0 ||
    xInImage > layout.drawWidth ||
    yInImage > layout.drawHeight
  ) {
    return null;
  }
  return {
    x: Math.min(1, Math.max(0, xInImage / layout.drawWidth)),
    y: Math.min(1, Math.max(0, yInImage / layout.drawHeight)),
  };
}

type LoadedCanvasState = {
  fileKey: string;
  ready: boolean;
  naturalWidth: number;
  naturalHeight: number;
  dominantHex: string[];
  loadError: string | null;
};

const emptyLoaded: LoadedCanvasState = {
  fileKey: "",
  ready: false,
  naturalWidth: 0,
  naturalHeight: 0,
  dominantHex: [],
  loadError: null,
};

function fileKeyFor(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function useImageSampleCanvas(imageFile: File | null) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loaded, setLoaded] = useState<LoadedCanvasState>(emptyLoaded);

  const activeKey = imageFile ? fileKeyFor(imageFile) : null;
  const isCurrent = activeKey !== null && loaded.fileKey === activeKey;

  useEffect(() => {
    canvasRef.current = null;
    if (!imageFile || !activeKey) {
      return;
    }

    let cancelled = false;
    const url = URL.createObjectURL(imageFile);
    const img = new Image();

    img.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        setLoaded({
          fileKey: activeKey,
          ready: false,
          naturalWidth: 0,
          naturalHeight: 0,
          dominantHex: [],
          loadError: "Could not read image pixels in this browser.",
        });
        URL.revokeObjectURL(url);
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvasRef.current = canvas;
      let dominantHex: string[] = [];
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors = extractDominantColorsFromImageData(imageData);
        dominantHex = dominantColorsToHex(colors);
      } catch {
        dominantHex = [];
      }
      setLoaded({
        fileKey: activeKey,
        ready: true,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        dominantHex,
        loadError: null,
      });
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      if (cancelled) return;
      setLoaded({
        fileKey: activeKey,
        ready: false,
        naturalWidth: 0,
        naturalHeight: 0,
        dominantHex: [],
        loadError: "Could not load image for sampling.",
      });
      URL.revokeObjectURL(url);
    };

    img.src = url;

    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
      canvasRef.current = null;
    };
  }, [imageFile, activeKey]);

  const samplePixel = useCallback(
    (normalizedX: number, normalizedY: number): SampleResult | null => {
      const canvas = canvasRef.current;
      if (!canvas || !isCurrent || !loaded.ready) return null;
      const x = Math.min(
        canvas.width - 1,
        Math.max(0, Math.floor(normalizedX * canvas.width)),
      );
      const y = Math.min(
        canvas.height - 1,
        Math.max(0, Math.floor(normalizedY * canvas.height)),
      );
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;
      const data = ctx.getImageData(x, y, 1, 1).data;
      const rgb: RGBColor = {
        r: data[0] ?? 0,
        g: data[1] ?? 0,
        b: data[2] ?? 0,
      };
      return { rgb, hex: rgbToHex(rgb) };
    },
    [isCurrent, loaded.ready],
  );

  return {
    ready: isCurrent && loaded.ready,
    naturalSize: {
      width: isCurrent ? loaded.naturalWidth : 0,
      height: isCurrent ? loaded.naturalHeight : 0,
    },
    samplePixel,
    dominantHex: isCurrent ? loaded.dominantHex : [],
    loadError: isCurrent ? loaded.loadError : null,
  };
}
