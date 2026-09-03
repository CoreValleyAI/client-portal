import Link from "next/link";
import { Badge, Button, Card, Icon, Terminal } from "@/components/ui";
import { PageHero, Section } from "@/components/marketing/page-hero";
import type { IconName } from "@/components/ui";

export const metadata = {
  title: "Use Cases",
  description:
    "Nepali-language model fine-tuning, regulated banking workloads, healthcare, government, university research and startup inference — run inside Nepal.",
};

const CASES: {
  icon: IconName;
  sector: string;
  title: string;
  body: string;
  workloads: string[];
  why: string;
}[] = [
  {
    icon: "docs",
    sector: "Language",
    title: "Nepali and Maithili language models",
    body: "Continued pre-training and instruction tuning on Devanagari corpora. Nepali is under-represented in frontier models, and the data needed to fix that is exactly the data that should not leave the country.",
    workloads: ["Continued pre-training", "LoRA / QLoRA", "SFT and DPO", "Tokenizer work"],
    why: "Corpora often carry personal data from local sources. Training in-country keeps provenance defensible.",
  },
  {
    icon: "building",
    sector: "Banking",
    title: "Regulated financial workloads",
    body: "KYC document understanding, transaction monitoring and credit models for banks and finance companies operating under NRB supervision.",
    workloads: ["Document OCR", "Fraud detection", "Credit scoring", "Churn models"],
    why: "Customer data cannot cross a border. Dedicated nodes and default-deny networking make the security review answerable.",
  },
  {
    icon: "health",
    sector: "Healthcare",
    title: "Clinical imaging and records",
    body: "Radiology triage, retinal screening and clinical note extraction for hospitals and diagnostic chains, on infrastructure that never exports patient data.",
    workloads: ["Medical imaging", "Clinical NLP", "Segmentation", "Triage models"],
    why: "Patient data is the least portable data there is. Physical location of compute is the whole argument.",
  },
  {
    icon: "certificate",
    sector: "Public sector",
    title: "Government and civic AI",
    body: "Citizen service automation, land-records digitisation and Nepali-language public information systems, run on sovereign infrastructure.",
    workloads: ["Document digitisation", "Speech to text", "Translation", "Chat assistants"],
    why: "Sovereignty is a procurement requirement, not a preference. The infrastructure is inside the jurisdiction.",
  },
  {
    icon: "university",
    sector: "Research",
    title: "Universities and labs",
    body: "Real GPU access for students and faculty without procurement cycles, shared server administration or a foreign cloud account nobody can pay for.",
    workloads: ["Course notebooks", "Thesis research", "Climate and PINN work", "Workshops"],
    why: "JupyterHub with idle culling means a department can give forty students a GPU without forty invoices.",
  },
  {
    icon: "launch",
    sector: "Startups",
    title: "Product teams shipping AI",
    body: "Fine-tune a small model, serve it behind an endpoint, and scale as traffic grows — with costs in the currency your runway is denominated in.",
    workloads: ["Fine-tuning", "RAG pipelines", "Inference endpoints", "Batch jobs"],
    why: "Per-second billing and per-token endpoints mean the bill tracks traction rather than leading it.",
  },
];

export default function UseCasesPage() {
  return (
    <>
      <PageHero
        eyebrow="Use cases"
        title="What teams actually run here."
        lead="The common thread is not the model architecture. It is that the data cannot leave, the invoice has to be in rupees, or the support has to answer in Nepal time."
      />

      <Section>
        <div className="grid gap-4 lg:grid-cols-2">
          {CASES.map((c) => (
            <Card key={c.title} padding={28} className="h-full">
              <div className="flex items-center gap-3">
                <span className="inline-flex rounded-md border border-hydro bg-hydro/8 p-2.5">
                  <Icon name={c.icon} size={19} weight="duotone" className="text-hydro" />
                </span>
                <Badge tone="neutral">{c.sector}</Badge>
              </div>

              <h2 className="mt-4 font-body text-xl font-bold tracking-tight text-ink-100">
                {c.title}
              </h2>
              <p className="mt-3 font-body text-sm font-light leading-relaxed text-ink-400">
                {c.body}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {c.workloads.map((w) => (
                  <span
                    key={w}
                    className="rounded-sm border border-line bg-carbon-600/60 px-2.5 py-1 font-mono text-[11.5px] text-ink-300"
                  >
                    {w}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-start gap-2.5 border-t border-line-subtle pt-4">
                <Icon name="lock" size={15} className="mt-0.5 shrink-0 text-hydro" />
                <p className="font-body text-[12.5px] font-light leading-relaxed text-ink-400">
                  {c.why}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="From lab to production"
        title="One platform across the lifecycle."
        lead="The same project moves from a shared notebook to a dedicated node without changing provider, currency or jurisdiction."
        alt
      >
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_0.9fr]">
          <ol className="space-y-4">
            {[
              {
                step: "01",
                title: "Explore on a shared slice",
                body: "Start in JupyterHub on a MIG or HAMi slice. Cheap enough to leave running while you work out whether the idea holds.",
              },
              {
                step: "02",
                title: "Train on whole cards",
                body: "Move to exclusive H100 or H200 pods, or a full eight-GPU NVLink node for distributed runs.",
              },
              {
                step: "03",
                title: "Serve behind an endpoint",
                body: "Deploy to a model endpoint on vLLM, or keep a dedicated pod running. Metered per token or per second.",
              },
              {
                step: "04",
                title: "Reserve capacity",
                body: "When load is steady, move to a reserved dedicated node and take the term discount.",
              },
            ].map((s) => (
              <li key={s.step}>
                <Card surface="solid" padding={22}>
                  <div className="flex gap-4">
                    <span className="font-mono text-sm text-hydro">{s.step}</span>
                    <div>
                      <h3 className="font-body text-base font-bold tracking-tight text-ink-100">
                        {s.title}
                      </h3>
                      <p className="mt-1.5 font-body text-[13.5px] font-light leading-relaxed text-ink-400">
                        {s.body}
                      </p>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ol>

          <Terminal
            title="np-ktm-1.corevalley.ai — lifecycle"
            lines={[
              { prompt: "$", text: "corevalley jupyter start --profile h200-1g" },
              { out: "→ notebook ready · NPR 84/hr" },
              { prompt: "$", text: "corevalley pods launch --gpu h200 --count 8" },
              { out: "→ 8x h200 nvlink · NPR 3,180/hr" },
              { prompt: "$", text: "corevalley endpoints deploy nepali-7b" },
              { out: "→ live · billed per token" },
              { comment: "same project · same vcluster · same invoice" },
              { prompt: "$", text: "" },
            ]}
          />
        </div>
      </Section>

      <Section>
        <Card padding={40} className="text-center">
          <h2 className="font-body text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-tight text-ink-100">
            Tell us what you are building.
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body font-light leading-relaxed text-ink-300">
            Most conversations start with a model, a dataset size and a
            deadline. That is enough for us to recommend a tier.
          </p>
          <div className="mt-7 flex justify-center">
            <Link href="/contact">
              <Button
                variant="primary"
                size="lg"
                iconRight={<Icon name="arrow-right" size={17} />}
              >
                Contact sales
              </Button>
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
