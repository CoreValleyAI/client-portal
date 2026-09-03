// Server component. Ported from design_system/components/forms/Input.jsx,
// which tracked focus in useState; :focus-within on the wrapper replaces it,
// so this stays off the client bundle.
import * as React from "react";
import { cn } from "@/lib/cn";

const SIZES = {
  sm: { box: "h-8 px-2.5", text: "text-[13px]" },
  md: { box: "h-10 px-3", text: "text-[14px]" },
  lg: { box: "h-12 px-3.5", text: "text-[15px]" },
} as const;

export interface InputProps
  extends Omit<React.ComponentPropsWithRef<"input">, "size" | "prefix"> {
  /** JetBrains Mono, for CLI-flavoured entry. */
  mono?: boolean;
  /** Leading adornment; recolours to Hydro on focus. */
  prefix?: React.ReactNode;
  size?: keyof typeof SIZES;
  wrapperClassName?: string;
}

export function Input({
  mono = false,
  prefix,
  size = "md",
  disabled,
  className,
  wrapperClassName,
  ...rest
}: InputProps) {
  const s = SIZES[size];
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-md border border-line",
        "transition-[border-color,box-shadow] duration-fast ease-standard",
        "focus-within:border-hydro focus-within:shadow-[0_0_0_3px_rgba(74,222,128,0.12)]",
        disabled ? "bg-carbon-700 opacity-55" : "bg-surface-input",
        s.box,
        wrapperClassName,
      )}
    >
      {prefix ? (
        <span className="inline-flex shrink-0 text-fg-muted transition-colors duration-fast group-focus-within:text-hydro">
          {prefix}
        </span>
      ) : null}
      <input
        disabled={disabled}
        className={cn(
          "min-w-0 flex-1 border-none bg-transparent text-ink-100 outline-none",
          "placeholder:text-ink-600",
          mono ? "font-mono font-medium tracking-[0.01em]" : "font-body font-normal",
          s.text,
          className,
        )}
        {...rest}
      />
    </div>
  );
}
