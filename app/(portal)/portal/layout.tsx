import type { Metadata } from "next";
import { PortalShell } from "@/components/layout/portal-shell";

export const metadata: Metadata = {
  title: { default: "Console", template: "%s · CoreValley Console" },
  // The portal is behind a session in production; keep it out of indexes.
  robots: { index: false, follow: false },
};

/**
 * Never prerender the portal.
 *
 * Every screen here renders one organisation's data. Statically prerendering
 * them would bake the build-time account into the HTML and serve it to every
 * visitor — harmless with the mock client, a data leak with a real one.
 * Rendering per request is also what lets the HTTP client read a session.
 */
export const dynamic = "force-dynamic";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell>{children}</PortalShell>;
}
