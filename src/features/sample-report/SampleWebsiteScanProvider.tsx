"use client";

import type { ReactNode } from "react";
import { WebsiteScanProvider } from "@/features/website-scanner/context/WebsiteScanProvider";
import type { SampleAccessibilityReportFixture } from "@/features/sample-report/buildSampleAccessibilityReportFixture";

type Props = {
  fixture: SampleAccessibilityReportFixture;
  children: ReactNode;
};

export function SampleWebsiteScanProvider({ fixture, children }: Props) {
  return (
    <WebsiteScanProvider initialState={fixture.session} sampleMode>
      {children}
    </WebsiteScanProvider>
  );
}
