"use client";

import { SPEECH_RATE_OPTIONS } from "@/features/accessibility/constants/screenReaderPreview";
import { useSpeechPreview } from "@/features/accessibility/hooks/useSpeechPreview";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type SpeechPreviewControlsProps = {
  speechText: string;
  onResetSpeech?: () => void;
};

export function SpeechPreviewControls({
  speechText,
  onResetSpeech,
}: SpeechPreviewControlsProps) {
  const speech = useSpeechPreview(speechText);

  function handleStop() {
    speech.cancel();
    onResetSpeech?.();
  }

  if (!speech.supported) {
    return (
      <Card className="p-4 text-sm text-muted">
        Speech playback is unavailable in this browser. You can still use the
        textual reading preview.
      </Card>
    );
  }

  return (
    <Card className="space-y-4 p-4">
      <h3 className="text-sm font-semibold text-foreground">
        Listen to approximation
      </h3>
      <p className="text-xs text-muted">
        Browser speech playback is a convenience preview, not an emulation of
        NVDA, JAWS, VoiceOver, TalkBack, or another screen reader. Speech
        pronunciation depends on the selected browser voice and language
        support.
      </p>
      {speechText.trim() ? (
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-foreground">
            Text that will be spoken
          </summary>
          <p className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-muted-bg p-3 text-muted">
            {speechText.trim()}
          </p>
        </details>
      ) : (
        <p className="text-sm text-amber-950">
          Add caption (or alt text when image is present) to enable playback.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={speech.speak} disabled={!speechText.trim()}>
          Play
        </Button>
        <Button type="button" variant="secondary" onClick={speech.pause}>
          Pause
        </Button>
        <Button type="button" variant="secondary" onClick={speech.resume}>
          Resume
        </Button>
        <Button type="button" variant="ghost" onClick={handleStop}>
          Stop
        </Button>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="text-sm">
          <span className="font-medium text-foreground">Rate</span>
          <select
            className="ml-2 rounded border border-border bg-card px-2 py-1 text-sm"
            value={speech.rate}
            onChange={(e) => speech.setRate(Number(e.target.value))}
            aria-label="Speech rate"
          >
            {SPEECH_RATE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}x
              </option>
            ))}
          </select>
        </label>
        {speech.voices.length > 0 ? (
          <label className="text-sm">
            <span className="font-medium text-foreground">Voice</span>
            <select
              className="ml-2 max-w-[14rem] rounded border border-border bg-card px-2 py-1 text-sm"
              value={speech.voiceUri}
              onChange={(e) => speech.setVoiceUri(e.target.value)}
              aria-label="Speech voice"
            >
              <option value="">Browser default</option>
              {speech.voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <p className="text-xs text-muted">Status: {speech.status}</p>
      <p className="sr-only" aria-live="polite">
        {speech.liveMessage}
      </p>
    </Card>
  );
}
