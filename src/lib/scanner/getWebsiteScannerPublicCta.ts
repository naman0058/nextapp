import "server-only";

export type WebsiteScannerPublicCta = {
  available: boolean;
  href: string;
  label: string;
  secondaryLabel?: string;
  unavailableMessage?: string;
};

export function getWebsiteScannerPublicCta(): WebsiteScannerPublicCta {
  const enabled =
    process.env.WEBSITE_SCANNER_PUBLIC_ENABLED === "1" ||
    process.env.WEBSITE_SCANNER_PUBLIC_ENABLED === "true";

  if (enabled) {
    return {
      available: true,
      href: "/website-accessibility-scanner",
      label: "Run your accessibility preflight",
      secondaryLabel: "Scan your website",
    };
  }

  return {
    available: false,
    href: "/tools",
    label: "Explore accessibility tools",
    unavailableMessage:
      "The public website scanner is temporarily unavailable while production network controls are verified.",
  };
}
