"use client";

import { useId, useState } from "react";
import { AppField } from "@/components/app/AppField";
import { AppPanel } from "@/components/app/AppPanel";
import { ToolWorkspace } from "@/components/app/ToolWorkspace";
import { appInputClassName, appTextareaClassName } from "@/components/app/appStyles";
import { ScreenReaderExperiencePanel } from "@/features/accessibility/components/screenReader/ScreenReaderExperiencePanel";
import { ScreenReaderPreviewFaq } from "@/features/accessibility/components/screenReader/ScreenReaderPreviewFaq";
import { Button } from "@/components/ui/Button";
import { WorkspaceScreenReaderHandoffPanel } from "@/features/accessibility-workspace/components/WorkspaceScreenReaderHandoffPanel";

const STEPS = [
  { id: "sr-inputs", label: "Enter content", shortLabel: "Input" },
  { id: "sr-preview", label: "Preview experience", shortLabel: "Preview" },
] as const;

export function ScreenReaderPreviewPage() {
  const captionId = useId();
  const altId = useId();
  const linkId = useId();
  const [caption, setCaption] = useState("");
  const [altText, setAltText] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [hasImage, setHasImage] = useState(false);

  function handleReset() {
    setCaption("");
    setAltText("");
    setLinkLabel("");
    setHasImage(false);
  }

  return (
    <ToolWorkspace steps={[...STEPS]} activeStepId="sr-inputs">
      <WorkspaceScreenReaderHandoffPanel />
      <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
        <AppPanel
          id="sr-inputs"
          title="Post content"
          description="Enter sample caption and alt text to approximate assistive reading order."
          headerAside={
            <Button type="button" variant="ghost" onClick={handleReset}>
              Reset
            </Button>
          }
        >
          <div className="space-y-5">
            <AppField label="Caption" htmlFor={captionId}>
              <textarea
                id={captionId}
                rows={6}
                className={appTextareaClassName}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </AppField>
            <AppField
              label="Alt text (optional)"
              htmlFor={altId}
              hint="Included in the image description segment of the preview."
            >
              <textarea
                id={altId}
                rows={3}
                className={appTextareaClassName}
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
              />
            </AppField>
            <AppField label="Link label (optional)" htmlFor={linkId}>
              <input
                id={linkId}
                type="text"
                className={appInputClassName}
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
              />
            </AppField>
            <label className="flex items-center gap-3 rounded-xl border border-border bg-muted-bg/50 px-4 py-3 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary"
                checked={hasImage}
                onChange={(e) => setHasImage(e.target.checked)}
              />
              Image present in post
            </label>
          </div>
        </AppPanel>

        <AppPanel id="sr-preview" title="Experience preview" variant="inset">
          <ScreenReaderExperiencePanel
            mode="standalone"
            caption={caption}
            altText={altText}
            hasImage={hasImage}
            linkLabel={linkLabel || undefined}
            onApplyDraft={(draft) => setCaption(draft)}
          />
        </AppPanel>
      </div>

      <ScreenReaderPreviewFaq />
    </ToolWorkspace>
  );
}
