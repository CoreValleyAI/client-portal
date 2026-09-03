import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      // The design system is a read-only upstream (a Claude skill folder).
      // It ships plain .jsx with its own conventions we are not free to fix.
      "design_system/**",
      "reference/**",
      "next-env.d.ts",
    ],
  },

  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      // Enforce the token boundary: app code consumes components/ui and the
      // CSS custom properties, never the design system's internals.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/design_system/**"],
              message:
                "Do not import from design_system/. Use components/ui/* or the CSS tokens via Tailwind utilities.",
            },
          ],
        },
      ],
      // Logos and the ridgeline are intentionally plain <img>: next/image does
      // nothing useful for SVG and would need dangerouslyAllowSVG.
      "@next/next/no-img-element": "off",
    },
  },

  {
    // Composition layer only. components/ui/** is exempt: it legitimately
    // encodes design-system values as Tailwind arbitrary values.
    files: ["app/**/*.tsx", "components/marketing/**", "components/portal/**"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "Literal[value=/#[0-9a-fA-F]{3,8}\b/]",
          message:
            "Raw hex colour - use a design-system token (bg-hydro, text-fg-muted, ...).",
        },
      ],
    },
  },
];

export default eslintConfig;
