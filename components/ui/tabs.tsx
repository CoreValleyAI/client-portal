"use client";

// Client component: holds genuine uncontrolled state.
// Ported from design_system/components/forms/Tabs.jsx. Adds roving semantics
// (role="tablist"/"tab") the original lacked.
import * as React from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  badge?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
  "aria-label"?: string;
}

export function Tabs({
  tabs,
  value: controlled,
  defaultValue,
  onChange,
  className,
  "aria-label": ariaLabel,
}: TabsProps) {
  const [internal, setInternal] = React.useState(
    defaultValue ?? tabs[0]?.id ?? "",
  );
  const active = controlled === undefined ? internal : controlled;

  function pick(id: string) {
    if (controlled === undefined) setInternal(id);
    onChange?.(id);
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("flex gap-1 border-b border-line", className)}
    >
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => pick(t.id)}
            className={cn(
              "relative -mb-px inline-flex cursor-pointer items-center gap-1.75",
              "border-b-2 px-3.5 py-2.75 font-mono text-[13px] font-medium tracking-[0.01em]",
              "transition-colors duration-fast ease-standard",
              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-hydro",
              on
                ? "border-b-hydro text-ink-100"
                : "border-b-transparent text-fg-muted hover:text-ink-300",
            )}
          >
            {t.label}
            {t.badge !== undefined ? (
              <span
                className={cn(
                  "rounded-pill px-1.75 py-px text-[10px] font-medium",
                  on ? "bg-hydro/12 text-hydro" : "bg-carbon-500 text-ink-400",
                )}
              >
                {t.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
