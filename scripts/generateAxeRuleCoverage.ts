import fs from "node:fs";
import path from "path";

import axe from "axe-core";
import {
  AXE_EXPLICIT_RULE_IDS,
  AXE_WCAG_TAG_SET,
  buildAxeRunTags,
} from "../src/features/website-scanner/constants/axeScanConfig";

const tags = buildAxeRunTags(true);
const rules = axe.getRules(tags);

const lines: string[] = [
  "# Axe rule coverage",
  "",
  `Generated: ${new Date().toISOString().slice(0, 10)}`,
  "",
  `Installed axe-core: ${axe.version}`,
  "",
  "## Tags enabled",
  "",
  ...tags.map((t) => `- ${t}`),
  "",
  "## Explicit rule IDs",
  "",
  ...(AXE_EXPLICIT_RULE_IDS.length
    ? AXE_EXPLICIT_RULE_IDS.map((id) => `- ${id}`)
    : ["- (none)"]),
  "",
  `## Rules (${rules.length})`,
  "",
  "| Rule ID | Impact | WCAG tags |",
  "| --- | --- | --- |",
];

for (const rule of rules.sort((a, b) => a.ruleId.localeCompare(b.ruleId))) {
  const wcagTags = rule.tags.filter((t) =>
    (AXE_WCAG_TAG_SET as readonly string[]).includes(t) || t.startsWith("wcag"),
  );
  lines.push(
    `| ${rule.ruleId} | ${(rule as { impact?: string }).impact ?? "unknown"} | ${wcagTags.join(", ") || "—"} |`,
  );
}

lines.push(
  "",
  "Best-practice rules are separated in scan results and must not be treated as WCAG failures.",
);

const out = path.join(process.cwd(), "AXE_RULE_COVERAGE.md");
fs.writeFileSync(out, lines.join("\n"), "utf8");
console.info(`Wrote ${out}`);
