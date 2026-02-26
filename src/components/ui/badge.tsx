import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "outline" | "success" | "warning";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly variant?: BadgeVariant;
}

export function Badge({
  variant = "default",
  className,
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium";

  const variantClass =
    variant === "default"
      ? "border-sky-200 bg-sky-50 text-sky-700"
      : variant === "outline"
        ? "border-slate-300 text-slate-700"
        : variant === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span className={cn(base, variantClass, className ?? "")} {...props} />
  );
}

