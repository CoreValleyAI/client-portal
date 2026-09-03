import { Card } from "@/components/ui";
import {
  PlaceholderPricingBadge,
  PortalPageHeader,
  TableScroll,
  Th,
} from "@/components/portal/primitives";
import { UsageChart } from "@/components/portal/usage-chart";
import { getClient } from "@/lib/api/client";
import { formatNpr } from "@/lib/money";
import { formatCompactNumber, formatDateTime } from "@/lib/format";

export const metadata = { title: "Usage" };

export default async function UsagePage() {
  const cv = getClient();
  const [meters, series, byProject, bySku, events] = await Promise.all([
    cv.listMeters(),
    cv.getUsageSeries({
      meterIds: ["gpu_seconds", "tokens_out", "storage_gb_hours", "egress_gb"],
      window: "day",
    }),
    cv.getUsageBreakdown("project"),
    cv.getUsageBreakdown("sku"),
    cv.listUsageEvents(20),
  ]);

  return (
    <>
      <PortalPageHeader
        title="usage"
        description="Every GPU-second and token is a metered event. These are the same numbers the invoice is built from — there is no second billing pipeline."
      />

      <div className="grid gap-3 lg:grid-cols-2">
        {series.map((s) => {
          const meter = meters.find((m) => m.id === s.meterId);
          return (
            <Card key={s.meterId} surface="panel" padding={22}>
              <UsageChart
                label={`${meter?.displayName ?? s.meterId} · 30 days`}
                unit={s.unit}
                points={s.points}
                accent={
                  s.meterId === "gpu_seconds" ? "var(--hydro)" : "var(--info)"
                }
              />
              <p className="mt-3 border-t border-line-subtle pt-3 font-mono text-[12px] text-ink-400">
                total {formatCompactNumber(s.total)} {s.unit}
              </p>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {(
          [
            ["by project", byProject],
            ["by hardware", bySku],
          ] as const
        ).map(([label, rows]) => (
          <section key={label}>
            <div className="mb-3 flex items-center gap-3">
              <h2 className="font-mono text-[14px] text-ink-200">{label}</h2>
              <PlaceholderPricingBadge />
            </div>
            <TableScroll minWidth="28rem">
              <thead>
                <tr>
                  <Th>name</Th>
                  <Th align="right">share</Th>
                  <Th align="right">cost</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.key} className={i > 0 ? "border-t border-line-subtle" : ""}>
                    <td className="px-4 py-3">
                      <div className="font-body text-[13px] text-ink-200">
                        {r.label}
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-ink-600">
                        {formatCompactNumber(r.quantity)} {r.unit}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1 w-14 overflow-hidden rounded-pill bg-carbon-500">
                          <div
                            className="h-full bg-hydro"
                            style={{ width: `${Math.min(100, r.sharePercent)}%` }}
                          />
                        </div>
                        <span className="w-10 font-mono text-[11.5px] text-ink-500">
                          {r.sharePercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[12.5px] text-ink-200">
                      {formatNpr(r.costPaisa, { compact: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableScroll>
          </section>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-mono text-[14px] text-ink-200">recent events</h2>
        <TableScroll minWidth="46rem">
          <thead>
            <tr>
              <Th>time</Th>
              <Th>meter</Th>
              <Th>subject</Th>
              <Th align="right">quantity</Th>
              <Th align="right">cost</Th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => (
              <tr key={e.id} className={i > 0 ? "border-t border-line-subtle" : ""}>
                <td className="px-4 py-3 font-mono text-[11.5px] text-ink-500">
                  {formatDateTime(e.at)}
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-hydro">
                  {e.meterId}
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-ink-300">
                  {e.subjectLabel}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[12px] text-ink-400">
                  {formatCompactNumber(e.quantity)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[12px] text-ink-200">
                  {formatNpr(e.costPaisa)}
                </td>
              </tr>
            ))}
          </tbody>
        </TableScroll>
      </section>
    </>
  );
}
