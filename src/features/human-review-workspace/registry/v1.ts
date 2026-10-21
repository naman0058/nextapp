import type { HumanReviewCheckDefinition } from "@/features/human-review-workspace/types";
import { WEBSITE_MANUAL_REVIEW_ITEMS } from "@/features/website-scanner/constants/manualReviewChecklist";

const EXTRA_STEPS: Record<string, string[]> = {
  "keyboard-full-page": [
    "Place focus at the top of the page.",
    "Use Tab and Shift+Tab through interactive controls.",
    "Verify every control is reachable and activatable.",
    "Verify focus does not become trapped.",
  ],
  "focus-order": [
    "Tab through the page and note focus order.",
    "Compare order to visual reading order.",
  ],
  "focus-visible": [
    "Tab to each interactive control.",
    "Confirm a visible focus indicator in default, hover, and active states where applicable.",
  ],
  "keyboard-traps": [
    "Open menus, modals, and widgets.",
    "Confirm you can exit using keyboard alone.",
  ],
  "modal-keyboard": [
    "Open each dialog with keyboard.",
    "Verify focus moves into the dialog.",
    "Press Escape and verify focus returns appropriately.",
  ],
  "alt-meaning": [
    "Review each meaningful image in context.",
    "Confirm alt text communicates equivalent purpose.",
  ],
  "headings": [
    "Review heading levels in reading order.",
    "Confirm headings describe structure without skipping levels unnecessarily.",
  ],
  "link-purpose": [
    "Read link text out of surrounding prose.",
    "Confirm purpose is clear in context.",
  ],
  "form-errors": [
    "Submit forms with intentional errors.",
    "Verify errors are identified, associated with fields, and recoverable.",
  ],
  "dynamic-status": [
    "Trigger async updates (filters, toasts, live regions).",
    "Verify status is announced or visible without relying on color alone.",
  ],
  "zoom-reflow": [
    "Zoom to 200%.",
    "Confirm content reflows without loss of information or functionality.",
  ],
  "touch-targets": [
    "On a mobile viewport, attempt to activate controls.",
    "Confirm targets are usable without accidental activation.",
  ],
  "screen-reader": [
    "Use your preferred assistive technology or the Screen Reader Preview tool for hints only.",
    "Verify names, roles, and reading order are sensible.",
  ],
};

const CATEGORY: Record<string, HumanReviewCheckDefinition["category"]> = {
  "keyboard-full-page": "keyboard_focus",
  "focus-order": "keyboard_focus",
  "focus-visible": "keyboard_focus",
  "keyboard-traps": "keyboard_focus",
  "modal-keyboard": "keyboard_focus",
  "alt-meaning": "semantics",
  headings: "semantics",
  "link-purpose": "semantics",
  "form-errors": "forms",
  "dynamic-status": "general",
  "zoom-reflow": "responsive",
  "touch-targets": "responsive",
  "screen-reader": "semantics",
  "video-captions": "media",
};

const TAGS: Record<string, string[]> = {
  "keyboard-full-page": ["interactive", "always"],
  "focus-order": ["interactive"],
  "focus-visible": ["interactive"],
  "keyboard-traps": ["interactive", "dialogs"],
  "modal-keyboard": ["dialogs"],
  "alt-meaning": ["images"],
  headings: ["headings"],
  "link-purpose": ["interactive"],
  "form-errors": ["forms"],
  "dynamic-status": ["interactive"],
  "zoom-reflow": ["always"],
  "touch-targets": ["mobile"],
  "screen-reader": ["always"],
  "video-captions": ["video"],
};

const TOOLS: Record<string, HumanReviewCheckDefinition["relatedToolIds"]> = {
  "alt-meaning": ["image_alt_checker"],
  "screen-reader": ["screen_reader_preview"],
  "video-captions": ["video_accessibility"],
};

