import Link from "next/link";
import { RidgelineBand } from "@/components/marketing/ridgeline-band";
import { Logo } from "./logo";

const GROUPS = [
  {
    heading: "product",
    links: [
      { href: "/products/gpu-pods", label: "GPU Pods" },
      { href: "/products/jupyterhub", label: "JupyterHub" },
      { href: "/products/model-endpoints", label: "Model Endpoints" },
      { href: "/products/dedicated", label: "Dedicated & Bare Metal" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    heading: "developers",
    links: [
      { href: "/docs", label: "Documentation" },
      { href: "/docs/quickstart", label: "Quickstart" },
      { href: "/docs/cli", label: "CLI" },
      { href: "/docs/api", label: "API reference" },
    ],
  },
  {
    heading: "company",
    links: [
      { href: "/company", label: "About" },
      { href: "/use-cases", label: "Use cases" },
      { href: "/contact", label: "Contact sales" },
      {
        href: "https://www.linkedin.com/company/corevalleyai/jobs/",
        label: "Careers",
        external: true,
      },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-carbon-900">
      <RidgelineBand height={220} opacity={0.28} />

      <div className="relative mx-auto max-w-page-xl px-5 pt-14 pb-12 md:px-10">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Logo mark="combinedmark" height={34} />
            <p className="mt-4 max-w-xs font-body text-[13.5px] font-light leading-relaxed text-ink-400">
              Nepal&rsquo;s sovereign AI cloud. Train, fine-tune and deploy on
              NVIDIA GPUs hosted in Kathmandu — billed in NPR, supported in
              Nepal time.
            </p>
            <p className="mt-4 font-mono text-[11.5px] tracking-wide text-fg-muted">
              np-ktm-1 · kathmandu, nepal
            </p>
          </div>

          {GROUPS.map((group) => (
            <div key={group.heading}>
              <p className="cv-label mb-4 text-[10px]">{group.heading}</p>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="font-body text-[13.5px] font-light text-ink-400 transition-colors duration-fast hover:text-hydro"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="font-body text-[13.5px] font-light text-ink-400 transition-colors duration-fast hover:text-hydro"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line-subtle pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-[11.5px] text-fg-muted">
            © {new Date().getUTCFullYear()} CoreValley AI. All rights reserved.
          </span>
          <a
            href="mailto:info@corevalley.ai"
            className="font-mono text-[11.5px] text-fg-muted transition-colors duration-fast hover:text-hydro"
          >
            info@corevalley.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
