import clsx, { type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge cannot infer the custom `@utility` classes declared in
 * app/globals.css, so they are registered here. An unregistered class is
 * simply never merged — safe, but conflicts would not resolve — so anything
 * added to the @utility block in globals.css belongs here too.
 */
// The generic parameter registers class-group ids that are not part of
// Tailwind's defaults — required for the custom "cv-glass" group below.
const twMerge = extendTailwindMerge<"cv-glass">({
  extend: {
    theme: {
      radius: ["pill"],
      text: ["2xs", "md"],
      tracking: ["label"],
      ease: ["standard"],
    },
    classGroups: {
      "font-family": [{ font: ["body", "display"] }],
      "border-color": [{ border: ["subtle", "default", "strong", "hydro"] }],
      shadow: [{ shadow: ["glow-sm", "glow-md", "glow-lg"] }],
      "max-w": [{ "max-w": ["page-sm", "page-md", "page-lg", "page-xl"] }],
      duration: [{ duration: ["fast", "normal", "slow"] }],
      // The four glass recipes are mutually exclusive surface treatments.
      "cv-glass": ["glass-card", "glass-nav", "glass-modal", "glass-panel"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
