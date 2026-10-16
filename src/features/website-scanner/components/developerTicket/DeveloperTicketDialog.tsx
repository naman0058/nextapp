"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { DeveloperTicket, DeveloperTicketFormat } from "@/features/website-scanner/developerTicket/types";
import { formatDeveloperTicketMarkdown } from "@/features/website-scanner/developerTicket/formatDeveloperTicketMarkdown";
import { formatDeveloperTicketPlainText } from "@/features/website-scanner/developerTicket/formatDeveloperTicketPlainText";
import { downloadDeveloperTicketFile } from "@/features/website-scanner/components/developerTicket/downloadDeveloperTicket";
import { useDeveloperTicketClipboard } from "@/features/website-scanner/components/developerTicket/useDeveloperTicketClipboard";

type Props = {
  open: boolean;
  ticket: DeveloperTicket | null;
  onClose: () => void;
  includeAiGuidance: boolean;
  onIncludeAiChange: (v: boolean) => void;
  hasCachedAi: boolean;
  onRebuildWithAi?: (include: boolean) => void;
};

export function DeveloperTicketDialog({
  open,
  ticket,
  onClose,
  includeAiGuidance,
  onIncludeAiChange,
  hasCachedAi,
  onRebuildWithAi,
}: Props) {
  const titleId = useId();
  const previewId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [format, setFormat] = useState<DeveloperTicketFormat>("markdown");
  const { message, copyText } = useDeveloperTicketClipboard();

  const body = useMemo(() => {
    if (!ticket) return "";
    return format === "markdown"
      ? formatDeveloperTicketMarkdown(ticket)
      : formatDeveloperTicketPlainText(ticket);
  }, [ticket, format]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !ticket) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-border bg-card shadow-xl"
      >
        <header className="shrink-0 border-b border-border p-4">
          <h2 id={titleId} className="font-display text-lg font-bold">
            Developer Ticket
          </h2>
          <p className="text-sm font-semibold">{ticket.title}</p>
          <p className="mt-2 text-xs text-muted">
            Ticket text is generated from the current scan in your browser. Copying
            or downloading does not send it to Jira, GitHub, or another service.
          </p>
        </header>

        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-4 py-2">
          <span className="text-xs font-medium">Format:</span>
          <label className="flex items-center gap-1 text-xs">
            <input
              type="radio"
              name="ticket-format"
              checked={format === "markdown"}
              onChange={() => setFormat("markdown")}
            />
            Markdown
          </label>
          <label className="flex items-center gap-1 text-xs">
            <input
              type="radio"
              name="ticket-format"
              checked={format === "plain"}
              onChange={() => setFormat("plain")}
            />
            Plain Text
          </label>
          {hasCachedAi && (
            <label className="ml-auto flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={includeAiGuidance}
                onChange={(e) => {
                  onIncludeAiChange(e.target.checked);
                  onRebuildWithAi?.(e.target.checked);
                }}
              />
              Include existing AI-assisted guidance
            </label>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-hidden p-4">
          <label htmlFor={previewId} className="sr-only">
            Developer ticket preview
          </label>
          <textarea
            id={previewId}
            readOnly
            className="h-[min(50vh,24rem)] w-full resize-y rounded-lg border border-border bg-muted-bg p-3 font-mono text-xs"
            value={body}
            aria-label="Developer ticket preview"
          />
        </div>

        {message && (
          <p className="px-4 text-sm text-primary" role="status">
            {message}
          </p>
        )}

        <footer className="flex shrink-0 flex-wrap gap-2 border-t border-border p-4">
          <button
            type="button"
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
            onClick={() => void copyText(body, "Developer ticket copied.")}
          >
            Copy Full Ticket
          </button>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-sm"
            onClick={() =>
              void copyText(ticket.title, "Ticket title copied.")
            }
          >
            Copy Title
          </button>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-sm"
            onClick={() =>
              downloadDeveloperTicketFile(
                body,
                ticket.ruleId ?? "issue",
                format,
              )
            }
          >
            {format === "markdown" ? "Download Markdown" : "Download Text"}
          </button>
          <button
            ref={closeRef}
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
