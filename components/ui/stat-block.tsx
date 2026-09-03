// Server component — the design-system original was already hook-free.
// Ported from design_system/components/display/StatBlock.jsx.
//
// Brand rule: exactly one `accent` figure per cluster; keep the rest Ink.
import * as React from "react";
import { cn } from "@/lib/cn";

const VALUE_SIZE = {
  sm: "text-[28px]",
  md: "text-[42px]",
  lg: "text-[56px]",
} as const;

export interface StatBlockProps extends React.ComponentPropsWithRef<"div"> {
  value: React.ReactNode;
  label: React.ReactNode;
  /** Optional supporting line under the label. */
  sub?: React.ReactNode;
  accent?: boolean;
  size?: keyof typeof VALUE_SIZE;
  align?: "left" | "center" | "right";
}

export function StatBlock({
  value,
  label,
  sub,
  accent = false,
  size = "md",
  align = "left",
  className,
  ...rest
}: StatBlockProps) {
  return (
    <div
      className={cn(
        align === "center" && "text-center",
        align === "right" && "text-right",
        className,
      )}
      {...rest}
    >
      <div
        className={cn(
          "font-mono font-medium leading-none tracking-tight",
          VALUE_SIZE[size],
          accent
            ? "text-hydro [text-shadow:0_0_28px_rgba(74,222,128,0.30)]"
            : "text-ink-100",
        )}
      >
        {value}
      </div>
      <div className="mt-2.5 cv-label">{label}</div>
      {sub ? (
        <div className="mt-1.5 font-body text-[13px] font-light text-ink-400">
          {sub}
        </div>
      ) : null}
    </div>
  );
}
