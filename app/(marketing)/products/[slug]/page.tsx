import { notFound } from "next/navigation";
import Link from "next/link";
import { Button, Card, Icon, Terminal } from "@/components/ui";
import { PageHero, Section } from "@/components/marketing/page-hero";
import { PRODUCTS, productBySlug } from "@/lib/products";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return {};
  return { title: product.name, description: product.summary };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <PageHero
        eyebrow={product.meta}
        title={product.name}
        lead={product.summary}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/contact">
            <Button
              variant="primary"
              iconRight={<Icon name="arrow-right" size={16} />}
            >
              Talk to sales
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="secondary">See pricing</Button>
          </Link>
        </div>
        <p className="mt-6 font-mono text-[11.5px] tracking-wide text-fg-muted">
          built for {product.audience.toLowerCase()}
        </p>
      </PageHero>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          <div className="grid gap-4 sm:grid-cols-2">
            {product.features.map((f) => (
              <Card key={f.title} padding={24} className="h-full">
                <h3 className="font-body text-base font-bold tracking-tight text-ink-100">
                  {f.title}
                </h3>
                <p className="mt-2 font-body text-[13.5px] font-light leading-relaxed text-ink-400">
                  {f.body}
                </p>
              </Card>
            ))}
          </div>

          <div className="lg:sticky lg:top-24">
            <Terminal title="np-ktm-1.corevalley.ai" lines={product.terminal} />
            <Card surface="solid" padding={0} className="mt-4">
              <dl>
                {product.specs.map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex items-center justify-between gap-4 px-5 py-3.5 ${
                      i > 0 ? "border-t border-line-subtle" : ""
                    }`}
                  >
                    <dt className="cv-label text-[10px]">{s.label}</dt>
                    <dd className="text-right font-mono text-[13px] text-ink-200">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </div>
      </Section>

      <Section alt eyebrow="Other products" title="Keep exploring.">
        <div className="flex flex-wrap gap-3">
          {PRODUCTS.filter((p) => p.slug !== product.slug).map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`}>
              <Card
                surface="solid"
                padding={16}
                className="transition-colors duration-fast hover:border-line-strong"
              >
                <span className="flex items-center gap-2.5">
                  <Icon name={p.icon} size={17} className="text-hydro" />
                  <span className="font-body text-sm font-semibold text-ink-200">
                    {p.name}
                  </span>
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
