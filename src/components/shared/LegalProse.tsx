import { cn } from "@/lib/utils";

type LegalProseProps = {
  children: React.ReactNode;
  className?: string;
};

export function LegalProse({ children, className }: LegalProseProps) {
  return (
    <div
      className={cn(
        "prose-marketing max-w-3xl space-y-6 text-base leading-relaxed text-muted [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
