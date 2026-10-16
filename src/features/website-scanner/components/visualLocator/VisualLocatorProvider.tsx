"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { VisualIssueLocatorDialog } from "@/features/website-scanner/components/visualLocator/VisualIssueLocatorDialog";
import { useVisualIssueLocator } from "@/features/website-scanner/hooks/useVisualIssueLocator";
import type { LocatorOccurrence } from "@/features/website-scanner/utils/visualLocator/collectLocatorOccurrences";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

type VisualLocatorContextValue = {
  openForRule: (
    occurrences: LocatorOccurrence[],
    title: string,
    trigger: HTMLElement | null,
    startIndex?: number,
  ) => void;
};

const VisualLocatorContext = createContext<VisualLocatorContextValue | null>(
  null,
);

type ProviderProps = {
  children: ReactNode;
  /** Changes when a new scan completes — clears cached locator images. */
  scanSessionKey?: string | null;
  completedPages?: WebsitePageScanResult[];
};

export function VisualLocatorProvider({
  children,
  scanSessionKey,
  completedPages = [],
}: ProviderProps) {
  const locator = useVisualIssueLocator();
  const { invalidateCache } = locator;

  useEffect(() => {
    invalidateCache();
  }, [scanSessionKey, invalidateCache]);

  const value: VisualLocatorContextValue = {
    openForRule: (occurrences, title, trigger, startIndex = 0) => {
      locator.openLocator(occurrences, startIndex, title, trigger);
    },
  };

  return (
    <VisualLocatorContext.Provider value={value}>
      {children}
      <VisualIssueLocatorDialog
        open={locator.open}
        title={locator.title}
        evidence={locator.evidence}
        occurrences={locator.occurrences}
        activeIndex={locator.activeIndex}
        totalOccurrences={locator.occurrences.length}
        onClose={locator.close}
        onPrev={locator.goPrev}
        onNext={locator.goNext}
        onSwitchViewport={locator.switchViewport}
        completedPages={completedPages}
      />
    </VisualLocatorContext.Provider>
  );
}

export function useVisualLocatorContext(): VisualLocatorContextValue {
  const ctx = useContext(VisualLocatorContext);
  if (!ctx) {
    throw new Error("VisualLocatorProvider required");
  }
  return ctx;
}
