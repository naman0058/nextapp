export type ManualReviewItemId = string;

export type ManualReviewItemDef = {
  id: ManualReviewItemId;
  title: string;
  detail: string;
};

export const WEBSITE_MANUAL_REVIEW_ITEMS: ManualReviewItemDef[] = [
  {
    id: "keyboard-full-page",
    title: "Keyboard navigation through entire page",
    detail: "Use Tab, Shift+Tab, Enter, Space, Escape, and arrow keys where expected.",
  },
  {
    id: "focus-order",
    title: "Logical focus order",
    detail: "Focus should follow a meaningful reading sequence.",
  },
  {
    id: "focus-visible",
    title: "Visible focus in all interactive states",
    detail: "Check buttons, links, and form fields including hover and active states.",
  },
  {
    id: "keyboard-traps",
    title: "No keyboard traps",
    detail: "You should be able to leave modals, menus, and widgets with the keyboard.",
  },
  {
    id: "modal-keyboard",
    title: "Modal and dialog keyboard behavior",
    detail: "Verify focus management, Escape to close, and return focus.",
  },
  {
    id: "alt-meaning",
    title: "Meaningfulness of image alt text",
    detail: "Automated tools cannot judge whether alt text is appropriate in context.",
  },
  {
    id: "headings",
    title: "Heading structure appropriateness",
    detail: "Headings should reflect document outline and not skip levels unnecessarily.",
  },
  {
    id: "link-purpose",
    title: "Link purpose in context",
    detail: "Link text should make sense when read out of surrounding prose.",
  },
  {
    id: "form-errors",
    title: "Form error recovery",
    detail: "Errors should be clear, associated with fields, and recoverable.",
  },
  {
    id: "dynamic-status",
    title: "Dynamic status messages",
    detail: "Live regions and announcements for async updates.",
  },
  {
    id: "zoom-reflow",
    title: "Zoom and reflow at 200%",
    detail: "Content should reflow without loss of information at 200% zoom.",
  },
  {
    id: "touch-targets",
    title: "Touch target usability",
    detail: "Especially on mobile; automated target-size rules may not cover all cases.",
  },
  {
    id: "screen-reader",
    title: "Screen reader usability",
    detail: "This scan does not simulate assistive technology.",
  },
];
