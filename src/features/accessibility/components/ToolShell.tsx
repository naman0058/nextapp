import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const STEPS = [
  "Choose platform",
  "Add caption",
  "Upload image",
  "Run accessibility preflight",
] as const;

export function ToolShell() {
  return (
    <Card as="article" className="overflow-hidden p-0">
      <div className="border-b border-border bg-muted-bg px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">
            Preflight workflow
          </h3>
          <Badge className="border border-green-200 bg-green-50 text-green-900">
            Available now
          </Badge>
        </div>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((label, index) => (
            <li
              key={label}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              <span className="font-semibold text-foreground">
                {index + 1}. {label}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="space-y-4 p-6">
        <p className="text-sm text-muted">
          The Social Media Accessibility Checker runs real deterministic checks in
          your browser—captions, hashtags, emoji patterns, styled text, and basic
          alt-text readiness when you upload an image.
        </p>
        <Button
          href="/social-media-accessibility-checker"
          variant="primary"
        >
          Open Social Media Checker
        </Button>
        <p className="text-xs text-muted">
          Platform checkers:{" "}
          <Link href="/instagram-accessibility-checker" className="font-medium text-primary hover:underline">
            Instagram
          </Link>
          {" · "}
          <Link href="/facebook-accessibility-checker" className="font-medium text-primary hover:underline">
            Facebook
          </Link>
          {" · "}
          <Link href="/linkedin-accessibility-checker" className="font-medium text-primary hover:underline">
            LinkedIn
          </Link>
          {" · "}
          <Link href="/x-accessibility-checker" className="font-medium text-primary hover:underline">
            X
          </Link>
          .{" "}
          <Link href="/#tools" className="font-medium text-primary hover:underline">
            All tools
          </Link>
        </p>
      </div>
    </Card>
  );
}
