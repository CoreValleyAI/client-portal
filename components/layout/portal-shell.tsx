"use client";

/**
 * Portal chrome: a fixed sidebar, a glass topbar and the scrolling content
 * area. Client component because it owns the mobile sidebar and marks the
 * active route.
 */
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, IconButton, Input } from "@/components/ui";
import type { IconName } from "@/components/ui";
import { cn } from "@/lib/cn";
import { LogoLockup } from "./logo";

const NAV: { heading: string; items: { href: string; label: string; icon: IconName }[] }[] = [
  {
    heading: "compute",
    items: [
      { href: "/portal", label: "overview", icon: "gauge" },
      { href: "/portal/pods", label: "pods", icon: "slice" },
      { href: "/portal/jupyter", label: "notebooks", icon: "notebook" },
      { href: "/portal/models", label: "models", icon: "broadcast" },
      { href: "/portal/dedicated", label: "dedicated", icon: "node" },
    ],
  },
  {
    heading: "platform",
    items: [
      { href: "/portal/clusters", label: "vclusters", icon: "cluster" },
      { href: "/portal/network", label: "network", icon: "certificate" },
      { href: "/portal/keys", label: "api keys", icon: "key" },
    ],
  },
  {
    heading: "account",
    items: [
      { href: "/portal/usage", label: "usage", icon: "chart" },
      { href: "/portal/billing", label: "billing", icon: "billing" },
      { href: "/portal/audit", label: "audit log", icon: "audit" },
      { href: "/portal/security", label: "security", icon: "compliance" },
      { href: "/portal/settings", label: "settings", icon: "settings" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/portal") return pathname === "/portal";
  return pathname.startsWith(href);
}

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh bg-carbon-900">
      {/* Scrim behind the mobile drawer. */}
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-carbon-900/70 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[15rem] flex-none flex-col border-r border-line bg-carbon-800/95 px-3.5 py-4",
          "transition-transform duration-normal ease-standard lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-2 pb-5">
          <Link href="/" aria-label="CoreValley home">
            <LogoLockup size={17} />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="cursor-pointer rounded-md p-1 text-ink-400 hover:bg-carbon-600 lg:hidden"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto">
          {NAV.map((group) => (
            <div key={group.heading}>
              <p className="mb-1.5 px-2.5 font-mono text-[10px] tracking-label uppercase text-ink-600">
                {group.heading}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const on = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={on ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md border px-2.5 py-2 font-mono text-[13px] font-medium",
                          "transition-colors duration-fast ease-standard",
                          on
                            ? "border-hydro bg-hydro/10 text-hydro"
                            : "border-transparent text-ink-400 hover:bg-carbon-600 hover:text-ink-200",
                        )}
                      >
                        <Icon
                          name={item.icon}
                          size={16}
                          weight={on ? "bold" : "regular"}
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-4 rounded-md border border-line bg-carbon-700 p-3">
          <div className="flex items-center gap-2">
            <Icon name="region" size={14} className="text-hydro" />
            <span className="font-mono text-[11px] tracking-wide text-ink-300">
              np-ktm-1
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="size-1.5 rounded-pill bg-hydro shadow-[0_0_6px_var(--hydro)]" />
              <span className="font-mono text-[10px] text-hydro">live</span>
            </span>
          </div>
          <p className="mt-2 font-body text-[11.5px] font-light leading-snug text-ink-500">
            Kathmandu · data residency in Nepal
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-nav sticky top-0 z-30 flex items-center gap-3 px-4 py-3 md:px-6">
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen(true)}
            className="cursor-pointer rounded-md p-2 text-ink-300 hover:bg-carbon-600 lg:hidden"
          >
            <Icon name="menu" size={19} />
          </button>

          <div className="ml-auto hidden w-64 sm:block">
            <Input
              size="sm"
              placeholder="search pods, keys, invoices…"
              aria-label="Search"
              prefix={<Icon name="search" size={14} />}
            />
          </div>

          <IconButton
            size="sm"
            icon={<Icon name="bell" size={16} />}
            title="Notifications"
          />

          <Link
            href="/portal/settings"
            aria-label="Account settings"
            className="flex size-8 items-center justify-center rounded-pill border border-line bg-carbon-500 font-mono text-[12px] text-hydro"
          >
            as
          </Link>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}
