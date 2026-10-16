"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { NormalizedSamplePoint } from "@/features/accessibility/types/visualAccessibility";
import { getObjectContainLayout } from "@/features/accessibility/hooks/useImageSampleCanvas";
import { cn } from "@/lib/utils";

export type PreviewMarker = NormalizedSamplePoint & {
  id: string;
  label: string;
  className?: string;
};

type ImagePreviewFrameProps = {
  previewUrl: string;
  alt: string;
  naturalWidth: number;
  naturalHeight: number;
  markers: PreviewMarker[];
  onImagePointer: (
    normalized: NormalizedSamplePoint,
    event: React.MouseEvent | React.TouchEvent,
  ) => void;
  className?: string;
};

export function ImagePreviewFrame({
  previewUrl,
  alt,
  naturalWidth,
  naturalHeight,
  markers,
  onImagePointer,
  className,
}: ImagePreviewFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    ro.observe(el);
    setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const layout =
    naturalWidth > 0 && naturalHeight > 0 && containerSize.width > 0
      ? getObjectContainLayout(
          containerSize.width,
          containerSize.height,
          naturalWidth,
          naturalHeight,
        )
      : null;

  const pointerToNormalized = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el || !layout || naturalWidth <= 0) return null;
      const rect = el.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
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
        x: xInImage / layout.drawWidth,
        y: yInImage / layout.drawHeight,
      };
    },
    [layout, naturalWidth],
  );

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const normalized = pointerToNormalized(e.clientX, e.clientY);
    if (normalized) onImagePointer(normalized, e);
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.changedTouches[0];
    if (!touch) return;
    const normalized = pointerToNormalized(touch.clientX, touch.clientY);
    if (normalized) onImagePointer(normalized, e);
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted-bg",
        className,
      )}
      role="img"
      aria-label={`${alt}. Click or tap on the image to sample colors.`}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        alt=""
        className="pointer-events-none h-full w-full object-contain"
        draggable={false}
      />
      {layout &&
        markers.map((marker) => {
          const left =
            layout.offsetX + marker.x * layout.drawWidth;
          const top =
            layout.offsetY + marker.y * layout.drawHeight;
          return (
            <span
              key={marker.id}
              className={cn(
                "pointer-events-none absolute z-10 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-md",
                marker.className ?? "bg-primary",
              )}
              style={{ left, top }}
              aria-hidden
            >
              {marker.label}
            </span>
          );
        })}
    </div>
  );
}
