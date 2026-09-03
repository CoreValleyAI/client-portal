// Server component. Ported from design_system/components/display/Card.jsx,
// which drove the hover lift through useState and put onClick on a bare <div>.
//
// Two deliberate changes: hover is CSS, and an interactive card renders a real
// <button> so it is keyboard-reachable. The original was not.
//
// GLASS: the brief calls for glassmorphism as the primary surface language, so
// `surface="glass"` is the default. `surface="solid"` reproduces the design
// system's opaque carbon card for dense data where blur costs legibility.
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const cardVariants = cva("relative overflow-hidden rounded-lg", {
  variants: {
    surface: {
      glass: "glass-card",
      solid: "bg-surface-card border border-line shadow-sm",
      panel: "glass-panel",
    },
    interactive: {
      true: [
        "cursor-pointer text-left w-full",
        "transition-[border-color,box-shadow,transform] duration-normal ease-standard",
        "hover:border-line-strong hover:shadow-lg hover:-translate-y-px",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hydro",
      ],
      false: "",
    },
  },
  defaultVariants: { surface: "glass", interactive: false },
});

type CardOwnProps = VariantProps<typeof cardVariants> & {
  /** Hydro left edge, for highlighted or active cards. */
  accent?: boolean;
  /** Inner padding in px. Matches the design system's numeric `padding` prop. */
  padding?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export type CardProps = CardOwnProps &
  Omit<React.ComponentPropsWithRef<"div">, keyof CardOwnProps> &
  Omit<React.ComponentPropsWithRef<"button">, keyof CardOwnProps>;

export function Card({
  className,
  surface,
  interactive,
  accent = false,
  padding = 20,
  style,
  children,
  ...rest
}: CardProps) {
  const classes = cn(cardVariants({ surface, interactive }), className);
  const inner = (
    <>
      {accent ? (
        <span className="absolute inset-y-0 left-0 w-0.5 bg-hydro shadow-[0_0_12px_rgba(74,222,128,0.5)]" />
      ) : null}
      {children}
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        className={classes}
        style={{ padding, ...style }}
        {...(rest as React.ComponentPropsWithRef<"button">)}
      >
        {inner}
      </button>
    );
  }

  return (
    <div
      className={classes}
      style={{ padding, ...style }}
      {...(rest as React.ComponentPropsWithRef<"div">)}
    >
      {inner}
    </div>
  );
}

export { cardVariants };
