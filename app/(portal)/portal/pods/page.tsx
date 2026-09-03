import Link from "next/link";
import { Button, Icon } from "@/components/ui";
import {
  PodStatusPill,
  PortalPageHeader,
  TableScroll,
  Th,
  UtilBar,
} from "@/components/portal/primitives";
import { getClient } from "@/lib/api/client";
import { formatNpr } from "@/lib/money";
import { formatDuration } from "@/lib/format";
import { profileById, skuById } from "@/lib/catalog";
import { usageAt } from "@/lib/api/synthetic";

export const metadata = { title: "Pods" };

export default async function PodsPage() {
  const cv = getClient();
  const [pods, projects] = await Promise.all([cv.listPods(), cv.listProjects()]);

  return (
    <>
      <PortalPageHeader
        title="pods"
        description="Containerised GPU workloads. Exclusive cards, MIG instances and HAMi slices, all metered per second."
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

      <TableScroll minWidth="58rem">
        <thead>
          <tr>
            <Th>name</Th>
            <Th>project</Th>
            <Th>slice</Th>
            <Th>image</Th>
            <Th>status</Th>
            <Th>utilisation</Th>
            <Th>uptime</Th>
            <Th align="right">cost</Th>
          </tr>
        </thead>
        <tbody>
          {pods.map((pod, i) => {
            const profile = profileById(pod.profileId);
            const sku = skuById(pod.skuId);
            const project = projects.find((p) => p.id === pod.projectId);
            const util =
              pod.status === "running"
                ? Math.round(usageAt(pod.id, "telemetry", 3) * 96)
                : 0;
            return (
              <tr key={pod.id} className={i > 0 ? "border-t border-line-subtle" : ""}>
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
                <td className="px-4 py-3.5 font-body text-[13px] font-light text-ink-400">
                  {project?.name ?? "—"}
                </td>
                <td className="px-4 py-3.5">
                  <span className="font-mono text-[12.5px] text-ink-300">
                    {pod.gpuCount > 1 ? `${pod.gpuCount}x ` : ""}
                    {sku.shortName} · {profile.label}
                  </span>
                  <div className="mt-0.5 font-mono text-[10.5px] text-ink-600">
                    {profile.isolation}
                    {!profile.faultIsolated ? " · shared" : ""}
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono text-[11.5px] text-ink-500">
                  {pod.image.replace("corevalley/", "")}
                </td>
                <td className="px-4 py-3.5">
                  <PodStatusPill status={pod.status} />
                  {pod.statusDetail ? (
                    <div className="mt-1 max-w-[16rem] font-body text-[11.5px] font-light text-ink-600">
                      {pod.statusDetail}
                    </div>
                  ) : null}
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
    </>
  );
}
