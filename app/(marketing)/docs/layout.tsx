import Link from "next/link";
import { Icon } from "@/components/ui";

const NAV = [
  {
    heading: "Getting started",
    items: [
      { href: "/docs", label: "Overview" },
      { href: "/docs/quickstart", label: "Quickstart" },
    ],
  },
  {
    heading: "Reference",
    items: [
      { href: "/docs/cli", label: "CLI" },
      { href: "/docs/api", label: "API" },
    ],
  },
] as const;

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-page-xl px-5 py-12 md:px-10">
      <div className="grid gap-10 lg:grid-cols-[13rem_1fr] lg:gap-14">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="cv-label mb-4">Documentation</p>
          <nav className="space-y-6">
            {NAV.map((group) => (
              <div key={group.heading}>
                <p className="mb-2 font-mono text-[11px] tracking-wide text-ink-600">
                  {group.heading}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block rounded-md px-2.5 py-1.5 font-body text-[13.5px] text-ink-400 transition-colors duration-fast hover:bg-carbon-600 hover:text-ink-100"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <a
            href="mailto:info@corevalley.ai"
            className="mt-8 inline-flex items-center gap-2 font-body text-[13px] font-light text-ink-500 hover:text-hydro"
          >
            <Icon name="send" size={14} />
            Docs feedback
          </a>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
