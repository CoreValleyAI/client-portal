import Link from "next/link";
import { Badge, Button, Card, Icon, StatBlock, Terminal } from "@/components/ui";
import { HeroCanvas } from "@/components/marketing/hero-canvas";
import { RidgelineBand } from "@/components/marketing/ridgeline-band";
import { SovereignMesh } from "@/components/marketing/sovereign-mesh";
import { SpotlightGroup } from "@/components/marketing/spotlight";
import { GPU_SKUS } from "@/lib/catalog";
import type { IconName } from "@/components/ui";

export const metadata = {
  title: "CoreValley — Nepal's Sovereign AI Cloud",
  description:
    "Build, fine-tune and deploy AI without leaving Nepal. NVIDIA H100 and H200 in Kathmandu, billed in NPR, with data residency and support in Nepal time.",
};

const PRODUCTS: {
  icon: IconName;
  title: string;
  href: string;
  body: string;
  meta: string;
}[] = [
  {
    icon: "slice",
    title: "GPU Pods",
    href: "/products/gpu-pods",
    body: "Whole H100 and H200 cards, or fractional slices via MIG and HAMi. Pay per second, from a fourteenth of a card upwards.",
    meta: "mig · hami · per-second billing",
  },
  {
    icon: "notebook",
    title: "JupyterHub",
    href: "/products/jupyterhub",
    body: "Multi-user research notebooks with GPU spawner profiles, per-user limits and idle culling. Built for university labs and research teams.",
    meta: "multi-user · idle culling",
  },
  {
    icon: "broadcast",
    title: "Model API Endpoints",
    href: "/products/model-endpoints",
    body: "Pay-per-token access to open models through vLLM and a LiteLLM gateway. OpenAI-compatible, served from inside Nepal.",
    meta: "vllm · litellm · per-token",
  },
  {
    icon: "node",
    title: "Dedicated & Bare Metal",
    href: "/products/dedicated",
    body: "Whole nodes with no neighbours, for Sovereign and Dedicated tiers. Reserved terms, IPMI access and private networking.",
    meta: "bare metal · reserved terms",
  },
];

const SOVEREIGN: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "lock",
    title: "Data stays in Nepal",
    body: "Every dataset, checkpoint and inference request remains inside the country. Built for banks, hospitals, government and any workload that cannot cross a border.",
  },
  {
    icon: "cost",
    title: "Billed in NPR",
    body: "No USD invoices, no FX exposure, no NRB approval friction. Settle via eSewa, Khalti, bank transfer or corporate invoice.",
  },
  {
    icon: "health",
    title: "Support in Nepal time",
    body: "Engineers in Kathmandu who answer when your training job dies at 2 AM — not eleven time zones away.",
  },
  {
    icon: "leaf",
    title: "Himalayan hydro",
    body: "Racks draw on Nepal's hydroelectricity: near-zero carbon per unit of compute, and power costs that stay in your favour.",
  },
];

const ARCHITECTURE: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "cluster",
    title: "vCluster isolation",
    body: "Each customer gets a dedicated virtual Kubernetes cluster with its own API server and control plane. Your namespaces, your CRDs, your RBAC.",
  },
  {
    icon: "certificate",
    title: "Cilium tenant networking",
    body: "eBPF-enforced network policy between tenants, default-deny on regulated projects, with flow visibility down to the pod.",
  },
  {
    icon: "chart",
    title: "Transparent metering",
    body: "Every GPU-second and token is a metered event feeding usage-based invoicing. What the dashboard shows is what the invoice bills.",
  },
  {
    icon: "audit",
    title: "Immutable audit trail",
    body: "Append-only, hash-chained audit logs covering every control-plane action, exportable for your own compliance evidence.",
  },
];

