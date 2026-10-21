import type { AxeResults } from "axe-core";

export function mockAxeNode(html = "<div>x</div>") {
  return {
    target: ["div"],
    html,
    failureSummary: "Fix issue",
  };
}

export function mockAxeViolation(
  id: string,
  tags: string[],
  options?: { impact?: string; nodeCount?: number; bestPractice?: boolean },
) {
  const nodeCount = options?.nodeCount ?? 1;
  const allTags = options?.bestPractice
    ? [...tags, "best-practice"]
    : tags;
  return {
    id,
    impact: options?.impact ?? "serious",
    help: `${id} help`,
    description: `${id} description`,
    helpUrl: "https://example.com/rules/" + id,
    tags: allTags,
    nodes: Array.from({ length: nodeCount }, () => mockAxeNode(`<div data-r="${id}"></div>`)),
  };
}

export function mockAxeResults(input: {
  violations?: ReturnType<typeof mockAxeViolation>[];
  incomplete?: ReturnType<typeof mockAxeViolation>[];
}): AxeResults {
  return {
    violations: input.violations ?? [],
    incomplete: input.incomplete ?? [],
    passes: [],
    inapplicable: [],
    testEngine: { name: "axe-core", version: "4.13.0" },
  } as unknown as AxeResults;
}
