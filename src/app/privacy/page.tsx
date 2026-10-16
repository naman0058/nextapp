import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { LegalProse } from "@/components/shared/LegalProse";
import { InteriorMarketingLayout } from "@/components/marketing/InteriorMarketingLayout";
import { siteConfig } from "@/config/site";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";

export const metadata = metadataForStaticRoute("/privacy");

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="How local checks, optional AI, and session storage work for your content."
      />
      <InteriorMarketingLayout>
        <LegalProse>
          <p>
            {siteConfig.name} respects your privacy. This starter policy
            describes how we intend to handle information as the platform
            evolves.
          </p>
          <h2>What runs locally</h2>
          <p>
            Deterministic caption and alt-text checks, WCAG contrast measurement,
            screen reader experience preview (text), and platform checklists run
            in your browser. They are not sent to our server for processing.
          </p>
          <p>
            Caption, working caption, alt text, and platform selection may be
            stored in your browser&apos;s session storage so they persist when you
            move between platform checker pages in the same tab. Images are not
            stored in session storage.
          </p>
          <h2>Optional AI image analysis</h2>
          <p>
            If you choose AI image analysis, your image, caption, alt text, and
            platform selection are transmitted to this application&apos;s server
            and then to OpenAI for processing. This application does not
            intentionally persist uploaded images or AI inputs in a database or
            on disk.
          </p>
          <h2>Video transcription and visual review (Phase 6)</h2>
          <p>
            When you generate transcripts and captions, your video is uploaded to
            private temporary storage on our server infrastructure, then sent to
            OpenAI for transcription. The application attempts to delete the
            temporary video after processing. Orphan cleanup may remove files
            older than a configured retention window.
          </p>
          <p>
            Sampled video frames are sent to OpenAI only when you explicitly
            request visual information review. Frames are not intentionally stored
            by this application.
          </p>
          <p>
            Transcripts and caption cues remain in your browser session unless you
            download them. This application does not intentionally persist them in
            a database.
          </p>
          <h2>Screen Reader Experience Preview — speech</h2>
          <p>
            Optional speech playback uses your browser&apos;s speech synthesis
            API. Behavior depends on your browser and operating system. Speech
            text is processed locally and is not sent to our server.
          </p>
          <h2>Batch accessibility checker (Phase 8)</h2>
          <p>
            CSV and ZIP imports are parsed in your browser. Batch rows and
            analysis results are kept in memory for the current session only
            (not intentionally stored in a database or on our servers). Only
            images you explicitly select for AI review are sent through the
            same secure image analysis route as the single-post checker.
          </p>
          <h2>Website accessibility scanner (Phase 9)</h2>
          <p>
            When you submit a public website URL, our server-side scanner visits
            that page in an isolated browser, renders it, and runs automated
            accessibility rules. We do not intentionally store full page HTML.
            Scan results remain in your current browser session unless you export
            them. We do not collect authentication credentials for website
            scanning.
          </p>
          <p>
            If you explicitly request AI fix guidance, short rule summaries and
            sanitized HTML snippets from findings may be sent to OpenAI. Scanning
            itself does not require OpenAI.
          </p>
          <p>
            Social, image, contrast, video, and batch tools offer optional{" "}
            <strong>AI-Assisted Remediation</strong> through the same shared API
            when you click generate — for example caption revisions, alt options,
            contrast design guidance, or a single caption cue. Original content and
            measured contrast values stay in the UI until you choose to apply a
            suggestion.
          </p>
          <p>
            If you choose <strong>View on Page</strong>, we re-visit the same
            public URL on demand, highlight the affected element in a viewport
            screenshot, and return the image to your browser for this session
            only. We do not store those screenshots on our servers or use OpenAI
            for visual location.
          </p>
          <p>
            <strong>Copy Developer Ticket</strong> builds remediation handoff text
            from your current scan results entirely in your browser. Copying or
            downloading a ticket does not send it to Jira, GitHub, or other
            services, and does not use OpenAI unless you separately chose to
            include optional cached AI Fix Lab guidance in the ticket preview.
          </p>
          <h2>Accessibility Preflight Report (Phase 7)</h2>
          <p>
            Reports are assembled in your browser from session data (caption checks,
            contrast samples, optional AI results already obtained, screen reader
            preview, platform confirmations, and video caption state). Export
            actions do not send your draft to our servers for report generation.
            Downloaded files remain on your device; we do not host share links or
            report history.
          </p>
          <h2>Accessibility blog (editorial)</h2>
          <p>
            Public guides on <Link href="/blog">/blog</Link> are stored in a separate
            MongoDB database when configured. That database holds editorial
            articles only (titles, Markdown content, SEO metadata, authors). It
            does not store your scan results, uploaded media, captions, tickets,
            or other tool session data. Reading the blog does not require using
            the accessibility checkers.
          </p>
          <h2>Platform checklists</h2>
          <p>
            Platform publishing guidance does not connect to your social media
            accounts. Before-you-publish confirmations are kept in your browser
            session only.
          </p>
          <h2>Third-party processing</h2>
          <p>
            OpenAI processes content you submit through the AI feature according
            to its own terms and policies. Do not upload sensitive or
            confidential content unless you accept that third-party processing
            risk.
          </p>
          <h2>Storage approach</h2>
          <p>
            We aim to process AI requests temporarily without intentional
            long-term storage of your uploaded content in this application.
          </p>
          <h2>Contact</h2>
          <p>
            Questions about privacy may be sent to{" "}
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="font-medium text-primary hover:underline"
            >
              {siteConfig.contact.email}
            </a>
            .
          </p>
        </LegalProse>
      </InteriorMarketingLayout>
    </>
  );
}
