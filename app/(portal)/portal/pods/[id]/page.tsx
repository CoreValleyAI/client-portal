import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card, Icon } from "@/components/ui";
import {
  PlaceholderPricingBadge,
  PortalPageHeader,
} from "@/components/portal/primitives";
import { PodLivePanel } from "@/components/portal/pod-live";
import { UsageChart } from "@/components/portal/usage-chart";
import { getClient } from "@/lib/api/client";
import { formatNpr } from "@/lib/money";
import { formatDateTime } from "@/lib/format";
import { profileById, skuById } from "@/lib/catalog";

export const metadata = { title: "Pod" };

export function generateStaticParams() {
  return [
    { id: "pod_9f3a21" },
    { id: "pod_7b1c40" },
    { id: "pod_3a8d77" },
    { id: "pod_1e5f09" },
    { id: "pod_6c2b13" },
    { id: "pod_2d9a55" },
  ];
}

export default async function PodDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cv = getClient();

  const pod = await cv.getPod(id).catch(() => null);
  if (!pod) notFound();

  const [logs, telemetrySeries, projects] = await Promise.all([
    cv.getPodLogs(pod.id, 24),
    cv.getPodTelemetrySeries(pod.id, 60),
    cv.listProjects(),
  ]);

  const profile = profileById(pod.profileId);
  const sku = skuById(pod.skuId);
  const project = projects.find((p) => p.id === pod.projectId);

  return (
    <>
      <Link
        href="/portal/pods"
        className="mb-4 inline-flex items-center gap-1.5 font-mono text-[12px] text-ink-500 hover:text-hydro"
      >
        <Icon name="caret-right" size={12} className="rotate-180" />
        all pods
      </Link>

      <PortalPageHeader
        title={pod.name}
        description={`${pod.id} · ${project?.name ?? "no project"} · ${pod.regionId}`}
      />

      <PodLivePanel initial={pod} />

      <div className="mt-8 grid gap-3 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <Card surface="panel" padding={22}>
          <UsageChart
            label="gpu utilisation · last 60 min"
            unit="%"
            points={telemetrySeries}
          />
        </Card>

        <Card surface="panel" padding={0}>
          <div className="flex items-center justify-between border-b border-line-subtle px-5 py-3.5">
            <span className="font-mono text-[13px] text-ink-200">configuration</span>
            <Badge
              tone={
                profile.isolation === "exclusive"
                  ? "hydro"
                  : profile.isolation === "mig"
                    ? "info"
                    : "neutral"
              }
            >
              {profile.isolation}
            </Badge>
          </div>
          <dl>
            {[
              ["GPU", `${pod.gpuCount > 1 ? `${pod.gpuCount}x ` : ""}${sku.name}`],
              ["Slice", `${profile.label} · ${profile.gpuMemoryGb} GB`],
              ["Compute share", `${profile.computePercent}%`],
              ["Fault isolated", profile.faultIsolated ? "yes" : "no — shared card"],
              ["vCPU / RAM", `${profile.vcpus} · ${profile.systemMemoryGb} GB`],
              ["Image", pod.image],
              ["vCluster", pod.vclusterId],
              ["Created", formatDateTime(pod.createdAt)],
            ].map(([k, v], i) => (
              <div
                key={k}
                className={`flex items-start justify-between gap-4 px-5 py-3 ${
                  i > 0 ? "border-t border-line-subtle" : ""
                }`}
              >
                <dt className="cv-label text-[10px]">{k}</dt>
                <dd className="text-right font-mono text-[12.5px] text-ink-200">
                  {v}
                </dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 border-t border-line-subtle px-5 py-3">
              <dt className="cv-label text-[10px]">Rate</dt>
              <dd className="flex items-center gap-2">
                <PlaceholderPricingBadge />
                <span className="font-mono text-[12.5px] text-hydro">
                  {formatNpr(pod.ratePaisaPerHour)}/hr
                </span>
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-mono text-[14px] text-ink-200">logs</h2>
        <div className="max-h-96 overflow-y-auto rounded-lg border border-line bg-carbon-800 px-4 py-3">
          {logs.map((l, i) => (
            <div key={i} className="flex gap-3 py-0.5 font-mono text-[12px]">
              <span className="shrink-0 text-ink-700">
                {formatDateTime(l.at).slice(11)}
              </span>
              <span
                className={
                  l.stream === "stderr" ? "text-danger" : "text-ink-300"
                }
              >
                {l.message}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
