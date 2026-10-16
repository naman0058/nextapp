import Link from "next/link";
import { siteConfig } from "@/config/site";

type BrandLogoProps = {
  variant?: "light" | "dark";
  className?: string;
};

export function BrandLogo({ variant = "dark", className = "" }: BrandLogoProps) {
  const text = variant === "light" ? "text-white" : "text-foreground";
  const sub = variant === "light" ? "text-indigo-200" : "text-muted";

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${className}`}
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 text-sm font-bold text-white shadow-md"
        aria-hidden="true"
      >
        CP
      </span>
      <span className="flex flex-col leading-tight">
        <span className={`font-display text-base font-bold tracking-tight ${text}`}>
          {siteConfig.shortName}
        </span>
        <span className={`hidden text-xs sm:block ${sub}`}>
          {siteConfig.tagline}
        </span>
      </span>
    </Link>
  );
}
