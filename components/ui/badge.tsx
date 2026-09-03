// Server component — the design-system original was already hook-free.
// Ported from design_system/components/display/Badge.jsx.
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5 whitespace-nowrap",
    "font-mono text-[11px] font-medium uppercase tracking-[0.04em]",
    "rounded-pill border px-2.25 py-[3px] leading-[1.4]",
  ],
  {
    variants: {
      tone: {
        neutral: "text-ink-300 bg-carbon-500 border-line",
        hydro: "text-hydro bg-hydro/10 border-hydro",
        success: "text-success bg-success/10 border-success/30",
        warning: "text-warning bg-warning/10 border-warning/30",
        danger: "text-danger bg-danger/10 border-danger/30",
        info: "text-info bg-info/10 border-info/30",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

const DOT_TONE = {
  neutral: "bg-ink-400",
  hydro: "bg-hydro shadow-[0_0_6px_var(--hydro)]",
  success: "bg-success shadow-[0_0_6px_var(--success)]",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
} as const;

export interface BadgeProps
  extends React.ComponentPropsWithRef<"span">,
    VariantProps<typeof badgeVariants> {
  /** Leading status dot. Glows on hydro and success, matching the original. */
  dot?: boolean;
}

export function Badge({
  className,
  tone = "neutral",
  dot = false,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...rest}>
      {dot ? (
        <span
          className={cn("size-1.5 rounded-pill", DOT_TONE[tone ?? "neutral"])}
        />
      ) : null}
      {children}
    </span>
  );
}

export { badgeVariants };
