import Link from "next/link";
import { Button, Card, Icon } from "@/components/ui";
import { PageHero, Section } from "@/components/marketing/page-hero";
import { PricingTables } from "@/components/marketing/pricing-tables";

export const metadata = {
  title: "Pricing",
  description:
    "Transparent NPR pricing for GPU pods, MIG and HAMi slices, model endpoints, dedicated nodes and storage. No USD invoices, no FX risk.",
};

const COMPARISON: [string, string, string][] = [
  ["Upfront cost", "Large capital purchase", "None"],
  ["Power, cooling, maintenance", "Your responsibility", "Included"],
  ["Time to first experiment", "Weeks to months", "Minutes"],
  ["Scaling", "Limited to what you own", "Up or down on demand"],
  ["Technology refresh", "You carry obsolescence risk", "New GPUs as they land"],
  ["Billing", "Often USD plus import duty", "NPR, local payment rails"],
  ["Data location", "Wherever the vendor puts it", "Kathmandu, always"],
];

const INCLUDED = [
  {
    title: "Ready AI stack",
    body: "CUDA, cuDNN, PyTorch, TensorFlow, Jupyter, vLLM and DeepSpeed available from first boot.",
  },
  {
    title: "Local support",
    body: "Engineers reachable in Nepal Standard Time who understand both the platform and the local context.",
  },
  {
    title: "Data residency",
    body: "Compute and storage stay in Nepal — suitable for regulated and sensitive workloads.",
  },
  {
    title: "Real-time metering",
    body: "Usage visible as it accrues, feeding the same numbers that appear on your invoice.",
  },
];

const FAQ = [
  {
    q: "Can I pay in NPR?",
    a: "Yes. All pricing is quoted and settled in Nepali Rupees. We accept eSewa, Khalti, bank transfer and corporate invoices on net terms.",
  },
  {
    q: "What is the difference between MIG and HAMi pricing?",
    a: "MIG partitions the GPU in hardware, so tenants are genuinely fault-isolated — a neighbour cannot crash your instance. HAMi slices in software by memory and compute share on a card you may be sharing. HAMi is denser and cheaper, and it is priced below the comparable MIG tier for exactly that reason.",
  },
  {
    q: "How precisely is GPU time billed?",
    a: "Per second, with a sixty-second minimum per pod. When you stop a pod the meter stops. There is no hourly rounding and nothing accrues after termination.",
  },
  {
    q: "Do you offer academic pricing?",
    a: "Yes. University labs, teaching cohorts and student research get discounted rates on JupyterHub profiles and shared slices. Contact sales with your institution details.",
  },
  {
    q: "Is there a minimum commitment?",
    a: "No commitment for pods, notebooks or model endpoints — pay only for what you use. Dedicated nodes carry a term, and longer terms carry deeper discounts.",
  },
  {
    q: "Why is the pricing marked indicative?",
    a: "Published rates are engineering placeholders while commercial terms are being finalised. Contact sales for firm pricing against your workload.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Clear pricing, in rupees."
        lead="No foreign currency invoices. No exchange-rate surprises. Pay for what you use, settled through the rails you already have."
      />

      <Section>
        <PricingTables />
      </Section>

      <Section
        eyebrow="Rent vs buy"
        title="Why teams rent rather than buy."
        lead="Enterprise GPUs carry capital cost, power, cooling and maintenance overhead. Renting removes all four."
        alt
      >
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[42rem] border-collapse">
            <thead>
              <tr className="bg-carbon-800/60">
                {["", "Buying hardware", "CoreValley"].map((h, i) => (
                  <th
                    key={i}
                    className="cv-label px-5 py-3.5 text-left text-[10px]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(([aspect, buy, cv]) => (
                <tr key={aspect} className="border-t border-line-subtle">
                  <td className="px-5 py-3.5 font-body text-sm font-semibold text-ink-200">
                    {aspect}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-start gap-2 font-body text-[13.5px] font-light text-ink-400">
                      <Icon
                        name="x"
                        size={14}
                        className="mt-0.5 shrink-0 text-danger"
                      />
                      {buy}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-start gap-2 font-body text-[13.5px] font-light text-ink-200">
                      <Icon
                        name="check"
                        size={14}
                        className="mt-0.5 shrink-0 text-hydro"
                      />
                      {cv}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section eyebrow="Always included" title="In every plan.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {INCLUDED.map((i) => (
            <Card key={i.title} padding={22} className="h-full">
              <Icon name="check-circle" size={20} weight="duotone" className="text-hydro" />
              <h3 className="mt-3.5 font-body text-base font-bold tracking-tight text-ink-100">
                {i.title}
              </h3>
              <p className="mt-2 font-body text-[13px] font-light leading-relaxed text-ink-400">
                {i.body}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section eyebrow="Questions" title="Common questions." alt>
        <div className="grid gap-4 md:grid-cols-2">
          {FAQ.map((f) => (
            <Card key={f.q} surface="solid" padding={22} className="h-full">
              <h3 className="font-body text-[15px] font-bold tracking-tight text-ink-100">
                {f.q}
              </h3>
              <p className="mt-2 font-body text-[13.5px] font-light leading-relaxed text-ink-400">
                {f.a}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <Card padding={40} className="text-center">
          <h2 className="font-body text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-tight text-ink-100">
            Get an NPR quote.
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body font-light leading-relaxed text-ink-300">
            Share your expected GPU hours, model sizes and whether you need
            pods, notebooks, endpoints or dedicated capacity. We will respond
            with firm pricing.
          </p>
          <div className="mt-7 flex justify-center">
            <Link href="/contact">
              <Button
                variant="primary"
                size="lg"
                iconRight={<Icon name="arrow-right" size={17} />}
              >
                Request a quote
              </Button>
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
