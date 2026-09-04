"use client";

/**
 * Marketing navigation. Sticky glass bar over the page ground.
 *
 * Client component because it owns the mobile drawer and the auth dialogs.
 */
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { AuthModal, type AuthMode } from "./auth-modal";
import { LogoLockup } from "./logo";

const NAV = [
  { href: "/products", label: "Products" },
  { href: "/use-cases", label: "Use Cases" },
  { href: "/company", label: "Company" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<AuthMode | null>(null);
  const { status } = useSession();
  const signedIn = status === "authenticated";

  // Close the drawer whenever the route changes.
  React.useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  /* middleware.ts redirects an unauthenticated /portal request to /?signin=1;
     open the dialog for them rather than dropping them on the home page with
     no explanation. `?error=` from a failed Auth.js callback lands here too. */
  React.useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.has("signin") || q.has("error")) setAuthMode("signin");
  }, []);

  return (
    <>
      <header className="glass-nav sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-page-xl items-center gap-8 px-5 md:px-10">
          <Link href="/" aria-label="CoreValley home" className="shrink-0">
            <LogoLockup size={19} />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 font-body text-[14px] font-medium transition-colors duration-fast",
                    active
                      ? "text-ink-100"
                      : "text-ink-400 hover:text-ink-100",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link href="/contact" className="hidden md:block">
              <Button variant="ghost" size="sm">
                Contact Sales
              </Button>
            </Link>
            {signedIn ? (
              <Link href="/portal">
                <Button
                  variant="primary"
                  size="sm"
                  iconRight={<Icon name="arrow-right" size={15} />}
                >
                  Console
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAuthMode("signin")}
                  className="hidden sm:inline-flex"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setAuthMode("signup")}
                >
                  Sign Up
                </Button>
              </>
            )}
            <button
              type="button"
              aria-label="Menu"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen((v) => !v)}
              className="ml-1 cursor-pointer rounded-md p-2 text-ink-300 hover:bg-carbon-600 lg:hidden"
            >
              <Icon name={drawerOpen ? "x" : "menu"} size={20} />
            </button>
          </div>
        </div>

        {drawerOpen ? (
          <div className="border-t border-line-subtle lg:hidden">
            <nav className="mx-auto flex max-w-page-xl flex-col px-5 py-3 md:px-10">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-2 py-3 font-body text-[15px] text-ink-300 hover:bg-carbon-600 hover:text-ink-100"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contact"
                className="rounded-md px-2 py-3 font-body text-[15px] text-ink-300 hover:bg-carbon-600 hover:text-ink-100"
              >
                Contact Sales
              </Link>
            </nav>
          </div>
        ) : null}
      </header>

      <AuthModal
        mode={authMode ?? "signin"}
        open={authMode !== null}
        onClose={() => setAuthMode(null)}
        onSwitchMode={setAuthMode}
      />
    </>
  );
}
