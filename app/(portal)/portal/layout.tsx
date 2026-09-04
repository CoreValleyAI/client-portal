import type { Metadata } from "next";
import { PortalShell } from "@/components/layout/portal-shell";

export const metadata: Metadata = {
  title: { default: "Console", template: "%s · CoreValley Console" },
  robots: { index: false, follow: false },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell>{children}</PortalShell>;
}
