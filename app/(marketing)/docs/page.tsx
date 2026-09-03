import Link from "next/link";
import { Card, Icon, Terminal } from "@/components/ui";
import type { IconName } from "@/components/ui";

export const metadata = {
  title: "Documentation",
  description:
    "Get started with CoreValley: launch a GPU pod, spawn a notebook, or call a model endpoint from inside Nepal.",
};

const PATHS: { icon: IconName; title: string; body: string; href: string }[] = [
  {
    icon: "launch",
    title: "Quickstart",
    body: "Install the CLI, authenticate, and launch your first pod in under five minutes.",
    href: "/docs/quickstart",
  },
  {
    icon: "terminal",
    title: "CLI reference",
    body: "Every command for pods, notebooks, endpoints, volumes and vClusters.",
    href: "/docs/cli",
  },
  {
    icon: "broadcast",
    title: "API reference",
    body: "OpenAI-compatible inference endpoints and the control-plane REST API.",
    href: "/docs/api",
  },
];

export default function DocsPage() {
  return (
    <article>
      <p className="cv-label">Documentation</p>
      <h1 className="mt-3 font-body text-[clamp(1.9rem,4vw,2.5rem)] font-extrabold leading-tight tracking-[-0.03em] text-ink-100">
        Build on CoreValley.
      </h1>
      <p className="mt-4 max-w-2xl font-body text-md font-light leading-relaxed text-ink-300">
        Everything runs in <code className="text-hydro">np-ktm-1</code>, our
        Kathmandu region. Pods are metered per second, endpoints per token, and
        both appear on the same NPR invoice.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {PATHS.map((p) => (
          <Link key={p.href} href={p.href} className="group">
            <Card
              padding={22}
              className="h-full transition-[border-color] duration-fast group-hover:border-line-strong"
            >
              <Icon name={p.icon} size={19} weight="duotone" className="text-hydro" />
              <h2 className="mt-3.5 font-body text-base font-bold tracking-tight text-ink-100">
                {p.title}
              </h2>
              <p className="mt-1.5 font-body text-[13px] font-light leading-relaxed text-ink-400">
                {p.body}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mt-14 font-body text-xl font-bold tracking-tight text-ink-100">
        Thirty seconds to a running pod
      </h2>
      <Terminal
        className="mt-4"
        title="np-ktm-1.corevalley.ai"
        lines={[
          { prompt: "$", text: "brew install corevalley/tap/corevalley" },
          { prompt: "$", text: "corevalley auth login" },
          { out: "→ opened browser · signed in as aarati@himalanalytics.com.np" },
          { prompt: "$", text: "corevalley pods launch --gpu h200 --slice 2g.35gb" },
          { out: "→ pod cv-9f3a21 · provisioning → pulling-image → running" },
          { comment: "ready in 11s · NPR 132/hr · metered per second" },
          { prompt: "$", text: "" },
        ]}
      />

      <h2 className="mt-14 font-body text-xl font-bold tracking-tight text-ink-100">
        Concepts worth knowing
      </h2>
      <dl className="mt-5 space-y-4">
        {[
          {
            term: "Slice profiles",
            def: "A pod runs on an exclusive card, a MIG instance or a HAMi slice. MIG is partitioned in hardware and fault-isolated; HAMi is scheduled in software onto a shared card and is not. Pick MIG when a neighbour's crash must not affect you.",
          },
          {
            term: "vCluster",
            def: "Each customer gets a virtual Kubernetes cluster with its own API server. Download a kubeconfig and use kubectl directly if you would rather not use our CLI.",
          },
          {
            term: "Projects",
            def: "Pods, volumes and usage roll up to a project, which maps to a vCluster. Invoices break down by project.",
          },
          {
            term: "Metering",
            def: "Every GPU-second and token is a metered event. What the usage screen shows is what the invoice bills — there is no separate billing pipeline.",
          },
        ].map((c) => (
          <div key={c.term} className="border-l-2 border-line-hydro pl-5">
            <dt className="font-mono text-[14px] text-ink-100">{c.term}</dt>
            <dd className="mt-1.5 font-body text-[14px] font-light leading-relaxed text-ink-400">
              {c.def}
            </dd>
          </div>
        ))}
      </dl>

      <Card surface="solid" padding={22} className="mt-12">
        <div className="flex items-start gap-3">
          <Icon name="info" size={18} weight="duotone" className="mt-0.5 shrink-0 text-info" />
          <p className="font-body text-[13.5px] font-light leading-relaxed text-ink-400">
            These docs cover the platform as it ships today. For anything not
            documented here, email{" "}
            <a href="mailto:info@corevalley.ai" className="text-hydro hover:underline">
              info@corevalley.ai
            </a>{" "}
            — a Kathmandu engineer answers, not a ticket queue.
          </p>
        </div>
      </Card>
    </article>
  );
}
