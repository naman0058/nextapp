export type ManualReviewDefinition = {
  id: string;
  title: string;
  whyHumanReview: string;
  testSteps: string[];
  relatedWcagCriteria?: string[];
  relevanceTags: string[];
};

export const MANUAL_REVIEW_LIBRARY: ManualReviewDefinition[] = [
  {
    id: "keyboard-full-page",
    title: "Keyboard operability",
    whyHumanReview:
      "Automated rules cannot reliably determine whether every interactive control is reachable and operable with a keyboard.",
    testSteps: [
      "Place focus at the top of the page.",
      "Use Tab and Shift+Tab through interactive controls.",
      "Verify every control is reachable and activatable.",
      "Verify focus does not become trapped.",
      "Use Enter/Space on buttons and links as appropriate.",
    ],
    relatedWcagCriteria: ["2.1.1", "2.1.2"],
    relevanceTags: ["interactive", "always"],
  },
  {
    id: "focus-order",
    title: "Focus order",
    whyHumanReview:
      "Automated checks cannot confirm that focus order matches a meaningful reading sequence.",
    testSteps: [
      "Tab through the page and note focus order.",
      "Compare order to visual reading order.",
    ],
    relatedWcagCriteria: ["2.4.3"],
    relevanceTags: ["interactive"],
  },
  {
    id: "alt-meaning",
    title: "Meaningful alternative text",
    whyHumanReview:
      "Automation can detect missing alt attributes but not whether alt text is appropriate in context.",
    testSteps: [
      "Review each meaningful image in context.",
      "Confirm alt text communicates equivalent purpose.",
    ],
    relatedWcagCriteria: ["1.1.1"],
    relevanceTags: ["images"],
  },
  {
    id: "form-errors",
    title: "Form errors and instructions",
    whyHumanReview:
      "Automated rules cannot fully evaluate error identification, suggestions, and recovery.",
    testSteps: [
      "Submit forms with intentional errors.",
      "Verify errors are identified and associated with fields.",
    ],
    relatedWcagCriteria: ["3.3.1", "3.3.2", "3.3.3"],
    relevanceTags: ["forms"],
  },
  {
    id: "modal-keyboard",
    title: "Modal and dialog keyboard behavior",
    whyHumanReview:
      "Focus management in dialogs requires interactive testing.",
    testSteps: [
      "Open each dialog with keyboard.",
      "Verify focus moves into the dialog.",
      "Press Escape and verify focus returns appropriately.",
    ],
    relatedWcagCriteria: ["2.1.2", "2.4.3"],
    relevanceTags: ["dialogs"],
  },
  {
    id: "video-captions",
    title: "Video captions and alternatives",
    whyHumanReview:
      "Automation cannot verify caption accuracy or whether audio description is needed.",
    testSteps: [
      "Play video content.",
      "Verify captions exist and match spoken content where required.",
    ],
    relatedWcagCriteria: ["1.2.2", "1.2.3"],
    relevanceTags: ["video"],
  },
];
