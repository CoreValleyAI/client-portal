// Server component. Ported from design_system/components/display/Tag.jsx.
// Lighter than Badge: filters, CLI flags, region chips.
//
// The original put onClick on a <span>. A clickable tag now renders a <button>
// so it is keyboard-reachable; a static tag stays a <span>.
import * as React from "react";
import { cn } from "@/lib/cn";

const BASE =
  "inline-flex items-center gap-1.75 rounded-sm border px-2.5 py-1.25 font-mono text-xs font-medium leading-[1.2]";

export interface TagProps {
  children?: React.ReactNode;
  selected?: boolean;
  onRemove?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function Tag({
  children,
  selected = false,
  onRemove,
  onClick,
  className,
  style,
}: TagProps) {
  const tone = selected
    ? "text-hydro bg-hydro/10 border-hydro"
    : "text-ink-300 bg-carbon-600 border-line";

  const body = (
    <>
      {children}
      {onRemove ? (
        <span
          role="button"
          tabIndex={0}
          aria-label="Remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(e);
          }}
          className="inline-flex cursor-pointer text-sm leading-none opacity-60 hover:opacity-100"
        >
          &times;
        </span>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        style={style}
        className={cn(
          BASE,
          tone,
          "cursor-pointer transition-[background-color] duration-fast ease-standard",
          !selected && "hover:bg-carbon-500",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hydro",
          className,
        )}
      >
        {body}
      </button>
    );
  }

  return (
    <span style={style} className={cn(BASE, tone, className)}>
      {body}
    </span>
  );
}
