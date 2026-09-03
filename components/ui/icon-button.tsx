// Server component. Ported from
// design_system/components/actions/IconButton.jsx (hover/press were useState).
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const iconButtonVariants = cva(
  [
    "inline-flex items-center justify-center rounded-md border",
    "transition-[background-color] duration-fast ease-standard",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hydro",
    "disabled:cursor-not-allowed disabled:pointer-events-none",
    "disabled:bg-transparent disabled:text-ink-600",
  ],
  {
    variants: {
      variant: {
        ghost:
          "bg-transparent text-ink-300 border-transparent hover:bg-carbon-600 active:bg-carbon-500",
        surface:
          "bg-carbon-600 text-ink-200 border-line hover:bg-carbon-500 active:bg-carbon-400",
        primary:
          "bg-hydro text-carbon-900 border-transparent hover:bg-hydro-dark active:bg-hydro-700",
      },
      size: { sm: "size-7.5", md: "size-9.5", lg: "size-11.5" },
    },
    defaultVariants: { variant: "ghost", size: "md" },
  },
);

export interface IconButtonProps
  extends Omit<React.ComponentPropsWithRef<"button">, "color">,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode;
  /** Required: an icon-only control needs an accessible name. */
  title: string;
}

export function IconButton({
  className,
  variant,
  size,
  icon,
  title,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      title={title}
      aria-label={title}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...rest}
    >
      {icon}
    </button>
  );
}

export { iconButtonVariants };
