"use client";

import Link from "next/link";
import { TOOL_PAGE_LIST } from "@/config/toolPages";
import { cn } from "@/lib/utils";

type ToolSwitcherNavProps = {
  activePath: string;
};

export function ToolSwitcherNav({ activePath }: ToolSwitcherNavProps) {
  return (
    <nav aria-label="Accessibility tools" className="relative">
      <div className="flex items-center justify-between gap-3 pb-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">Switch tool</p>
        <Link
          href="/tools"
          className="text-xs font-semibold text-primary hover:underline"
        >
          All tools
        </Link>
      </div>
      <div className="surface-soft overflow-x-auto rounded-2xl border border-border bg-card p-1.5">
        <ul className="flex min-w-max gap-1">
          {TOOL_PAGE_LIST.map((tool) => {
            const active = tool.path === activePath;
            return (
              <li key={tool.path} className="list-none">
                <Link
                  href={tool.path}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors sm:px-4",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted hover:bg-muted-bg hover:text-foreground",
                  )}
                >
                  {tool.navLabel}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