const WCAG: Record<string, string[]> = {
  "keyboard-full-page": ["2.1.1", "2.1.2"],
  "focus-order": ["2.4.3"],
  "focus-visible": ["2.4.7"],
  "alt-meaning": ["1.1.1"],
  "form-errors": ["3.3.1", "3.3.2", "3.3.3"],
  "modal-keyboard": ["2.1.2", "2.4.3"],
  "video-captions": ["1.2.2", "1.2.3"],
  "zoom-reflow": ["1.4.10"],
  "touch-targets": ["2.5.8"],
};

function whyFor(id: string, title: string): string {
  const map: Record<string, string> = {
    "keyboard-full-page":
      "Automation cannot prove every interactive control is reachable and operable with a keyboard.",
    "focus-order":
      "Automated checks cannot confirm focus order matches a meaningful reading sequence.",
    "focus-visible":
      "Missing or low-contrast focus styles require visual confirmation across states.",
    "keyboard-traps":
      "Automation cannot reliably detect focus traps in custom widgets.",
    "modal-keyboard":
      "Dialog focus management requires interactive testing.",
    "alt-meaning":
      "Automation can detect some alt conditions but not contextual meaningfulness.",
    headings:
      "Heading hierarchy appropriateness requires human judgment of document structure.",
    "link-purpose":
      "Link purpose in context cannot be fully evaluated by automation alone.",
    "form-errors":
      "Error identification, suggestions, and recovery need interactive testing.",
    "dynamic-status":
      "Live updates and status messaging require observation during interaction.",
    "zoom-reflow":
      "Reflow and loss of content at 200% zoom requires manual verification.",
    "touch-targets":
      "Touch usability on mobile viewports is not fully covered by automated target-size rules alone.",
    "screen-reader":
      "This scan does not simulate assistive technology; usability requires human testing.",
    "video-captions":
      "Automation cannot verify caption accuracy or completeness for all media.",
  };
  return map[id] ?? `Human judgment is required for: ${title}.`;
}

function buildFromWebsiteItems(): HumanReviewCheckDefinition[] {
  return WEBSITE_MANUAL_REVIEW_ITEMS.map((item) => ({
    id: item.id,
    version: 1,
    title: item.title,
    category: CATEGORY[item.id] ?? "general",
    description: item.detail,
    whyHumanReviewRequired: whyFor(item.id, item.title),
    procedureSteps: EXTRA_STEPS[item.id] ?? [item.detail],
    relatedWcagMappings: WCAG[item.id] ?? [],
    relatedAutomatedRuleIds: [],
    relatedToolIds: TOOLS[item.id] ?? [],
    relevanceTags: TAGS[item.id] ?? ["always"],
    evidenceSuggestions: ["reviewer_note"],
  }));
}

const VIDEO_CHECK: HumanReviewCheckDefinition = {
  id: "video-captions",
  version: 1,
  title: "Video captions and alternatives",
  category: "media",
  description: "Verify captions/transcripts where video content is present.",
  whyHumanReviewRequired: whyFor("video-captions", "Video captions"),
  procedureSteps: EXTRA_STEPS["video-captions"] ?? [
    "Play video content.",
    "Verify captions or alternatives match spoken content where required.",
  ],
  relatedWcagMappings: WCAG["video-captions"] ?? [],
  relatedAutomatedRuleIds: ["video-caption", "audio-caption"],
  relatedToolIds: ["video_accessibility"],
  relevanceTags: ["video"],
  evidenceSuggestions: ["video_review_observation", "reviewer_note"],
};

const BASE = buildFromWebsiteItems();
export const HUMAN_REVIEW_REGISTRY_V1: HumanReviewCheckDefinition[] =
  BASE.some((d) => d.id === "video-captions") ? BASE : [...BASE, VIDEO_CHECK];

export function getHumanReviewDefinition(
  checkDefinitionId: string,
): HumanReviewCheckDefinition | undefined {
  return HUMAN_REVIEW_REGISTRY_V1.find((d) => d.id === checkDefinitionId);
}

export const HUMAN_REVIEW_REGISTRY_VERSION = 1;
