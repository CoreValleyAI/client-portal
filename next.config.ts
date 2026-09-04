import type { NextConfig } from "next";

/**
 * Two build targets.
 *
 *   default  - a Node server build. Middleware and /api/auth/* exist, so
 *              Keycloak (or the mock provider) does real sign-in. This is
 *              what `npm run dev` and any hosted deployment use.
 *   static   - NEXT_STATIC_EXPORT=true produces ./out for GitHub Pages. A
 *              static export has no server: the auth route handler is
 *              excluded via `pageExtensions` below and the console runs on a
 *              baked-in demo session (see components/layout/auth-provider).
 */
const staticExport = process.env.NEXT_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  ...(staticExport ? { output: "export" as const } : {}),
  images: {
    unoptimized: true,
  },

  /* `route.node.ts` only counts as a route when "node.ts" is listed. Dropping
     it in the static build is what keeps `output: export` from erroring on
     the dynamic NextAuth handler. */
  pageExtensions: staticExport
    ? ["tsx", "ts", "jsx", "js"]
    : ["node.ts", "tsx", "ts", "jsx", "js"],

  /* Read by the client through process.env; tells the browser bundle that no
     /api/auth endpoint exists to talk to. */
  env: {
    NEXT_PUBLIC_STATIC_DEMO: staticExport ? "true" : "",
  },

  // Set basePath when deploying to a subpath (e.g. username.github.io/repo).
  // Defaults to "" for custom domains or root deployments.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",

  // Keep the design-system skill folder and the archived static site out of
  // the serverless bundle and the build's file trace.
  outputFileTracingExcludes: {
    "*": ["./design_system/**", "./reference/**"],
  },

  async headers() {
    return [
      {
        // Brand asset filenames are version-suffixed, so immutable is safe.
        // Without this, public/ is served max-age=0 and the ridgeline
        // revalidates on every navigation.
        source: "/brand/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
