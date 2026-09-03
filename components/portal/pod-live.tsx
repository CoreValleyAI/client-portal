"use client";

/**
 * Live pod panel: subscribes to status transitions and telemetry.
 *
 * Both subscriptions come back as Unsubscribe functions, so the transport
 * (setInterval in the mock, SSE against a real backend) never leaks in here.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Icon } from "@/components/ui";
import { MetricTile, PodStatusPill, UtilBar } from "./primitives";
import { getClient } from "@/lib/api/client";
import { formatDuration } from "@/lib/format";
import type { Pod, PodTelemetry } from "@/lib/api/types";

export function PodLivePanel({ initial }: { initial: Pod }) {
  const router = useRouter();
  const [pod, setPod] = React.useState(initial);
  const [telemetry, setTelemetry] = React.useState<PodTelemetry | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    const cv = getClient();
    const offPod = cv.subscribePod(initial.id, setPod);
    const offTel = cv.subscribePodTelemetry(initial.id, setTelemetry);
    return () => {
      offPod();
      offTel();
    };
  }, [initial.id]);

  const live = pod.status === "running";
  const transitioning =
    pod.status === "queued" ||
    pod.status === "provisioning" ||
    pod.status === "pulling-image" ||
    pod.status === "stopping";

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    await fn();
    setBusy(false);
    router.refresh();
  }

  const cv = getClient();

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <PodStatusPill status={pod.status} />
        {pod.statusDetail ? (
          <span className="font-body text-[13px] font-light text-ink-400">
            {pod.statusDetail}
          </span>
        ) : null}
        {transitioning ? (
          <span className="size-1.5 animate-cursor rounded-pill bg-hydro" />
        ) : null}

        <div className="ml-auto flex gap-2">
          {live ? (
            <Button
              variant="secondary"
              size="sm"
              mono
              disabled={busy}
              onClick={() => act(() => cv.stopPod(pod.id))}
              iconLeft={<Icon name="pause" size={14} />}
            >
              stop
            </Button>
          ) : pod.status === "stopped" || pod.status === "failed" ? (
            <Button
              variant="primary"
              size="sm"
              mono
              disabled={busy}
              onClick={() => act(() => cv.startPod(pod.id))}
              iconLeft={<Icon name="play" size={14} />}
            >
              start
            </Button>
          ) : null}
          <Button
            variant="danger"
            size="sm"
            mono
            disabled={busy || pod.status === "terminated"}
            onClick={() => act(() => cv.terminatePod(pod.id))}
          >
            terminate
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="gpu utilisation"
          value={`${telemetry?.gpuUtilPercent ?? 0}%`}
          sub={<UtilBar value={telemetry?.gpuUtilPercent ?? 0} width={110} />}
          accent={live}
        />
        <MetricTile
          label="gpu memory"
          value={`${telemetry?.gpuMemoryUsedGb ?? 0} GB`}
          sub="allocated of slice"
        />
        <MetricTile
          label="temperature"
          value={`${telemetry?.gpuTempC ?? 0}°C`}
          sub={`${telemetry?.gpuPowerW ?? 0} W draw`}
        />
        <MetricTile
          label="uptime"
          value={formatDuration(pod.billableSeconds)}
          sub="billable seconds"
        />
      </div>

      {live ? (
        <Card surface="panel" padding={16} className="mt-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="cv-label text-[10px]">host</span>
            <code className="font-mono text-[12.5px] text-hydro">
              {pod.sshCommand}
            </code>
            {pod.exposedPorts.length > 0 ? (
              <>
                <span className="cv-label text-[10px]">ports</span>
                <span className="font-mono text-[12.5px] text-ink-300">
                  {pod.exposedPorts.join(" · ")}
                </span>
              </>
            ) : null}
          </div>
        </Card>
      ) : null}
    </>
  );
}
