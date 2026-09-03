import Link from "next/link";
import { Badge, Card, Icon } from "@/components/ui";
import { PageHero, Section } from "@/components/marketing/page-hero";
import { PRODUCTS } from "@/lib/products";
import { GPU_SKUS } from "@/lib/catalog";

export const metadata = {
  title: "Products",
  description:
    "GPU Pods with MIG and HAMi slicing, JupyterHub, model API endpoints on vLLM, and dedicated bare metal — all hosted in Kathmandu.",
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Four ways to get compute, one control plane."
        lead="Start on a shared slice, move to whole cards, then serve production traffic — without changing provider, currency or jurisdiction."
      />

      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          {PRODUCTS.map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`} className="group">
              <Card
                padding={28}
                className="h-full transition-[border-color,transform] duration-normal ease-standard group-hover:border-line-strong group-hover:-translate-y-px"
              >
                <span className="inline-flex rounded-md border border-hydro bg-hydro/8 p-2.5">
                  <Icon
                    name={p.icon}
                    size={20}
                    weight="duotone"
                    className="text-hydro"
                  />
                </span>
                <h2 className="mt-4 font-body text-xl font-bold tracking-tight text-ink-100">
                  {p.name}
                </h2>
                <p className="mt-1 font-body text-sm font-medium text-hydro">
                  {p.tagline}
                </p>
                <p className="mt-3 font-body text-sm font-light leading-relaxed text-ink-400">
                  {p.summary}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-line-subtle pt-4">
                  <span className="font-mono text-[11px] tracking-wide text-fg-muted">
                    {p.meta}
                  </span>
                  <Icon name="arrow-right" size={16} className="text-hydro" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      <Section eyebrow="Hardware" title="What the pods and nodes run on." alt>
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[46rem] border-collapse">
            <thead>
              <tr className="bg-carbon-800/60">
                {[
                  "GPU",
                  "Architecture",
                  "Memory",
                  "Bandwidth",
                  "Slicing",
                  "Status",
                ].map((h) => (
                  <th key={h} className="cv-label px-4 py-3 text-left text-[10px]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GPU_SKUS.map((s) => (
                <tr key={s.id} className="border-t border-line-subtle">
                  <td className="px-4 py-3.5 font-body text-sm font-semibold text-ink-100">
                    {s.name}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[13px] text-ink-400">
                    {s.architecture}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[13px] text-ink-300">
                    {s.memoryGb} GB {s.memoryType}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[13px] text-ink-400">
                    {s.bandwidth}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[13px] text-ink-400">
                    {s.migCapable ? "mig + hami" : "whole card"}
                  </td>
                  <td className="px-4 py-3.5">
                    {s.status === "available" ? (
                      <Badge tone="success" dot>
                        available
                      </Badge>
                    ) : (
                      <Badge tone="neutral">coming soon</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
