export type ResultViewTab =
  | "overview"
  | "issues"
  | "fix-plan"
  | "human-review"
  | "coverage"
  | "inventory"
  | "report";

export type IssuesGroupBy =
  | "root-cause"
  | "rule"
  | "page"
  | "category"
  | "wcag";

export type ExplanationLevel = "simple" | "developer" | "standard";

/** User-set workflow status only — verification comes from rescan comparison. */
export type UserFixTaskStatus =
  | "not_started"
  | "in_review"
  | "user_marked_fixed";

export type DisplayFixTaskStatus =
  | "Not Started"
  | "In Review"
  | "User Marked Fixed"
  | "No longer detected in this automated rescan"
  | "Partially Improved"
  | "Still Present"
  | "Human Review Required";
