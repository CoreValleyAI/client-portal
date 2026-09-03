import { Card, Icon } from "@/components/ui";
import { PageHero, Section } from "@/components/marketing/page-hero";
import { ContactForm } from "@/components/marketing/contact-form";
import type { IconName } from "@/components/ui";

export const metadata = {
  title: "Contact Sales",
  description:
    "Talk to the CoreValley team in Kathmandu about GPU capacity, NPR pricing and data-residency requirements.",
};

const DETAILS: { icon: IconName; title: string; body: React.ReactNode }[] = [
  {
    icon: "send",
    title: "Email",
    body: (
      <a href="mailto:info@corevalley.ai" className="text-hydro hover:underline">
        info@corevalley.ai
      </a>
    ),
  },
  {
    icon: "location",
    title: "Location",
    body: "Kathmandu Valley, Nepal · np-ktm-1",
  },
  {
    icon: "health",
    title: "Support hours",
    body: "Nepal Standard Time. Technical questions welcome.",
  },
  {
    icon: "cost",
    title: "Payment rails",
    body: "eSewa, Khalti, bank transfer and corporate invoices on net terms.",
  },
];

const FAQ = [
  {
    q: "What should I include?",
    a: "Model type and size, approximate dataset volume, expected GPU hours per month, and whether you need pods, notebooks, endpoints or dedicated capacity.",
  },
  {
    q: "How quickly can I start?",
    a: "Once requirements are agreed and the account is set up, most teams launch their first pod within minutes of capacity being allocated.",
  },
  {
    q: "Do you support academic use?",
    a: "Yes. JupyterHub is designed for universities and teaching, with discounted profiles and cohort management.",
  },
  {
    q: "Can data stay in Nepal?",
    a: "Yes — that is the point of the platform. Compute and storage are physically located in Kathmandu and egress can be default-denied per project.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact sales"
        title="Let's discuss your workloads."
        lead="Whether you need a single slice for research or capacity planning for production, the team in Kathmandu is ready to help."
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1fr] lg:items-start">
          <div>
            <h2 className="font-body text-xl font-bold tracking-tight text-ink-100">
              Reach us directly
            </h2>
            <p className="mt-2 font-body text-[13.5px] font-light leading-relaxed text-ink-400">
              Prefer a conversation first? Email us. We respond during Nepal
              business hours and often beyond.
            </p>

            <div className="mt-6 space-y-3">
              {DETAILS.map((d) => (
                <Card key={d.title} surface="solid" padding={18}>
                  <div className="flex items-start gap-3.5">
                    <span className="mt-0.5 shrink-0">
                      <Icon name={d.icon} size={18} className="text-hydro" />
                    </span>
                    <div>
                      <h3 className="font-body text-sm font-bold text-ink-100">
                        {d.title}
                      </h3>
                      <div className="mt-1 font-body text-[13.5px] font-light leading-relaxed text-ink-400">
                        {d.body}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <ContactForm />
        </div>
      </Section>

      <Section eyebrow="Quick answers" title="Before you write." alt>
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
    </>
  );
}