export default function HomePage() {
  const live = GPU_SKUS.filter((s) => s.status === "available");
  const soon = GPU_SKUS.filter((s) => s.status === "coming-soon");

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <HeroCanvas />
        </div>

        <div className="mx-auto max-w-page-xl px-5 pt-20 pb-24 md:px-10 md:pt-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Badge tone="hydro" dot>
                np-ktm-1 · live in kathmandu
              </Badge>

              <h1 className="mt-6 font-body text-[clamp(2.25rem,6vw,3.75rem)] font-extrabold leading-[1.03] tracking-[-0.03em] text-ink-100">
                Build, Fine-Tune &amp; Deploy AI
                <br />
                <span className="text-hydro">Without Leaving Nepal</span>
              </h1>

              <p className="mt-6 max-w-xl font-body text-md font-light leading-relaxed text-ink-300">
                High-performance NVIDIA GPU infrastructure hosted in Kathmandu.
                From first experiment to production endpoint — billed in NPR,
                with data that never leaves the country and support that answers
                in Nepal time.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact">
                  <Button
                    variant="primary"
                    size="lg"
                    iconRight={<Icon name="arrow-right" size={17} />}
                  >
                    Talk to sales
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="secondary" size="lg">
                    Explore the platform
                  </Button>
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {[
                  "NPR billing",
                  "Data residency in Nepal",
                  "Support in NPT",
                  "H100 / H200",
                ].map((chip) => (
                  <li
                    key={chip}
                    className="flex items-center gap-2 font-mono text-xs text-ink-400"
                  >
                    <Icon name="check" size={13} className="text-hydro" />
                    {chip}
                  </li>
                ))}
              </ul>
            </div>

            <Terminal
              title="np-ktm-1.corevalley.ai"
              className="lg:justify-self-end lg:max-w-xl"
              lines={[
                {
                  prompt: "$",
                  text: "corevalley pods launch --gpu h200 --slice 2g.35gb \\",
                },
                { out: "        --image pytorch:2.5-cu124 --region np-ktm-1" },
                { out: "→ matched np-ktm-1 · kathmandu · hydro grid" },
                { out: "→ h200 mig 2g.35gb · 35 GB · vcluster cv-himal" },
                { out: "→ data residency: nepal · egress: default-deny" },
                { comment: "pod cv-9f3a21 running in 11s · NPR 132/hr" },
                { prompt: "$", text: "" },
              ]}
            />
          </div>

          <div className="mt-16 grid grid-cols-2 gap-y-8 border-t border-line-subtle pt-10 md:grid-cols-4">
            <StatBlock value="141 GB" label="HBM3e per H200" size="sm" />
            <StatBlock value="100%" label="data stays in Nepal" size="sm" accent />
            <StatBlock value="NPR" label="billed locally" size="sm" />
            <StatBlock value="~0g" label="carbon per compute" size="sm" />
          </div>
        </div>
      </section>

      {/* ── Sovereign mesh ───────────────────────────────────────
          Sits on its own ground rather than inside the hero: the hero already
          runs an animated canvas backdrop, and layering a second canvas plus a
          dot-grid over it makes both unreadable. */}
      <section className="border-t border-line-subtle py-16">
        <div className="mx-auto max-w-page-xl px-5 md:px-10">
          <p className="cv-label">The fabric</p>
          <h2 className="mt-3 max-w-2xl font-body text-[clamp(1.75rem,3.5vw,2.4rem)] font-bold leading-tight tracking-[-0.025em] text-ink-100">
            Every millisecond, measured from Kathmandu.
          </h2>
          <p className="mt-4 max-w-2xl font-body font-light leading-relaxed text-ink-400">
            Serving a model from inside Nepal is not a compliance checkbox — it
            is the difference between a 14&nbsp;ms hop and a 285&nbsp;ms round
            trip through a foreign jurisdiction. Switch modes to see it in
            tokens per second.
          </p>

          <SovereignMesh className="mt-9" />
        </div>
      </section>

      {/* ── Platform ─────────────────────────────────────────── */}
      <section className="border-t border-line-subtle py-20">
        <div className="mx-auto max-w-page-xl px-5 md:px-10">
          <p className="cv-label">The platform</p>
          <h2 className="mt-3 max-w-2xl font-body text-[clamp(1.75rem,3.5vw,2.4rem)] font-bold leading-tight tracking-[-0.025em] text-ink-100">
            Four ways to get compute, one control plane.
          </h2>
          <p className="mt-4 max-w-2xl font-body font-light leading-relaxed text-ink-400">
            Start on a shared slice, move to whole cards, then serve production
            traffic — without changing provider, currency or jurisdiction.
          </p>

          <SpotlightGroup className="mt-10 grid gap-4 md:grid-cols-2">
            {PRODUCTS.map((p) => (
              <Link key={p.href} href={p.href} className="group">
                <Card padding={26} className="cv-spotlight h-full transition-[border-color,transform] duration-normal ease-standard group-hover:border-line-strong group-hover:-translate-y-px">
                  <span className="inline-flex rounded-md border border-hydro bg-hydro/8 p-2.5">
                    <Icon name={p.icon} size={20} weight="duotone" className="text-hydro" />
                  </span>
                  <h3 className="mt-4 font-body text-lg font-bold tracking-tight text-ink-100">
                    {p.title}
                  </h3>
                  <p className="mt-2 font-body text-sm font-light leading-relaxed text-ink-400">
                    {p.body}
                  </p>
                  <p className="mt-4 font-mono text-[11px] tracking-wide text-fg-muted">
                    {p.meta}
                  </p>
                </Card>
              </Link>
            ))}
          </SpotlightGroup>
        </div>
      </section>

      {/* ── Sovereignty ──────────────────────────────────────── */}
      <section className="border-t border-line-subtle bg-carbon-800/40 py-20">
        <div className="mx-auto max-w-page-xl px-5 md:px-10">
          <p className="cv-label">Why sovereign</p>
          <h2 className="mt-3 max-w-2xl font-body text-[clamp(1.75rem,3.5vw,2.4rem)] font-bold leading-tight tracking-[-0.025em] text-ink-100">
            Foreign clouds were not built for Nepali teams.
          </h2>

          <SpotlightGroup className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {SOVEREIGN.map((s) => (
              <Card key={s.title} padding={24} className="cv-spotlight h-full">
                <Icon name={s.icon} size={22} weight="duotone" className="text-hydro" />
                <h3 className="mt-4 font-body text-base font-bold tracking-tight text-ink-100">
                  {s.title}
                </h3>
                <p className="mt-2 font-body text-[13.5px] font-light leading-relaxed text-ink-400">
                  {s.body}
                </p>
              </Card>
            ))}
          </SpotlightGroup>
        </div>
      </section>

      {/* ── Fleet ────────────────────────────────────────────── */}
      <section className="border-t border-line-subtle py-20">
        <div className="mx-auto max-w-page-xl px-5 md:px-10">
          <p className="cv-label">Hardware</p>
          <h2 className="mt-3 font-body text-[clamp(1.75rem,3.5vw,2.4rem)] font-bold leading-tight tracking-[-0.025em] text-ink-100">
            The fleet in Kathmandu.
          </h2>

          <SpotlightGroup className="mt-10 grid gap-4 md:grid-cols-2">
            {live.map((sku) => (
              <Card key={sku.id} padding={26} accent className="cv-spotlight">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-body text-xl font-bold tracking-tight text-ink-100">
                      {sku.name}
                    </h3>
                    <p className="mt-1 font-mono text-xs text-fg-muted">
                      {sku.architecture} · {sku.memoryGb} GB {sku.memoryType}
                    </p>
                  </div>
                  <Badge tone="success" dot>
                    available
                  </Badge>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-y-3 border-t border-line-subtle pt-5">
                  <div>
                    <dt className="cv-label text-[10px]">Bandwidth</dt>
                    <dd className="mt-1 font-mono text-sm text-ink-200">
                      {sku.bandwidth}
                    </dd>
                  </div>
                  <div>
                    <dt className="cv-label text-[10px]">Slicing</dt>
                    <dd className="mt-1 font-mono text-sm text-ink-200">
                      {sku.migCapable ? "mig + hami" : "whole card"}
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 font-body text-[13.5px] font-light text-ink-400">
                  {sku.bestFor}
                </p>
              </Card>
            ))}
          </SpotlightGroup>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {soon.map((sku) => (
              <Card key={sku.id} surface="solid" padding={20} className="opacity-75">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-body text-sm font-bold text-ink-200">
                    {sku.name}
                  </h3>
                  <Badge tone="neutral">soon</Badge>
                </div>
                <p className="mt-2 font-mono text-[11px] text-fg-muted">
                  {sku.memoryGb} GB {sku.memoryType} · {sku.architecture}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture ─────────────────────────────────────── */}
      <section className="border-t border-line-subtle bg-carbon-800/40 py-20">
        <div className="mx-auto max-w-page-xl px-5 md:px-10">
          <p className="cv-label">Architecture</p>
          <h2 className="mt-3 max-w-2xl font-body text-[clamp(1.75rem,3.5vw,2.4rem)] font-bold leading-tight tracking-[-0.025em] text-ink-100">
            Isolation and metering you can audit.
          </h2>
          <p className="mt-4 max-w-2xl font-body font-light leading-relaxed text-ink-400">
            The control plane is Kubernetes underneath, but you never operate
            it. What you get is a tenant boundary, a meter and a log — all three
            inspectable from the portal.
          </p>

          <SpotlightGroup className="mt-10 grid gap-4 md:grid-cols-2">
            {ARCHITECTURE.map((a) => (
              <Card key={a.title} padding={24} className="cv-spotlight">
                <div className="flex items-start gap-4">
                  <span className="inline-flex shrink-0 rounded-md border border-line bg-carbon-600/60 p-2.5">
                    <Icon name={a.icon} size={19} className="text-hydro" />
                  </span>
                  <div>
                    <h3 className="font-body text-base font-bold tracking-tight text-ink-100">
                      {a.title}
                    </h3>
                    <p className="mt-1.5 font-body text-[13.5px] font-light leading-relaxed text-ink-400">
                      {a.body}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </SpotlightGroup>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-line bg-carbon-900/50 px-5 py-4">
            <span className="cv-label text-[10px]">Enterprise readiness</span>
            {[
              "SOC 2 Type I framework alignment",
              "Automated TLS",
              "Private tenant networking",
              "Immutable audit logs",
            ].map((t) => (
              <span
                key={t}
                className="flex items-center gap-2 font-mono text-[11.5px] text-ink-400"
              >
                <Icon name="check" size={12} className="text-hydro" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-line-subtle py-24">
        <RidgelineBand height={260} opacity={0.4} />
        <div className="relative mx-auto max-w-2xl px-5 text-center md:px-10">
          <h2 className="font-body text-[clamp(1.9rem,4vw,2.8rem)] font-extrabold leading-tight tracking-[-0.03em] text-ink-100">
            Run your next training job
            <br />
            from Kathmandu.
          </h2>
          <p className="mt-5 font-body text-md font-light leading-relaxed text-ink-300">
            Tell us your models, dataset size and expected GPU hours. We will
            come back with a plan and clear NPR pricing.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/contact">
              <Button
                variant="primary"
                size="lg"
                iconRight={<Icon name="arrow-right" size={17} />}
              >
                Contact sales
              </Button>
            </Link>
            <Link href="/docs">
              <Button
                variant="secondary"
                size="lg"
                mono
                iconLeft={<Icon name="terminal" size={15} />}
              >
                read the docs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
