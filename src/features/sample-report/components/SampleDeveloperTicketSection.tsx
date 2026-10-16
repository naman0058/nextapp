"use client";

import { useMemo, useState } from "react";
import type { SampleAccessibilityReportFixture } from "@/features/sample-report/buildSampleAccessibilityReportFixture";
import { FEATURED_DEVELOPER_TICKET_RULE_ID } from "@/features/sample-report/constants";
import { buildDeveloperTicketForRootCause } from "@/features/website-scanner/developerTicket/buildDeveloperTicketFromSession";
import { formatDeveloperTicketMarkdown } from "@/features/website-scanner/developerTicket/formatDeveloperTicketMarkdown";
import { downloadDeveloperTicketFile } from "@/features/website-scanner/components/developerTicket/downloadDeveloperTicket";

type Props = { fixture: SampleAccessibilityReportFixture };

export function SampleDeveloperTicketSection({ fixture }: Props) {
  const [copied, setCopied] = useState(false);
  const ticket = useMemo(() => {
    const group = fixture.session.siteIntelligence?.rootCauseGroups.find(
      (g) => g.ruleId === FEATURED_DEVELOPER_TICKET_RULE_ID,
    );
    if (!group) return null;
    return buildDeveloperTicketForRootCause({
      group,
      session: fixture.session,
      completedPages: fixture.completedPages,
      axeHelp: "Buttons must have discernible text",
    });
  }, [fixture]);

  const markdown = ticket ? formatDeveloperTicketMarkdown(ticket) : "";

  async function copyTicket() {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <section id="sample-developer-ticket" aria-labelledby="sample-ticket-heading" className="space-y-4">
      <h2 id="sample-ticket-heading" className="text-2xl font-semibold">
        Developer ticket (example)
      </h2>
      {ticket ? (
        <>
          <p className="font-medium">{ticket.title}</p>
          <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-muted/30 p-4 text-xs whitespace-pre-wrap">
            {markdown}
          </pre>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              onClick={() => void copyTicket()}
            >
              Copy sample developer ticket
            </button>
            <button
              type="button"
              className="rounded-lg border border-border px-4 py-2 text-sm"
              onClick={() =>
                downloadDeveloperTicketFile(
                  markdown,
                  FEATURED_DEVELOPER_TICKET_RULE_ID,
                  "markdown",
                )
              }
            >
              Download sample ticket (.md)
            </button>
          </div>
          {copied ? (
            <p className="text-sm text-muted-foreground" role="status">
              Copied to clipboard.
            </p>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Sample ticket unavailable.</p>
      )}
    </section>
  );
}
