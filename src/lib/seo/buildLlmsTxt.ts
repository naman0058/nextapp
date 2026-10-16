import { getSiteUrl } from "@/lib/env";
import { getSiteSeoConfig } from "@/lib/seo/site-config";

export function buildLlmsTxt(): string {
  const base = getSiteUrl();
  const seo = getSiteSeoConfig();
  const u = (path: string) => `${base}${path}`;

  return `# ${seo.siteName}

> Free accessibility preflight tools and practical guidance for reviewing web, social, image, and video content before publishing.

## Core Tools

- [Website Accessibility Scanner](${u("/website-accessibility-scanner")})
- [Social Media Accessibility Checker](${u("/social-media-accessibility-checker")})
- [Color Contrast Checker](${u("/image-contrast-checker")})
- [Screen Reader Preview](${u("/screen-reader-preview")})
- [Video Accessibility Checker](${u("/video-accessibility-checker")})
- [Batch Accessibility Checker](${u("/batch-accessibility-checker")})

## Reports

- [Sample Accessibility Report](${u("/sample-accessibility-report")}) (fictional demonstration)
- [Accessibility Preflight Report info](${u("/accessibility-preflight-report")})
- [Methodology](${u("/methodology")})

## Accessibility Guides

- [Blog / guides index](${u("/blog")})

## Trust

- [About](${u("/about")})
- [Accessibility Statement](${u("/accessibility")})
- [Privacy](${u("/privacy")})
- [Terms](${u("/terms")})
- [Disclaimer](${u("/disclaimer")})
- [Contact](${u("/contact")})

## Important Limitation

Automated accessibility testing cannot establish complete accessibility or legal compliance. Human evaluation is required for criteria that automation cannot determine.

## Note on this file

This file is provided for machine-readable discovery by systems that choose to use it. It is not relied upon for Google Search rankings.
`;
}
