import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Static export for GitHub Pages (output to /out).
  output: "export",
  images: {
    unoptimized: true,
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
