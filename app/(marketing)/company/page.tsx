import Link from "next/link";
import { Button, Card, Icon, StatBlock } from "@/components/ui";
import { PageHero, Section } from "@/components/marketing/page-hero";
import type { IconName } from "@/components/ui";

export const metadata = {
  title: "Company",
  description:
    "CoreValley builds sovereign GPU infrastructure in Nepal so local teams can train, fine-tune and deploy AI without depending on foreign clouds.",
};

const PRINCIPLES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "lock",
    title: "Sovereign by default",
    body: "Infrastructure, data and support stay inside Nepal. Compliance with local regulation is a design requirement, not an add-on we bolt on for enterprise deals.",
  },
  {
    icon: "terminal",
    title: "Practical over theoretical",
    body: "We optimise for real workflows: fast environment spin-up, clear NPR pricing, and support that answers when a training job dies at night.",
  },
  {
    icon: "university",
    title: "Accessible to researchers",
    body: "University labs, individual researchers and student projects should reach serious GPUs without an enterprise procurement cycle.",
  },
  {
    icon: "check-circle",
    title: "Honest about constraints",
    body: "We publish what we actually run. Where a control is in progress or a GPU has not landed yet, we say so rather than implying otherwise.",
  },
];

const AUDIENCES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "university",
    title: "Universities and researchers",
    body: "Managed notebook environments so students and faculty can work with modern models without administering a cluster or opening a foreign cloud account.",
  },
  {
    icon: "launch",
    title: "Startups and ML teams",
    body: "Full GPU pods with root access, the freedom to install what you need, and the ability to move to endpoints when you ship.",
  },
  {
    icon: "building",
    title: "Enterprises and public sector",
    body: "Isolated environments, data-residency guarantees and local support suitable for regulated industries and government use cases.",
  },
];

export default function CompanyPage() {
  return (
    <>
      <PageHero
        eyebrow="Company"
        title="Nepal's AI infrastructure, built for Nepal."
        lead="We exist so that researchers, startups and enterprises can develop and run AI without depending on foreign clouds, foreign currencies or foreign support hours."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <h2 className="font-body text-2xl font-bold tracking-tight text-ink-100">
              Our mission
            </h2>
            <div className="mt-5 space-y-5 font-body font-light leading-relaxed text-ink-300">
              <p>
                CoreValley is building sovereign GPU infrastructure in Nepal so
                that local talent can train models, fine-tune LLMs, run
                inference and ship AI products without the cost structure or
                compliance friction of overseas providers.
              </p>
              <p>
                For too long, serious AI work in Nepal has meant shipping data
                abroad, paying in USD and waiting for support across time zones.
                That model does not serve universities, regulated industries, or
                the next generation of Nepali AI companies.
              </p>
              <p>
                The alternative is straightforward: high-performance NVIDIA
                compute hosted in Kathmandu, billed in rupees, drawing on
                Himalayan hydroelectricity, supported by engineers who
                understand both the technology and the local context.
              </p>
            </div>
          </div>

          <Card padding={32}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-9">
              <StatBlock value="100%" label="sovereign compute" size="sm" accent />
              <StatBlock value="NPR" label="local billing" size="sm" />
              <StatBlock value="NPT" label="support timezone" size="sm" />
              <StatBlock value="0" label="data leaving nepal" size="sm" />
            </div>
          </Card>
        </div>
      </Section>

      <Section eyebrow="Principles" title="What guides us." alt>
        <div className="grid gap-4 md:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <Card key={p.title} padding={26} className="h-full">
              <Icon name={p.icon} size={21} weight="duotone" className="text-hydro" />
              <h3 className="mt-4 font-body text-lg font-bold tracking-tight text-ink-100">
                {p.title}
              </h3>
              <p className="mt-2 font-body text-sm font-light leading-relaxed text-ink-400">
                {p.body}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section eyebrow="Who we serve" title="Who we build for.">
        <div className="grid gap-4 md:grid-cols-3">
          {AUDIENCES.map((a) => (
            <Card key={a.title} padding={26} className="h-full">
              <Icon name={a.icon} size={21} weight="duotone" className="text-hydro" />
              <h3 className="mt-4 font-body text-lg font-bold tracking-tight text-ink-100">
                {a.title}
              </h3>
              <p className="mt-2 font-body text-sm font-light leading-relaxed text-ink-400">
                {a.body}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section eyebrow="Contact" title="Where to find us." alt>
        <div className="grid gap-4 md:grid-cols-3">
          <Card surface="solid" padding={24}>
            <Icon name="location" size={19} className="text-hydro" />
            <h3 className="mt-3.5 font-body text-base font-bold text-ink-100">
              Location
            </h3>
            <p className="mt-1.5 font-body text-sm font-light text-ink-400">
              Kathmandu Valley, Nepal
            </p>
            <p className="mt-1 font-mono text-xs text-fg-muted">np-ktm-1</p>
          </Card>

          <Card surface="solid" padding={24}>
            <Icon name="send" size={19} className="text-hydro" />
            <h3 className="mt-3.5 font-body text-base font-bold text-ink-100">
              Email
            </h3>
            <a
              href="mailto:info@corevalley.ai"
              className="mt-1.5 block font-body text-sm font-light text-hydro hover:underline"
            >
              info@corevalley.ai
            </a>
          </Card>

          <Card surface="solid" padding={24}>
            <Icon name="team" size={19} className="text-hydro" />
            <h3 className="mt-3.5 font-body text-base font-bold text-ink-100">
              Careers
            </h3>
            <a
              href="https://www.linkedin.com/company/corevalleyai/jobs/"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-1.5 inline-flex items-center gap-1.5 font-body text-sm font-light text-hydro hover:underline"
            >
              Open roles
              <Icon name="external" size={13} />
            </a>
          </Card>
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/contact">
            <Button
              variant="primary"
              size="lg"
              iconRight={<Icon name="arrow-right" size={17} />}
            >
              Get in touch
            </Button>
          </Link>
        </div>
      </Section>
    </>
  );
}
