import { PageHeader } from "@/components/shared/PageHeader";
import { LegalProse } from "@/components/shared/LegalProse";
import { InteriorMarketingLayout } from "@/components/marketing/InteriorMarketingLayout";
import { siteConfig } from "@/config/site";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";

export const metadata = metadataForStaticRoute("/methodology");

export default function MethodologyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Trust & transparency"
        title="Methodology"
        description="How this platform evaluates accessibility readiness before you publish."
      />
      <InteriorMarketingLayout>
        <LegalProse>
          <h2 id="quick-answer">Quick answer</h2>
          <p>
            Accessibility preflight means running structured checks on content or pages{" "}
            <em>before</em> you publish: automated rules where they apply, measured contrast
            where colors matter, optional AI only when you opt in, and explicit human-review
            prompts where automation cannot decide. Results are guidance—not legal certification.
          </p>
          <p>
            {siteConfig.name} helps you review social posts before publication.
            Results are guidance—not legal certification, platform approval, or
            a guarantee of compliance with ADA, WCAG, Section 508, or any law.
          </p>

          <h2 id="categories">Check categories</h2>
          <ul>
            <li>
              <strong>Measured:</strong> Color contrast ratios use WCAG relative
              luminance math in your browser (Phase 3). These are numeric
              measurements against chosen thresholds.
            </li>
            <li>
              <strong>Rule-based (automated):</strong> Caption and alt-text
              heuristics run locally in your browser (Phase 1)—for example
              repeated emojis, dense hashtags, or missing alt text when an image
              is present.
            </li>
            <li>
              <strong>AI-assisted:</strong> Optional image review sends your
              image, caption, alt text, and platform to our server and then to
              OpenAI only when you explicitly request analysis (Phase 2). Output
              is validated structured data and should be verified by a human.
            </li>
            <li>
              <strong>Preview (local):</strong> Screen Reader Experience Preview
              approximates reading order and listening noise in your browser; it
              is not an NVDA, JAWS, or VoiceOver emulator (Phase 4).
            </li>
            <li>
              <strong>Platform guidance:</strong> Checklists and publishing tips
              are based on current platform help documentation and accessibility
              best practices (Phase 5). They do not connect to your social
              accounts.
            </li>
            <li>
              <strong>Video transcription (AI-assisted):</strong> When you
              explicitly request it, prerecorded MP4/WebM video is uploaded to
              private temporary storage and sent to OpenAI for timestamped
              transcription (Phase 6).
            </li>
            <li>
              <strong>Caption timing &amp; formatting (deterministic):</strong>{" "}
              Caption cues, SRT, and WebVTT are built locally from model
              timestamps using readability heuristics—not legal WCAG pass/fail
              labels.
            </li>
            <li>
              <strong>Caption quality (rule-based):</strong> Overlap, reading
              speed, line length, and similar checks are deterministic heuristics
              for human review.
            </li>
            <li>
              <strong>Visual information (sampled-frame AI):</strong> Optional
              review sends a limited set of resized frames plus transcript
              context to OpenAI when you click Review—may miss unsampled events.
            </li>
            <li>
              <strong>Non-speech audio:</strong> Meaningful sounds (music,
              alarms, applause) require human review; speech models may not
              capture them.
            </li>
            <li>
              <strong>Human review:</strong> Context, brand voice, whether alt
              text is sufficient, transcript accuracy, caption timing, and final
              publishing in the native app always require human judgment.
            </li>
          </ul>

          <h2 id="batch">Batch accessibility preflight (Phase 8)</h2>
          <p>
            The batch checker imports CSV (and optional ZIP images) locally,
            then runs the same deterministic Phase 1 engine, screen reader
            summary, and platform checklist logic per row. AI image review runs
            only for rows you select, through the existing Phase 2 API—one
            request per image, with concurrency and session limits.
          </p>

          <h2 id="website-scanner">Website accessibility scanner (Phase 9)</h2>
          <p>
            Public URLs are scanned on the server in isolated Chromium via
            Playwright. Automated rules come from axe-core (WCAG A/AA tags
            enabled in this product, plus optional best-practice rules). axe
            &quot;incomplete&quot; results and the manual checklist are treated as
            human review—not pass or fail. Optional AI explains fixes; it does
            not determine compliance.
          </p>
          <h3 id="result-intelligence">Result intelligence (Strengthening S1)</h3>
          <ul>
            <li>
              <strong>Four evidence levels:</strong> automated rule detection,
              direct measurement, AI-assisted observation, and human evaluation.
              One method does not replace another.
            </li>
            <li>
              <strong>Root causes:</strong> repeated findings may be grouped into
              likely shared patterns to help fix once across many pages—grouping
              is guidance, not guaranteed shared source code.
            </li>
            <li>
              <strong>Priority vs impact:</strong> axe impact is preserved;
              remediation priority considers repetition and reach and is not a
              legal-risk rating.
            </li>
            <li>
              <strong>WCAG coverage matrix:</strong> distinguishes automated,
              partial, and manual criteria. No automated violation detected is
              not the same as passing a criterion when human review is still
              required.
            </li>
          </ul>
          <h3 id="result-ux">Result UX &amp; Fix Lab (Strengthening S2)</h3>
          <ul>
            <li>
              <strong>Workflow tabs:</strong> Overview (Start Here priorities), Issues
              (grouped views), Fix plan with Fix Lab, Human review, and Report.
            </li>
            <li>
              <strong>Explanation levels:</strong> Simple (default), developer, and
              standard WCAG detail—without replacing human judgment.
            </li>
            <li>
              <strong>Verification:</strong> Mark fixes in the fix plan and rescan to
              compare snapshots; verification is never assumed from status alone.
            </li>
          </ul>
          <ul>
            <li>
              <strong>Rendering:</strong> Playwright Chromium (JavaScript enabled,
              bounded lazy scroll).
            </li>
            <li>
              <strong>Not checked automatically:</strong> Full keyboard traversal,
              logged-in experiences, caption accuracy, alt-text quality in context,
              every WCAG success criterion.
            </li>
          </ul>

          <h2 id="preflight-report">Accessibility Preflight Report (Phase 7)</h2>
          <p>
            The client-ready report aggregates results already produced in your
            browser session. Generating or exporting a report does not call
            OpenAI and does not upload draft content to our servers. Reports are
            not stored on our infrastructure; you control PDF, print, JSON, and
            text exports locally.
          </p>

          <h2 id="local-vs-server">What runs where</h2>
          <p>
            Local preflight, contrast sampling, screen reader preview text,
            platform checklists, video preview, caption editing, report assembly,
            and export files run in your browser. Server processing is used for
            temporary video storage, transcription, optional visual frame review,
            optional AI image analysis, and website scanning—all only on explicit
            user action (AI fix guidance is separate from scanning).
          </p>

          <h2 id="not-included">What we do not check</h2>
          <p>
            Entire-website audits (crawl is capped), login-protected pages, PDF
            accessibility, live streaming captions, auto-publishing, and legal
            determinations are out of scope.
          </p>

          <h2 id="platform-review">Platform guidance review date</h2>
          <p>
            Platform-specific capability notes were last reviewed October 2026.
            Platform UIs change; verify steps in the official app before you
            publish.
          </p>
        </LegalProse>
      </InteriorMarketingLayout>
    </>
  );
}
