import Link from "next/link";
import { Badge, Button, Card, Icon } from "@/components/ui";
import {
  MetricTile,
  PlaceholderPricingBadge,
  PodStatusPill,
  PortalPageHeader,
  TableScroll,
  Th,
  UtilBar,
} from "@/components/portal/primitives";
import { UsageChart } from "@/components/portal/usage-chart";
import { getClient } from "@/lib/api/client";
import { formatNpr } from "@/lib/money";
import { formatCompactNumber, formatDuration } from "@/lib/format";
import { profileById, skuById } from "@/lib/catalog";
import { usageAt } from "@/lib/api/synthetic";

export const metadata = { title: "Overview" };

export default async function OverviewPage() {
  const cv = getClient();
  const [org, pods, spend, capacity, usage, audit, clusters] = await Promise.all([
    cv.getOrganization(),
    cv.listPods(),
    cv.getCurrentSpend(),
    cv.listCapacity(),
    cv.getUsageSeries({ meterIds: ["gpu_seconds"], window: "hour" }),
    cv.listAuditLog({ limit: 6 }),
    cv.listVClusters(),
  ]);

  const running = pods.filter((p) => p.status === "running");
  const gpusAllocated = running.reduce((a, p) => a + p.gpuCount, 0);
  const gpuSeries = usage[0];

  return (
    <>
      <PortalPageHeader
        title="overview"
        description={`${org.name} · ${org.tier} tier · np-ktm-1`}
        actions={
          <Link href="/portal/pods/new">
            <Button
              variant="primary"
              size="sm"
              mono
              iconLeft={<Icon name="plus" size={15} />}
            >
              launch pod
            </Button>
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="pods running"
          value={`${running.length} / ${pods.length}`}
          sub={`${gpusAllocated} GPUs allocated`}
        />
        <MetricTile
          label="spend month-to-date"
          value={formatNpr(spend.totalPaisa, { compact: true })}
          sub={`projected ${formatNpr(spend.projectedTotalPaisa, { compact: true })}`}
          accent
        />
        <MetricTile
          label="gpu hours this cycle"
          value={formatCompactNumber(Math.round((gpuSeries?.total ?? 0) / 3600))}
          sub="metered per second"
        />
        <MetricTile
          label="vclusters"
          value={clusters.filter((c) => c.status === "ready").length}
          sub="all network-isolated"
        />
      </div>

      {spend.spendCapPaisa ? (
        <Card surface="panel" padding={18} className="mt-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Icon name="cost" size={16} className="text-hydro" />
              <span className="font-mono text-[13px] text-ink-200">
                spend cap {formatNpr(spend.spendCapPaisa, { compact: true })}
              </span>
              <PlaceholderPricingBadge />
            </div>
            <span className="font-mono text-[12px] text-fg-muted">
              {Math.round((spend.totalPaisa / spend.spendCapPaisa) * 100)}% used
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-pill bg-carbon-500">
            <div
              className="h-full rounded-pill bg-hydro"
              style={{
                width: `${Math.min(100, (spend.totalPaisa / spend.spendCapPaisa) * 100)}%`,
              }}
            />
          </div>
        </Card>
      ) : null}

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.5fr_1fr]">
        <Card surface="panel" padding={22}>
          <UsageChart
            label="gpu-seconds · last 24h"
            unit={gpuSeries?.unit}
            points={gpuSeries?.points ?? []}
          />
        </Card>

        <Card surface="panel" padding={0}>
          <div className="flex items-center gap-2 border-b border-line-subtle px-5 py-3.5">
            <Icon name="cpu" size={15} className="text-hydro" />
            <span className="font-mono text-[13px] text-ink-200">capacity</span>
          </div>
          {capacity.map((c, i) => {
            const sku = skuById(c.skuId);
            const pct = Math.round((c.allocatedGpus / c.totalGpus) * 100);
            return (
              <div
                key={c.skuId}
                className={`px-5 py-3.5 ${i > 0 ? "border-t border-line-subtle" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[13px] text-ink-100">
                    {sku.shortName}
                  </span>
                  <span className="font-mono text-[12px] text-fg-muted">
                    {c.allocatedGpus}/{c.totalGpus} GPUs
                  </span>
                </div>
                <div className="mt-2">
                  <UtilBar value={pct} width={140} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-mono text-[14px] text-ink-200">active pods</h2>
          <Link
            href="/portal/pods"
            className="flex items-center gap-1.5 font-mono text-[12px] text-hydro hover:underline"
          >
            all pods
            <Icon name="arrow-right" size={13} />
          </Link>
        </div>

        <TableScroll>
          <thead>
            <tr>
              <Th>name</Th>
              <Th>slice</Th>
              <Th>status</Th>
              <Th>utilisation</Th>
              <Th>uptime</Th>
              <Th align="right">cost to date</Th>
            </tr>
          </thead>
          <tbody>
            {pods.slice(0, 6).map((pod, i) => {
              const profile = profileById(pod.profileId);
              const sku = skuById(pod.skuId);
              const util =
                pod.status === "running"
                  ? Math.round(usageAt(pod.id, "telemetry", 3) * 96)
                  : 0;
              return (
                <tr
                  key={pod.id}
                  className={i > 0 ? "border-t border-line-subtle" : ""}
                >
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/portal/pods/${pod.id}`}
                      className="font-mono text-[13px] text-ink-100 hover:text-hydro"
                    >
                      {pod.name}
                    </Link>
                    <div className="mt-0.5 font-mono text-[11px] text-ink-600">
                      {pod.id}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-[12.5px] text-ink-300">
                      {pod.gpuCount > 1 ? `${pod.gpuCount}x ` : ""}
                      {sku.shortName} · {profile.label}
                    </span>
                    <div className="mt-0.5">
                      <span className="font-mono text-[10.5px] text-ink-600">
                        {profile.isolation}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <PodStatusPill status={pod.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <UtilBar value={util} />
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[12.5px] text-ink-400">
                    {formatDuration(pod.billableSeconds)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-[12.5px] text-ink-200">
                    {formatNpr(pod.costToDatePaisa, { compact: true })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableScroll>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-mono text-[14px] text-ink-200">recent activity</h2>
          <Link
            href="/portal/audit"
            className="flex items-center gap-1.5 font-mono text-[12px] text-hydro hover:underline"
          >
            audit log
            <Icon name="arrow-right" size={13} />
          </Link>
        </div>
        <Card surface="panel" padding={0}>
          {audit.map((entry, i) => (
            <div
              key={entry.id}
              className={`flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 ${
                i > 0 ? "border-t border-line-subtle" : ""
              }`}
            >
              <span className="font-mono text-[12.5px] text-hydro">
                {entry.action}
              </span>
              <span className="font-body text-[13px] font-light text-ink-400">
                {entry.actorName}
              </span>
              <span className="font-mono text-[11.5px] text-ink-600">
                {entry.resourceId}
              </span>
              <span className="ml-auto flex items-center gap-3">
                {entry.outcome !== "success" ? (
                  <Badge tone="danger">{entry.outcome}</Badge>
                ) : null}
                <span className="font-mono text-[11px] text-ink-600">
                  {entry.sourceIp}
                </span>
              </span>
            </div>
          ))}
        </Card>
      </section>
    </>
  );
}
