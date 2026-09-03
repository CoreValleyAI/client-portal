"use client";

/**
 * Pod launch wizard. GPU -> slice profile -> image -> count, with a live CLI
 * preview and NPR estimate that recompute from the catalogue on every change.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, Icon, Input, Tag, Terminal } from "@/components/ui";
import { PlaceholderPricingBadge } from "./primitives";
import { getClient } from "@/lib/api/client";
import { formatNpr } from "@/lib/money";
import { cn } from "@/lib/cn";
import type {
  GpuSku,
  PodEstimate,
  Project,
  SliceProfile,
} from "@/lib/api/types";

const IMAGES = [
  { id: "corevalley/pytorch:2.5-cu124", label: "PyTorch 2.5 · CUDA 12.4" },
  { id: "corevalley/vllm:0.6.3", label: "vLLM 0.6.3" },
  { id: "corevalley/tensorflow:2.17", label: "TensorFlow 2.17" },
  { id: "corevalley/base:cuda12.4", label: "Bare CUDA 12.4" },
];

const ISOLATION_NOTE: Record<string, string> = {
  exclusive: "A whole card. No neighbours, full bandwidth.",
  mig: "Hardware-partitioned. Fault-isolated from other tenants.",
  hami: "Software slice on a shared card. Cheaper, not fault-isolated.",
};

export function LaunchForm({
  skus,
  profiles,
  projects,
}: {
  skus: GpuSku[];
  profiles: SliceProfile[];
  projects: Project[];
}) {
  const router = useRouter();
  const available = skus.filter((s) => s.status === "available");

  const [name, setName] = React.useState("");
  const [skuId, setSkuId] = React.useState(available[0]?.id ?? "h200-sxm-141");
  const [profileId, setProfileId] = React.useState("");
  const [image, setImage] = React.useState(IMAGES[0]!.id);
  const [projectId, setProjectId] = React.useState(projects[0]?.id ?? "");
  const [count, setCount] = React.useState(1);
  const [estimate, setEstimate] = React.useState<PodEstimate | null>(null);
  const [launching, setLaunching] = React.useState(false);

  const skuProfiles = React.useMemo(
    () => profiles.filter((p) => p.skuId === skuId),
    [profiles, skuId],
  );

  // Keep the selected profile valid whenever the GPU changes.
  React.useEffect(() => {
    if (!skuProfiles.some((p) => p.id === profileId)) {
      setProfileId(skuProfiles[0]?.id ?? "");
    }
  }, [skuProfiles, profileId]);

  const profile = profiles.find((p) => p.id === profileId);
  const exclusive = profile?.isolation === "exclusive";

  // Re-estimate on every meaningful change. estimatePod is a pure catalogue
  // lookup in the mock, and a cheap call against a real backend.
  React.useEffect(() => {
    if (!profileId) return;
    let cancelled = false;
    getClient()
      .estimatePod({
        profileId,
        gpuCount: exclusive ? count : 1,
        skuId: skuId as GpuSku["id"],
        regionId: "np-ktm-1",
        name,
      })
      .then((e) => {
        if (!cancelled) setEstimate(e);
      });
    return () => {
      cancelled = true;
    };
  }, [profileId, count, skuId, name, exclusive]);

  async function launch() {
    if (!profileId || !name) return;
    setLaunching(true);
    const pod = await getClient().launchPod({
      name,
      projectId,
      skuId: skuId as GpuSku["id"],
      profileId,
      gpuCount: exclusive ? count : 1,
      image,
      regionId: "np-ktm-1",
    });
    router.push(`/portal/pods/${pod.id}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div className="space-y-6">
        {/* Name and project */}
        <Card surface="panel" padding={22}>
          <p className="cv-label mb-4">1 · Identity</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pod-name" className="cv-label mb-2 block text-[10px]">
                Pod name
              </label>
              <Input
                id="pod-name"
                mono
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="nepali-7b-sft"
              />
            </div>
            <div>
              <label htmlFor="pod-project" className="cv-label mb-2 block text-[10px]">
                Project
              </label>
              <select
                id="pod-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="h-10 w-full rounded-md border border-line bg-surface-input px-3 font-mono text-[13px] text-ink-100 outline-none focus:border-hydro"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* GPU */}
        <Card surface="panel" padding={22}>
          <p className="cv-label mb-4">2 · GPU</p>
          <div className="flex flex-wrap gap-2">
            {available.map((s) => (
              <Tag
                key={s.id}
                selected={skuId === s.id}
                onClick={() => setSkuId(s.id)}
              >
                {s.shortName} · {s.memoryGb} GB
              </Tag>
            ))}
          </div>
          <p className="mt-3 font-body text-[12.5px] font-light text-ink-500">
            {skus.filter((s) => s.status === "coming-soon").length} more SKUs
            arriving — RTX PRO 6000 Blackwell, L40S and L4.
          </p>
        </Card>

        {/* Slice */}
        <Card surface="panel" padding={22}>
          <p className="cv-label mb-4">3 · Slice profile</p>
          <div className="space-y-2">
            {skuProfiles.map((p) => {
              const on = p.id === profileId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProfileId(p.id)}
                  aria-pressed={on}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-md border px-3.5 py-3 text-left",
                    "transition-colors duration-fast ease-standard",
                    on
                      ? "border-hydro bg-hydro/8"
                      : "border-line bg-carbon-700 hover:bg-carbon-600",
                  )}
                >
                  <Icon
                    name={p.isolation === "exclusive" ? "cpu" : "slice"}
                    size={18}
                    className={on ? "text-hydro" : "text-ink-500"}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[13px] text-ink-100">
                        {p.label}
                      </span>
                      <Badge
                        tone={
                          p.isolation === "exclusive"
                            ? "hydro"
                            : p.isolation === "mig"
                              ? "info"
                              : "neutral"
                        }
                      >
                        {p.isolation}
                      </Badge>
                      {!p.faultIsolated ? (
                        <span className="font-mono text-[10px] text-warning">
                          not fault-isolated
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block font-mono text-[11px] text-ink-500">
                      {p.gpuMemoryGb} GB · {p.computePercent}% compute ·{" "}
                      {p.vcpus} vCPU
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          {profile ? (
            <p className="mt-3 font-body text-[12.5px] font-light leading-relaxed text-ink-400">
              {ISOLATION_NOTE[profile.isolation]}
            </p>
          ) : null}
        </Card>

        {/* Image and count */}
        <Card surface="panel" padding={22}>
          <p className="cv-label mb-4">4 · Image and scale</p>
          <div className="space-y-2">
            {IMAGES.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setImage(img.id)}
                aria-pressed={image === img.id}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between gap-3 rounded-md border px-3.5 py-2.5 text-left",
                  "transition-colors duration-fast ease-standard",
                  image === img.id
                    ? "border-hydro bg-hydro/8"
                    : "border-line bg-carbon-700 hover:bg-carbon-600",
                )}
              >
                <span className="font-mono text-[12.5px] text-ink-200">
                  {img.id}
                </span>
                <span className="font-body text-[12px] font-light text-ink-500">
                  {img.label}
                </span>
              </button>
            ))}
          </div>

          {exclusive ? (
            <div className="mt-5">
              <p className="cv-label mb-2.5 text-[10px]">GPU count</p>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCount((c) => Math.max(1, c - 1))}
                  aria-label="Decrease GPU count"
                >
                  <Icon name="minus" size={14} />
                </Button>
                <span className="w-10 text-center font-mono text-xl text-ink-100">
                  {count}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCount((c) => Math.min(8, c + 1))}
                  aria-label="Increase GPU count"
                >
                  <Icon name="plus" size={14} />
                </Button>
                <span className="font-body text-[12.5px] font-light text-ink-500">
                  whole cards
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-5 font-body text-[12.5px] font-light text-ink-500">
              Sliced profiles run one instance per pod. Launch several pods to
              scale out.
            </p>
          )}
        </Card>
      </div>

      {/* Summary */}
      <div className="space-y-4 lg:sticky lg:top-24">
        <Terminal
          title="command preview"
          cursor={false}
          lines={[
            { prompt: "$", text: estimate?.cliPreview ?? "…" },
            { out: `--image ${image}` },
          ]}
        />

        <Card surface="panel" padding={22}>
          <div className="flex items-center justify-between">
            <p className="cv-label text-[10px]">Estimate</p>
            <PlaceholderPricingBadge />
          </div>

          {estimate ? (
            <>
              <p className="mt-4 font-mono text-[28px] leading-none text-hydro">
                {formatNpr(estimate.ratePaisaPerHour)}
              </p>
              <p className="mt-1.5 font-mono text-[11px] text-fg-muted">
                per hour · metered per second
              </p>

              <dl className="mt-5 space-y-2.5 border-t border-line-subtle pt-4">
                <div className="flex justify-between gap-3">
                  <dt className="font-body text-[12.5px] font-light text-ink-400">
                    If left running a month
                  </dt>
                  <dd className="font-mono text-[12.5px] text-ink-200">
                    {formatNpr(estimate.estimatedMonthlyPaisa, { compact: true })}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-body text-[12.5px] font-light text-ink-400">
                    Minimum billable
                  </dt>
                  <dd className="font-mono text-[12.5px] text-ink-200">
                    {estimate.minimumBillableSeconds}s
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-body text-[12.5px] font-light text-ink-400">
                    Region
                  </dt>
                  <dd className="font-mono text-[12.5px] text-ink-200">
                    np-ktm-1
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="mt-4 font-mono text-[13px] text-ink-500">
              Select a slice profile…
            </p>
          )}

          <Button
            variant="primary"
            fullWidth
            mono
            className="mt-6"
            disabled={!name || !profileId || launching}
            onClick={launch}
            iconLeft={<Icon name="zap" size={15} />}
          >
            {launching ? "launching…" : "launch pod"}
          </Button>
          {!name ? (
            <p className="mt-2.5 text-center font-body text-[12px] font-light text-ink-600">
              Give the pod a name to continue.
            </p>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
