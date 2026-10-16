"use client";

import { useId, useMemo, useState } from "react";
import { MAX_BACKGROUND_SAMPLES } from "@/features/accessibility/constants/wcagContrast";
import { ImagePreviewFrame } from "@/features/accessibility/components/visual/ImagePreviewFrame";
import { useImageSampleCanvas } from "@/features/accessibility/hooks/useImageSampleCanvas";
import type {
  ColorSample,
  NormalizedSamplePoint,
  RGBColor,
} from "@/features/accessibility/types/visualAccessibility";
import { calculateContrastRatio } from "@/features/accessibility/utils/contrast/contrastRatio";
import { hasSignificantBackgroundVariation } from "@/features/accessibility/utils/contrast/backgroundVariation";
import { parseHexColor } from "@/features/accessibility/utils/contrast/parseColor";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";

type PickMode = "foreground" | "background";

type ImageColorSamplerProps = {
  imageFile: File;
  previewUrl: string;
  foregroundHex: string | null;
  backgroundSamples: ColorSample[];
  onForegroundSample: (sample: ColorSample) => void;
  onBackgroundSample: (sample: ColorSample) => void;
  onApplyDominant: (hex: string, target: PickMode) => void;
  onClearSamples: () => void;
};

const SAMPLE_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function ImageColorSampler({
  imageFile,
  previewUrl,
  foregroundHex,
  backgroundSamples,
  onForegroundSample,
  onBackgroundSample,
  onApplyDominant,
  onClearSamples,
}: ImageColorSamplerProps) {
  const liveId = useId();
  const [pickMode, setPickMode] = useState<PickMode>("foreground");
  const [liveMessage, setLiveMessage] = useState("");
  const { ready, naturalSize, samplePixel, dominantHex, loadError } =
    useImageSampleCanvas(imageFile);

  const [fgPoint, setFgPoint] = useState<NormalizedSamplePoint | null>(null);

  const markers = useMemo(() => {
    const list: {
      id: string;
      x: number;
      y: number;
      label: string;
      className?: string;
    }[] = [];
    if (fgPoint) {
      list.push({
        id: "fg",
        x: fgPoint.x,
        y: fgPoint.y,
        label: "FG",
        className: "bg-blue-700",
      });
    }
    backgroundSamples.forEach((sample, index) => {
      if (!sample.normalized) return;
      list.push({
        id: `bg-${index}`,
        x: sample.normalized.x,
        y: sample.normalized.y,
        label: "BG",
        className: "bg-amber-700",
      });
    });
    return list;
  }, [fgPoint, backgroundSamples]);

  function commitSample(normalized: NormalizedSamplePoint) {
    const result = samplePixel(normalized.x, normalized.y);
    if (!result) return;
    const sample: ColorSample = {
      hex: result.hex,
      rgb: result.rgb,
      normalized,
      label:
        pickMode === "background"
          ? SAMPLE_LABELS[backgroundSamples.length] ?? `${backgroundSamples.length + 1}`
          : "FG",
    };
    if (pickMode === "foreground") {
      setFgPoint(normalized);
      onForegroundSample(sample);
      setLiveMessage(`Foreground color selected: ${result.hex}`);
    } else {
      if (backgroundSamples.length >= MAX_BACKGROUND_SAMPLES) {
        setLiveMessage(
          `Maximum ${MAX_BACKGROUND_SAMPLES} background samples reached.`,
        );
        return;
      }
      onBackgroundSample(sample);
      setLiveMessage(`Background sample ${sample.label} selected: ${result.hex}`);
    }
  }

  const multiStats = useMemo(() => {
    if (!foregroundHex || backgroundSamples.length === 0) return null;
    let fg: RGBColor;
    try {
      fg = parseHexColor(foregroundHex);
    } catch {
      return null;
    }
    const ratios = backgroundSamples.map((s) =>
      calculateContrastRatio(fg, s.rgb),
    );
    const minRatio = Math.min(...ratios);
    const maxRatio = Math.max(...ratios);
    const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    const busy = hasSignificantBackgroundVariation(
      backgroundSamples.map((s) => s.rgb),
    );
    return { minRatio, maxRatio, avgRatio, worstRatio: minRatio, busy };
  }, [foregroundHex, backgroundSamples]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={pickMode === "foreground" ? "primary" : "secondary"}
          onClick={() => setPickMode("foreground")}
        >
          Pick foreground
        </Button>
        <Button
          type="button"
          variant={pickMode === "background" ? "primary" : "secondary"}
          onClick={() => setPickMode("background")}
        >
          Pick background
        </Button>
        <Button type="button" variant="ghost" onClick={onClearSamples}>
          Reset samples
        </Button>
      </div>
      <p className="text-xs text-muted">
        Active mode: {pickMode === "foreground" ? "foreground" : "background"}.
        Background samples: {backgroundSamples.length}/{MAX_BACKGROUND_SAMPLES}.
      </p>

      {loadError ? (
        <StatusMessage variant="error" title={loadError} />
      ) : null}

      {!ready ? (
        <p className="text-sm text-muted">Loading image for pixel sampling…</p>
      ) : (
        <ImagePreviewFrame
          previewUrl={previewUrl}
          alt="Uploaded image"
          naturalWidth={naturalSize.width}
          naturalHeight={naturalSize.height}
          markers={markers}
          onImagePointer={(normalized) => commitSample(normalized)}
        />
      )}

      <p id={liveId} className="sr-only" aria-live="polite">
        {liveMessage}
      </p>

      {backgroundSamples.length > 0 ? (
        <ul className="space-y-1 text-sm">
          {backgroundSamples.map((sample) => (
            <li key={sample.label ?? sample.hex} className="flex items-center gap-2">
              <span
                className="inline-block h-4 w-4 rounded border border-border"
                style={{ backgroundColor: sample.hex }}
                aria-hidden
              />
              <span>
                Sample {sample.label}: {sample.hex}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {multiStats ? (
        <div className="rounded-lg border border-border bg-muted-bg p-3 text-sm">
          <p className="font-semibold text-foreground">Multi-background contrast</p>
          <p className="mt-1 text-muted">
            Worst case (min): {multiStats.worstRatio.toFixed(2)}:1 · Max:{" "}
            {multiStats.maxRatio.toFixed(2)}:1 · Avg:{" "}
            {multiStats.avgRatio.toFixed(2)}:1
          </p>
          {multiStats.busy ? (
            <p className="mt-2 text-amber-900">
              REVIEW — Background colors vary significantly. Measure several
              areas behind text.
            </p>
          ) : null}
        </div>
      ) : null}

      {dominantHex.length > 0 ? (
        <div>
          <p className="text-sm font-semibold text-foreground">
            Detected image colors
          </p>
          <p className="text-xs text-muted">
            Approximate swatches from a downscaled scan—not a substitute for
            picking text and background pixels.
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {dominantHex.map((hex) => (
              <li key={hex} className="flex items-center gap-1">
                <span
                  className="inline-block h-8 w-8 rounded border border-border"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
                <div className="flex flex-col gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto px-1 py-0 text-xs"
                    onClick={() => onApplyDominant(hex, "foreground")}
                  >
                    FG
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto px-1 py-0 text-xs"
                    onClick={() => onApplyDominant(hex, "background")}
                  >
                    BG
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
