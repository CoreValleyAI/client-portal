import { Badge, Card, Icon } from "@/components/ui";
import {
  MetricTile,
  PlaceholderPricingBadge,
  PortalPageHeader,
  TableScroll,
  Th,
} from "@/components/portal/primitives";
import { getClient } from "@/lib/api/client";
import { VAT_RATE_PERCENT, formatNpr } from "@/lib/money";
import { formatCompactNumber, formatDate } from "@/lib/format";

export const metadata = { title: "Billing" };

const STATUS_TONE = {
  draft: "neutral",
  open: "warning",
  paid: "success",
  overdue: "danger",
  void: "neutral",
} as const;

const RAIL_LABEL: Record<string, string> = {
  esewa: "eSewa",
  khalti: "Khalti",
  "bank-transfer": "Bank transfer",
  "corporate-invoice": "Corporate invoice",
};

export default async function BillingPage() {
  const cv = getClient();
  const [draft, invoices, spend, methods, org] = await Promise.all([
    cv.getDraftInvoice(),
    cv.listInvoices(),
    cv.getCurrentSpend(),
    cv.listPaymentMethods(),
    cv.getOrganization(),
  ]);

  const history = invoices.filter((i) => i.status !== "draft");

  return (
    <>
      <PortalPageHeader
        title="billing"
        description={`Invoiced in NPR, VAT at ${VAT_RATE_PERCENT}%. Line items are derived from metered usage, not entered by hand.`}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="current period"
          value={formatNpr(spend.totalPaisa, { compact: true })}
          sub={`${formatDate(spend.periodStart)} – ${formatDate(spend.periodEnd)}`}
          accent
        />
        <MetricTile
          label="projected total"
          value={formatNpr(spend.projectedTotalPaisa, { compact: true })}
          sub="straight-line to period end"
        />
        <MetricTile
          label="credit balance"
          value={formatNpr(org.creditBalancePaisa, { compact: true })}
          sub="applied before charge"
        />
        <MetricTile
          label="spend cap"
          value={
            org.spendCapPaisa
              ? formatNpr(org.spendCapPaisa, { compact: true })
              : "none"
          }
          sub="pods refuse to launch above it"
        />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="font-mono text-[14px] text-ink-200">
            draft invoice · {draft.number}
          </h2>
          <Badge tone="neutral">draft</Badge>
          <PlaceholderPricingBadge />
        </div>

        <TableScroll minWidth="44rem">
          <thead>
            <tr>
              <Th>line item</Th>
              <Th align="right">quantity</Th>
              <Th align="right">unit price</Th>
              <Th align="right">amount</Th>
            </tr>
          </thead>
          <tbody>
            {draft.lineItems.map((li, i) => (
              <tr key={li.id} className={i > 0 ? "border-t border-line-subtle" : ""}>
                <td className="px-4 py-3.5">
                  <div className="font-body text-[13.5px] text-ink-200">
                    {li.description}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-ink-600">
                    {li.meterId}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-[12.5px] text-ink-400">
                  {formatCompactNumber(li.quantity)} {li.unit}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-[12px] text-ink-500">
                  {formatNpr(li.unitPricePaisa)}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-[12.5px] text-ink-100">
                  {formatNpr(li.amountPaisa)}
                </td>
              </tr>
            ))}
            <tr className="border-t border-line">
              <td colSpan={3} className="px-4 py-2.5 text-right font-body text-[13px] text-ink-400">
                Subtotal
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-[12.5px] text-ink-200">
                {formatNpr(draft.subtotalPaisa)}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="px-4 py-2.5 text-right font-body text-[13px] text-ink-400">
                VAT ({VAT_RATE_PERCENT}%)
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-[12.5px] text-ink-200">
                {formatNpr(draft.vatPaisa)}
              </td>
            </tr>
            {draft.creditAppliedPaisa > 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-2.5 text-right font-body text-[13px] text-ink-400">
                  Credit applied
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-[12.5px] text-hydro">
                  −{formatNpr(draft.creditAppliedPaisa)}
                </td>
              </tr>
            ) : null}
            <tr className="border-t border-line">
              <td colSpan={3} className="px-4 py-3.5 text-right font-body text-[13.5px] font-semibold text-ink-100">
                Total due
              </td>
              <td className="px-4 py-3.5 text-right font-mono text-[15px] text-hydro">
                {formatNpr(draft.totalPaisa)}
              </td>
            </tr>
          </tbody>
        </TableScroll>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <section>
          <h2 className="mb-3 font-mono text-[14px] text-ink-200">invoice history</h2>
          <TableScroll minWidth="34rem">
            <thead>
              <tr>
                <Th>invoice</Th>
                <Th>period</Th>
                <Th>status</Th>
                <Th align="right">total</Th>
              </tr>
            </thead>
            <tbody>
              {history.map((inv, i) => (
                <tr key={inv.id} className={i > 0 ? "border-t border-line-subtle" : ""}>
                  <td className="px-4 py-3.5 font-mono text-[12.5px] text-ink-100">
                    {inv.number}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11.5px] text-ink-500">
                    {formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge tone={STATUS_TONE[inv.status]}>{inv.status}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-[12.5px] text-ink-200">
                    {formatNpr(inv.totalPaisa, { compact: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableScroll>
        </section>

        <section>
          <h2 className="mb-3 font-mono text-[14px] text-ink-200">payment methods</h2>
          <Card surface="panel" padding={0}>
            {methods.map((m, i) => (
              <div
                key={m.id}
                className={`flex items-center gap-3 px-5 py-3.5 ${
                  i > 0 ? "border-t border-line-subtle" : ""
                }`}
              >
                <Icon name="cost" size={16} className="text-hydro" />
                <div className="min-w-0">
                  <div className="font-body text-[13.5px] text-ink-200">
                    {RAIL_LABEL[m.rail] ?? m.displayName}
                  </div>
                  <div className="mt-0.5 font-mono text-[11.5px] text-ink-600">
                    {m.detail}
                  </div>
                </div>
                {m.isDefault ? (
                  <Badge tone="hydro" className="ml-auto">
                    default
                  </Badge>
                ) : null}
              </div>
            ))}
          </Card>
          <p className="mt-3 font-body text-[12.5px] font-light leading-relaxed text-ink-500">
            All settlement is in Nepali Rupees. No foreign currency invoices and
            no FX exposure.
          </p>
        </section>
      </div>
    </>
  );
}
