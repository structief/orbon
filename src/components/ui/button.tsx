import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly icon?: ReactNode;
  readonly asChild?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  asChild,
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 focus-visible:ring-offset-slate-50 disabled:opacity-60 disabled:cursor-not-allowed";

  const variantClass =
    variant === "primary"
      ? "bg-sky-600 text-white hover:bg-sky-500"
      : variant === "secondary"
        ? "bg-slate-900 text-slate-50 hover:bg-slate-800"
        : variant === "outline"
          ? "border border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100"
          : "bg-transparent text-slate-600 hover:bg-slate-100";

  const sizeClass =
    size === "sm"
      ? "h-8 px-3 text-xs"
      : size === "lg"
        ? "h-11 px-5 text-sm"
        : "h-9 px-4 text-sm";

  const mergedClassName = cn(base, variantClass, sizeClass, className ?? "");

  if (asChild && isValidElement(children)) {
    return cloneElement(children as React.ReactElement<{ className?: string }>, {
      className: cn(mergedClassName, (children as React.ReactElement<{ className?: string }>).props?.className),
    });
  }

  return (
    <button
      className={mergedClassName}
      {...props}
    >
      {icon ? <span className="text-base">{icon}</span> : null}
      {children}
    </button>
  );
}

