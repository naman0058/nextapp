import { cn } from "@/lib/utils";

const variantStyles = {
  loading: "border-border bg-muted-bg text-foreground",
  processing: "border-border bg-muted-bg text-foreground",
  error: "border-red-200 bg-red-50 text-error",
  success: "border-green-200 bg-green-50 text-success",
  review: "border-amber-200 bg-amber-50 text-warning",
} as const;

export type StatusVariant = keyof typeof variantStyles;

type StatusMessageProps = {
  variant: StatusVariant;
  title: string;
  children?: React.ReactNode;
  className?: string;
};

export function StatusMessage({
  variant,
  title,
  children,
  className,
}: StatusMessageProps) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        variantStyles[variant],
        className,
      )}
    >
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-1 text-muted">{children}</div>}
    </div>
  );
}
