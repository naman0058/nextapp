import type {
  WebsitePageScanRequest,
  WebsitePageScanResult,
} from "@/features/website-scanner/types/scanTypes";
import type {
  WebsiteVisualLocatorRequest,
  WebsiteVisualLocatorResult,
} from "@/features/website-scanner/types/visualLocator";

export interface WebsiteScannerRuntime {
  scanPage(request: WebsitePageScanRequest): Promise<WebsitePageScanResult>;
  visualizeIssue(
    request: WebsiteVisualLocatorRequest,
  ): Promise<WebsiteVisualLocatorResult>;
}
