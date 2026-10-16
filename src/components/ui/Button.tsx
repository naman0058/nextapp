import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover border border-transparent",
  secondary:
    "bg-card text-foreground border border-border hover:bg-muted-bg",
  ghost: "text-foreground hover:bg-muted-bg border border-transparent",
} as const;

type ButtonVariant = keyof typeof variantClasses;

const baseClasses =
  "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50";

type SharedProps = {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    href?: undefined;
  };

type ButtonAsLink = SharedProps &
  Omit<ComponentProps<typeof Link>, "className" | "children">;

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { variant = "primary", className, children } = props;
  const classes = cn(baseClasses, variantClasses[variant], className);

  if ("href" in props && props.href) {
    const { href } = props;
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  const {
    type = "button",
    disabled,
    onClick,
    variant: _variant,
    className: _className,
    children: _children,
    ...nativeProps
  } = props as ButtonAsButton;
  void _variant;
  void _className;
  void _children;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
      {...nativeProps}
    >
      {children}
    </button>
  );
}
