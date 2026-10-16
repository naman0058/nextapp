export type ScanViewportId = "desktop" | "mobile";

export type ScanViewport = {
  id: ScanViewportId;
  label: string;
  width: number;
  height: number;
};

export const SCAN_VIEWPORTS: Record<ScanViewportId, ScanViewport> = {
  desktop: {
    id: "desktop",
    label: "Desktop 1440 × 900",
    width: 1440,
    height: 900,
  },
  mobile: {
    id: "mobile",
    label: "Mobile 390 × 844",
    width: 390,
    height: 844,
  },
};

export function getScanViewport(id: ScanViewportId): ScanViewport {
  return SCAN_VIEWPORTS[id];
}
