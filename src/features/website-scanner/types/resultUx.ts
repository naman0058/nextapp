export type ResultViewTab =
  | "overview"
  | "issues"
  | "fix-plan"
  | "human-review"
  | "inventory"
  | "report";

export type IssuesGroupBy = "root-cause" | "rule" | "page";

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
  | "Verified by Rescan"
  | "Partially Improved"
  | "Still Present"
  | "Human Review Required";
