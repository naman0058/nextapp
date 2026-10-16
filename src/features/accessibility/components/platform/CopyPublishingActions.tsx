"use client";

import { useState } from "react";
import type { SocialPlatform } from "@/types";
import { SOCIAL_PLATFORM_LABELS } from "@/features/accessibility/constants/platforms";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type CopyPublishingActionsProps = {
  platform: SocialPlatform;
  caption: string;
  altText: string;
  publishingNotes: string[];
};

export function CopyPublishingActions({
  platform,
  caption,
  altText,
  publishingNotes,
}: CopyPublishingActionsProps) {
  const [message, setMessage] = useState<string | null>(null);

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(`${label} copied.`);
      window.setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage("Copy failed.");
    }
  }

  function buildPackage() {
    const lines = [
      `Platform: ${SOCIAL_PLATFORM_LABELS[platform]}`,
      "",
      "Caption:",
      caption.trim() || "(empty)",
      "",
      "Alt text:",
      altText.trim() || "(empty)",
      "",
      "Publishing notes:",
      ...publishingNotes.map((n) => `- ${n}`),
    ];
    return lines.join("\n");
  }

  return (
    <Card className="space-y-3 p-4">
      <h3 className="text-sm font-semibold text-foreground">Copy for publishing</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={!caption.trim()}
          onClick={() => copy(caption, "Caption")}
        >
          Copy accessible caption
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={!altText.trim()}
          onClick={() => copy(altText, "Alt text")}
        >
          Copy alt text
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => copy(buildPackage(), "Publishing package")}
        >
          Copy publishing package
        </Button>
      </div>
      {message ? (
        <p className="text-sm text-muted" role="status">
          {message}
        </p>
      ) : null}
    </Card>
  );
}
