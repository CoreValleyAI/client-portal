"use client";

// Client component: holds genuine uncontrolled state.
// Ported from design_system/components/forms/Switch.jsx.
import * as React from "react";
import { cn } from "@/lib/cn";

const SIZES = {
  sm: { track: "h-5 w-8.5", knob: "size-3.5", on: "left-[15px]", off: "left-[3px]" },
  md: { track: "h-6 w-10.5", knob: "size-4.5", on: "left-[21px]", off: "left-[3px]" },
} as const;

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: keyof typeof SIZES;
  className?: string;
  /** Accessible name when there is no visible <label>. */
  label?: string;
}

export function Switch({
  checked: controlled,
  defaultChecked = false,
  onChange,
  disabled = false,
  size = "md",
  className,
  label,
}: SwitchProps) {
  const [internal, setInternal] = React.useState(defaultChecked);
  const checked = controlled === undefined ? internal : controlled;
  const s = SIZES[size];

  function toggle() {
    if (disabled) return;
    if (controlled === undefined) setInternal((v) => !v);
    onChange?.(!checked);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={toggle}
      className={cn(
        "relative shrink-0 rounded-pill border p-0",
        "transition-[background-color] duration-normal ease-standard",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hydro",
        s.track,
        checked
          ? "border-transparent bg-hydro shadow-[0_0_14px_rgba(74,222,128,0.35)]"
          : "border-line-strong bg-carbon-500",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 -translate-y-1/2 rounded-pill",
          "transition-[left] duration-normal ease-standard",
          s.knob,
          checked ? `${s.on} bg-carbon-900` : `${s.off} bg-ink-300`,
        )}
      />
    </button>
  );
}
