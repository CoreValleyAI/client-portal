import { Badge, Card, Icon } from "@/components/ui";
import {
  EmptyState,
  PlaceholderPricingBadge,
  PortalPageHeader,
} from "@/components/portal/primitives";
import { getClient } from "@/lib/api/client";
import { formatNpr } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { DEDICATED_MONTHLY, TERM_DISCOUNT_PERCENT, skuById } from "@/lib/catalog";

export const metadata = { title: "Dedicated" };

export default async function DedicatedPage() {
  const cv = getClient();
  const nodes = await cv.listDedicatedNodes();

  return (
    <>
      <PortalPageHeader
        title="dedicated"
        description="Whole nodes reserved for one tenant. Nothing else is scheduled onto them for the length of the term."
      />

      {nodes.length === 0 ? (
        <EmptyState
          icon="node"
          title="No dedicated nodes"
          body="Reserved bare-metal and VM nodes appear here once provisioned. Contact sales to reserve capacity."
        />
      ) : (
        <div className="space-y-4">
          {nodes.map((n) => {
            const sku = skuById(n.skuId);
            return (
              <Card key={n.id} surface="panel" padding={0}>
                <div className="flex flex-wrap items-center gap-3 border-b border-line-subtle px-5 py-4">
                  <Icon name="node" size={18} className="text-hydro" />
                  <div>
                    <h2 className="font-mono text-[14px] text-ink-100">{n.name}</h2>
                    <p className="mt-0.5 font-body text-[12px] font-light text-ink-500">
                      {n.gpuCount}x {sku.name} · {n.regionId}
                    </p>
                  </div>
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">{n.form}</Badge>
                    {n.ipmiEnabled ? <Badge tone="info">ipmi</Badge> : null}
                    <Badge tone={n.status === "active" ? "success" : "warning"} dot>
                      {n.status}
                    </Badge>
                  </div>
                </div>

                <dl className="grid gap-0 sm:grid-cols-4">
                  {[
                    ["Term", n.term.replace("reserved-", "")],
                    ["Started", formatDate(n.startedAt)],
                    ["Renews", formatDate(n.renewsAt)],
                    ["Monthly", formatNpr(n.monthlyPaisa, { compact: true })],
                  ].map(([k, v], i) => (
                    <div
                      key={k}
                      className={`px-5 py-4 ${i > 0 ? "sm:border-l sm:border-line-subtle" : ""}`}
                    >
                      <dt className="cv-label text-[10px]">{k}</dt>
                      <dd
                        className={`mt-1.5 font-mono text-[13px] ${
                          k === "Monthly" ? "text-hydro" : "text-ink-200"
                        }`}
                      >
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Card>
            );
          })}
        </div>
      )}

      <section className="mt-8">
        <div className="mb-3 flex items-center gap-3">
          <h2 className="font-mono text-[14px] text-ink-200">available configurations</h2>
          <PlaceholderPricingBadge />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {DEDICATED_MONTHLY.map((d) => {
            const sku = skuById(d.skuId);
            const best = Math.round(
              d.paisaPerMonth * (1 - TERM_DISCOUNT_PERCENT["reserved-36mo"] / 100),
            );
            return (
              <Card key={d.id} surface="panel" padding={20}>
                <h3 className="font-mono text-[13.5px] text-ink-100">{d.label}</h3>
                <p className="mt-1 font-body text-[12px] font-light text-ink-500">
                  {sku.name} · {d.gpuCount} GPUs
                </p>
                <p className="mt-4 font-mono text-[20px] text-ink-100">
                  {formatNpr(d.paisaPerMonth, { compact: true })}
                  <span className="ml-1.5 text-[11px] text-fg-muted">/mo</span>
                </p>
                <p className="mt-2 border-t border-line-subtle pt-3 font-mono text-[12px] text-hydro">
                  {formatNpr(best, { compact: true })}/mo
                  <span className="ml-1.5 text-[10.5px] text-fg-muted">
                    on a 36-month term
                  </span>
                </p>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
