// Server component. No "use client": hover, press and focus are pure CSS.
//
// Ported from design_system/components/actions/Button.jsx, which drove those
// states through useState. Moving them to CSS keeps this out of the client
// bundle, makes hover work for keyboard users, stops it latching on touch,
// and adds the :focus-visible ring the original lacked.
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/* Sizes land on the design-system 4px grid via --spacing:
   h-7.5=30 h-9.5=38 h-11.5=46 · px-3=12 px-4=16 px-5.5=22 · gap 6/8/9.
   text-[14px] is the one arbitrary value: the design system's `md` button is
   14px, which is NOT on its own type scale (13/15). Preserved verbatim rather
   than silently re-tuned — see README "Design-system values carried over". */
const buttonVariants = cva(
  [
    "items-center justify-center whitespace-nowrap select-none",
    "rounded-md border leading-none",
    "transition-[background-color,transform,box-shadow] duration-fast ease-standard",
    "active:translate-y-[0.5px]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hydro",
    // Last, so disabled beats every variant's hover/active.
    "disabled:cursor-not-allowed disabled:pointer-events-none",
    "disabled:bg-carbon-600 disabled:text-ink-600 disabled:border-line-subtle",
    "disabled:shadow-none disabled:translate-y-0",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-hydro text-carbon-900 border-transparent",
          "hover:bg-hydro-dark active:bg-hydro-700",
          // 0.30 alpha here; --glow-hydro-md is 0.40. Not the same token —
          // kept literal to match the design system exactly.
          "hover:shadow-[0_0_20px_rgba(74,222,128,0.30)]",
        ],
        secondary:
          "bg-carbon-600 text-ink-200 border-line hover:bg-carbon-500 active:bg-carbon-400",
        ghost:
          "bg-transparent text-ink-300 border-transparent hover:bg-carbon-600 active:bg-carbon-500",
        danger:
          "bg-transparent text-danger border-line hover:bg-danger/12 active:bg-danger/20",
      },
      size: {
        sm: "h-7.5 gap-1.5 px-3 text-xs",
        md: "h-9.5 gap-2 px-4 text-[14px]",
        lg: "h-11.5 gap-2.25 px-5.5 text-base",
      },
      /** JetBrains Mono instead of Manrope, for CLI-flavoured actions. */
      mono: {
        true: "font-mono font-medium tracking-[0.01em]",
        false: "font-body font-semibold tracking-normal",
      },
      fullWidth: {
        true: "flex w-full",
        false: "inline-flex w-auto",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      mono: false,
      fullWidth: false,
    },
  },
);

const ICON_SLOT = { sm: "size-3.5", md: "size-4", lg: "size-4.5" } as const;

export interface ButtonProps
  extends Omit<React.ComponentPropsWithRef<"button">, "color">,
    VariantProps<typeof buttonVariants> {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function Button({
  className,
  variant,
  size = "md",
  mono,
  fullWidth,
  iconLeft,
  iconRight,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const slot = ICON_SLOT[size ?? "md"];
  return (
    // React 19: `ref` is a normal prop, no forwardRef needed.
    <button
      type={type}
      className={cn(buttonVariants({ variant, size, mono, fullWidth }), className)}
      {...rest}
    >
      {iconLeft ? (
        <span className={cn("inline-flex shrink-0 items-center", slot)}>
          {iconLeft}
        </span>
      ) : null}
      {children}
      {iconRight ? (
        <span className={cn("inline-flex shrink-0 items-center", slot)}>
          {iconRight}
        </span>
      ) : null}
    </button>
  );
}

export { buttonVariants };
