/* ════════════════════════════════════════════════════════════════════════
   ⚠  PLACEHOLDER PRICING — NOT QUOTED RATES  ⚠

   Every rate in this file was invented for UI development. None of it has
   been through commercial approval. Replace all of it before this site is
   published.

   Placeholder status is enforced in three independent layers so it cannot be
   shipped past by accident:

     1. Each rate literal is wrapped in p(paisa, why). The `why` string
        records how that number was derived.
        Count what still needs approval:  grep -c "p(NPR" lib/catalog.ts
     2. Each rate object carries `placeholder: true`, which propagates into
        PodEstimate.ratePlaceholder, InvoiceLineItem.ratePlaceholder and
        DedicatedQuote.pricingIsPlaceholder — so it reaches the rendered data,
        not just this source file.
     3. CATALOG.meta.pricingIsPlaceholder drives a persistent badge on every
        pricing surface. Removing the badge means deleting a binding, which is
        a visible diff in review.

   To go live: replace the numbers, then set meta.pricingIsPlaceholder to
   false and set meta.reviewedAt.
   ════════════════════════════════════════════════════════════════════════ */

import { NPR, USD_DISPLAY, VAT_RATE_PERCENT, type Paisa } from "@/lib/money";
import type {
  GpuModelId,
  GpuSku,
  MeterId,
  Region,
  SliceProfile,
} from "@/lib/api/types";

/**
 * Placeholder rate marker. Identity at runtime; a grep anchor and a mandatory
 * rationale at every call site.
 */
function p(paisa: Paisa, why: string): Paisa {
  if (process.env.NODE_ENV !== "production" && !why) {
    throw new Error("a placeholder rate needs a rationale");
  }
  return paisa;
}

/* ── Hardware fleet ───────────────────────────────────────────────────── */

export const GPU_SKUS: GpuSku[] = [
  {
    id: "h200-sxm-141",
    name: "NVIDIA H200",
    shortName: "h200",
    architecture: "Hopper",
    memoryGb: 141,
    memoryType: "HBM3e",
    bandwidth: "4.8 TB/s",
    fp8Tflops: 3958,
    bestFor: "Large-model training and long-context inference",
    status: "available",
    migCapable: true,
  },
  {
    id: "h100-sxm-80",
    name: "NVIDIA H100",
    shortName: "h100",
    architecture: "Hopper",
    memoryGb: 80,
    memoryType: "HBM2e",
    bandwidth: "2 TB/s",
    fp8Tflops: 3958,
    bestFor: "LLM fine-tuning and multi-GPU training",
    status: "available",
    migCapable: true,
  },
  {
    id: "rtx-pro-6000-blackwell-96",
    name: "NVIDIA RTX PRO 6000 Blackwell",
    shortName: "rtx-pro-6000",
    architecture: "Blackwell",
    memoryGb: 96,
    memoryType: "GDDR7",
    bandwidth: "1.8 TB/s",
    fp8Tflops: null,
    bestFor: "Inference, rendering and visualisation",
    status: "coming-soon",
    migCapable: false,
  },
  {
    id: "l40s-48",
    name: "NVIDIA L40S",
    shortName: "l40s",
    architecture: "Ada Lovelace",
    memoryGb: 48,
    memoryType: "GDDR6",
    bandwidth: "864 GB/s",
    fp8Tflops: null,
    bestFor: "Cost-efficient serving and mixed media workloads",
    status: "coming-soon",
    migCapable: false,
  },
  {
    id: "l4-24",
    name: "NVIDIA L4",
    shortName: "l4",
    architecture: "Ada Lovelace",
    memoryGb: 24,
    memoryType: "GDDR6",
    bandwidth: "300 GB/s",
    fp8Tflops: null,
    bestFor: "Low-power inference and video pipelines",
    status: "coming-soon",
    migCapable: false,
  },
];

export const REGIONS: Region[] = [
  {
    id: "np-ktm-1",
    city: "Kathmandu",
    country: "Nepal",
    status: "live",
    dataResidency: "All compute and storage remain inside Nepal",
    powerSource: "Himalayan hydroelectricity",
  },
];

/* ── Slice profiles ───────────────────────────────────────────────────── */

export const SLICE_PROFILES: SliceProfile[] = [
  // Whole cards.
  {
    id: "h200-x1",
    label: "1x",
    skuId: "h200-sxm-141",
    isolation: "exclusive",
    gpuMemoryGb: 141,
    computePercent: 100,
    vcpus: 26,
    systemMemoryGb: 220,
    faultIsolated: true,
    description: "A whole H200. Full memory bandwidth, no neighbours.",
  },
  {
    id: "h200-x8",
    label: "8x nvlink",
    skuId: "h200-sxm-141",
    isolation: "exclusive",
    gpuMemoryGb: 1128,
    computePercent: 100,
    vcpus: 208,
    systemMemoryGb: 1760,
    faultIsolated: true,
    description: "A full NVLink node for distributed training.",
  },
  {
    id: "h100-x1",
    label: "1x",
    skuId: "h100-sxm-80",
    isolation: "exclusive",
    gpuMemoryGb: 80,
    computePercent: 100,
    vcpus: 26,
    systemMemoryGb: 200,
    faultIsolated: true,
    description: "A whole H100.",
  },
  {
    id: "h100-x8",
    label: "8x nvlink",
    skuId: "h100-sxm-80",
    isolation: "exclusive",
    gpuMemoryGb: 640,
    computePercent: 100,
    vcpus: 208,
    systemMemoryGb: 1600,
    faultIsolated: true,
    description: "A full NVLink node for distributed training.",
  },

  // MIG: hardware partitioning, real fault isolation between tenants.
  {
    id: "h200-1g.18gb",
    label: "1g.18gb",
    skuId: "h200-sxm-141",
    isolation: "mig",
    gpuMemoryGb: 18,
    computePercent: 14,
    vcpus: 4,
    systemMemoryGb: 28,
    faultIsolated: true,
    description: "One seventh of an H200, hardware-partitioned.",
  },
  {
    id: "h200-2g.35gb",
    label: "2g.35gb",
    skuId: "h200-sxm-141",
    isolation: "mig",
    gpuMemoryGb: 35,
    computePercent: 29,
    vcpus: 7,
    systemMemoryGb: 55,
    faultIsolated: true,
    description: "Two sevenths of an H200. Fits most 7B-13B fine-tunes.",
  },
  {
    id: "h200-3g.71gb",
    label: "3g.71gb",
    skuId: "h200-sxm-141",
    isolation: "mig",
    gpuMemoryGb: 71,
    computePercent: 43,
    vcpus: 13,
    systemMemoryGb: 110,
    faultIsolated: true,
    description: "Half an H200 by memory, hardware-partitioned.",
  },
  {
    id: "h200-7g.141gb",
    label: "7g.141gb",
    skuId: "h200-sxm-141",
    isolation: "mig",
    gpuMemoryGb: 141,
    computePercent: 100,
    vcpus: 26,
    systemMemoryGb: 220,
    faultIsolated: true,
    description: "A full-card MIG instance without NVLink peering.",
  },

  // HAMi: software slicing. Denser and cheaper, but NOT fault-isolated.
  {
    id: "h200-hami-10",
    label: "10% · 16gb",
    skuId: "h200-sxm-141",
    isolation: "hami",
    gpuMemoryGb: 16,
    computePercent: 10,
    vcpus: 3,
    systemMemoryGb: 24,
    faultIsolated: false,
    description:
      "Soft slice scheduled onto a shared H200. Best value for notebooks and light inference; tenants are not fault-isolated.",
  },
  {
    id: "h200-hami-25",
    label: "25% · 35gb",
    skuId: "h200-sxm-141",
    isolation: "hami",
    gpuMemoryGb: 35,
    computePercent: 25,
    vcpus: 6,
    systemMemoryGb: 55,
    faultIsolated: false,
    description: "Soft slice on a shared H200. Priced below the MIG 2g tier.",
  },
  {
    id: "h200-hami-50",
    label: "50% · 70gb",
    skuId: "h200-sxm-141",
    isolation: "hami",
    gpuMemoryGb: 70,
    computePercent: 50,
    vcpus: 13,
    systemMemoryGb: 110,
    faultIsolated: false,
    description: "Half a shared H200 by memory and compute share.",
  },
];

/* ── Hourly compute rates ─────────────────────────────────────────────── */

export interface HourlyRate {
  profileId: string;
  skuId: GpuModelId;
  meterId: Extract<MeterId, "gpu_seconds">;
  paisaPerHour: Paisa;
  /** Derived, never stated separately, so display and meter cannot drift. */
  paisaPerSecond: number;
  minimumBillableSeconds: number;
  placeholder: true;
}

const hourly = (
  profileId: string,
  skuId: GpuModelId,
  paisaPerHour: Paisa,
): HourlyRate => ({
  profileId,
  skuId,
  meterId: "gpu_seconds",
  paisaPerHour,
  paisaPerSecond: paisaPerHour / 3600,
  minimumBillableSeconds: 60,
  placeholder: true,
});

export const GPU_HOURLY: HourlyRate[] = [
  hourly(
    "h200-x1",
    "h200-sxm-141",
    p(NPR(415), "PLACEHOLDER - anchored to ~USD 2.98/h H200 SXM at 139.2 NPR/USD"),
  ),
  hourly(
    "h200-x8",
    "h200-sxm-141",
    p(NPR(3180), "PLACEHOLDER - 8x h200 less ~4% whole-node discount"),
  ),
  hourly(
    "h100-x1",
    "h100-sxm-80",
    p(NPR(315), "PLACEHOLDER - anchored to ~USD 2.26/h H100 SXM"),
  ),
  hourly(
    "h100-x8",
    "h100-sxm-80",
    p(NPR(2420), "PLACEHOLDER - 8x h100 less ~4% whole-node discount"),
  ),

  // MIG: priced above the linear fraction to cover partitioning overhead.
  hourly(
    "h200-1g.18gb",
    "h200-sxm-141",
    p(NPR(72), "PLACEHOLDER - 1/7 of h200-x1 (NPR 59.3) + 21% partition overhead"),
  ),
  hourly(
    "h200-2g.35gb",
    "h200-sxm-141",
    p(NPR(132), "PLACEHOLDER - 2/7 of h200-x1 (NPR 118.6) + 11%"),
  ),
  hourly(
    "h200-3g.71gb",
    "h200-sxm-141",
    p(NPR(232), "PLACEHOLDER - 3/7 of h200-x1 (NPR 177.9) + 30%; 3g strands a GPC"),
  ),
  hourly(
    "h200-7g.141gb",
    "h200-sxm-141",
    p(NPR(405), "PLACEHOLDER - full-card MIG, ~2.4% under exclusive (no NVLink peer)"),
  ),

  // HAMi: below the comparable MIG tier, because there is no fault isolation.
  hourly(
    "h200-hami-10",
    "h200-sxm-141",
    p(NPR(47), "PLACEHOLDER - 10% of h200-x1 (NPR 41.5) + 13% scheduler overhead"),
  ),
  hourly(
    "h200-hami-25",
    "h200-sxm-141",
    p(NPR(118), "PLACEHOLDER - 25% of h200-x1 + 14%; under MIG 2g, no isolation"),
  ),
  hourly(
    "h200-hami-50",
    "h200-sxm-141",
    p(NPR(220), "PLACEHOLDER - 50% of h200-x1 (NPR 207.5) + 6%"),
  ),
];

/* ── JupyterHub: per user-hour, metered per second while a server runs ─── */

export interface JupyterRate extends HourlyRate {
  spawnerProfileId: string;
  displayName: string;
}

export const JUPYTER_RATES: JupyterRate[] = [
  {
    ...hourly("jhub-cpu", "l4-24", p(NPR(9), "PLACEHOLDER - 4 vCPU / 16 GB, no GPU")),
    spawnerProfileId: "jhub-cpu",
    displayName: "cpu only",
  },
  {
    ...hourly(
      "h200-1g.18gb",
      "h200-sxm-141",
      p(NPR(84), "PLACEHOLDER - MIG 1g.18gb (NPR 72) + NPR 12 hub/storage/culler"),
    ),
    spawnerProfileId: "jhub-1g",
    displayName: "h200 · 1g.18gb",
  },
  {
    ...hourly(
      "h200-2g.35gb",
      "h200-sxm-141",
      p(NPR(146), "PLACEHOLDER - MIG 2g.35gb (NPR 132) + NPR 14 hub overhead"),
    ),
    spawnerProfileId: "jhub-2g",
    displayName: "h200 · 2g.35gb",
  },
];

/* ── Model endpoints: per million tokens ──────────────────────────────── */

export interface TokenRate {
  endpointId: string;
  inputPaisaPerMillion: Paisa;
  outputPaisaPerMillion: Paisa;
  /** Prompt-cache hit rate, null when the engine does not cache. */
  cachedInputPaisaPerMillion: Paisa | null;
  placeholder: true;
}

const tok = (
  endpointId: string,
  inRupees: number,
  outRupees: number,
  cachedRupees: number | null,
  why: string,
): TokenRate => ({
  endpointId,
  inputPaisaPerMillion: p(NPR(inRupees), why),
  outputPaisaPerMillion: p(NPR(outRupees), why),
  cachedInputPaisaPerMillion:
    cachedRupees === null ? null : p(NPR(cachedRupees), why),
  placeholder: true,
});

export const TOKEN_RATES: TokenRate[] = [
  tok(
    "llama-3.3-70b-instruct",
    34,
    102,
    17,
    "PLACEHOLDER - ~USD 0.24/0.73 per 1M tok; 3:1 out:in; cached input at 50%",
  ),
  tok(
    "qwen2.5-72b-instruct",
    36,
    108,
    18,
    "PLACEHOLDER - ~USD 0.26/0.78 per 1M tok; parity with the llama-70b class",
  ),
  tok(
    "deepseek-v3",
    42,
    126,
    21,
    "PLACEHOLDER - MoE 671B total / 37B active; larger memory footprint",
  ),
  tok(
    "mistral-small-3.1-24b",
    9,
    27,
    4.5,
    "PLACEHOLDER - 24B dense on h100; ~USD 0.065/0.19 per 1M tok",
  ),
];

/* ── Dedicated nodes: per month ───────────────────────────────────────── */

export interface MonthlyRate {
  id: string;
  label: string;
  skuId: GpuModelId;
  gpuCount: number;
  form: "bare-metal" | "vm";
  meterId: Extract<MeterId, "dedicated_months">;
  paisaPerMonth: Paisa;
  placeholder: true;
}

export const TERM_DISCOUNT_PERCENT = {
  "on-demand-monthly": p(0, "PLACEHOLDER term discount"),
  "reserved-6mo": p(12, "PLACEHOLDER term discount"),
  "reserved-12mo": p(22, "PLACEHOLDER term discount"),
  "reserved-36mo": p(34, "PLACEHOLDER term discount"),
} as const;

const monthly = (
  id: string,
  label: string,
  skuId: GpuModelId,
  gpuCount: number,
  form: "bare-metal" | "vm",
  paisaPerMonth: Paisa,
): MonthlyRate => ({
  id,
  label,
  skuId,
  gpuCount,
  form,
  meterId: "dedicated_months",
  paisaPerMonth,
  placeholder: true,
});

export const DEDICATED_MONTHLY: MonthlyRate[] = [
  monthly(
    "node-h200-8x",
    "8x h200 · bare metal",
    "h200-sxm-141",
    8,
    "bare-metal",
    p(NPR(2_150_000), "PLACEHOLDER - ~30% under 730h at the on-demand 8x rate"),
  ),
  monthly(
    "node-h100-8x",
    "8x h100 · bare metal",
    "h100-sxm-80",
    8,
    "bare-metal",
    p(NPR(1_620_000), "PLACEHOLDER - ~31% under 730h at the on-demand 8x rate"),
  ),
  monthly(
    "node-h200-4x",
    "4x h200 · vm",
    "h200-sxm-141",
    4,
    "vm",
    p(NPR(1_120_000), "PLACEHOLDER - half node; +4% per GPU for hypervisor overhead"),
  ),
];

/* ── Storage and egress ───────────────────────────────────────────────── */

export const STORAGE_RATES = {
  "network-ssd": {
    id: "network-ssd",
    label: "network ssd",
    meterId: "storage_gb_hours" as const,
    paisaPerGbMonth: p(NPR(11), "PLACEHOLDER - replicated NVMe-backed, ~USD 0.079/GB-mo"),
    description: "Replicated, survives pod termination. Mountable across pods.",
    placeholder: true as const,
  },
  "nvme-local": {
    id: "nvme-local",
    label: "nvme local",
    meterId: "storage_gb_hours" as const,
    paisaPerGbMonth: p(NPR(4), "PLACEHOLDER - ephemeral, node-local, no replication"),
    description: "Ephemeral scratch on the node. Cleared when the pod stops.",
    placeholder: true as const,
  },
} as const;

export const EGRESS_RATE = {
  meterId: "egress_gb" as const,
  paisaPerGb: p(NPR(6.5), "PLACEHOLDER - ~USD 0.047/GB; ingress and intra-region free"),
  freeGbPerMonth: p(500, "PLACEHOLDER - free monthly egress allowance"),
  placeholder: true as const,
};

/* ── Assembly ─────────────────────────────────────────────────────────── */

export const CATALOG = {
  meta: {
    /** Drives the persistent placeholder badge. Flip only with approved rates. */
    pricingIsPlaceholder: true,
    currency: "NPR" as const,
    regionId: "np-ktm-1",
    vatRatePercent: VAT_RATE_PERCENT,
    usd: USD_DISPLAY,
    notice:
      "Rates shown are engineering placeholders pending commercial approval. Not for quoting.",
    reviewedAt: null as string | null,
  },
  skus: GPU_SKUS,
  regions: REGIONS,
  sliceProfiles: SLICE_PROFILES,
  gpuHourly: GPU_HOURLY,
  jupyterHourly: JUPYTER_RATES,
  tokens: TOKEN_RATES,
  dedicatedMonthly: DEDICATED_MONTHLY,
  termDiscountPercent: TERM_DISCOUNT_PERCENT,
  storage: STORAGE_RATES,
  egress: EGRESS_RATE,
};

/* ── Lookups ──────────────────────────────────────────────────────────── */

export function rateForProfile(profileId: string): HourlyRate {
  const r =
    GPU_HOURLY.find((x) => x.profileId === profileId) ??
    JUPYTER_RATES.find((x) => x.profileId === profileId);
  if (!r) throw new Error(`no catalog rate for profile ${profileId}`);
  return r;
}

export function rateForEndpoint(endpointId: string): TokenRate {
  const r = TOKEN_RATES.find((x) => x.endpointId === endpointId);
  if (!r) throw new Error(`no catalog rate for endpoint ${endpointId}`);
  return r;
}

export function skuById(id: GpuModelId): GpuSku {
  const s = GPU_SKUS.find((x) => x.id === id);
  if (!s) throw new Error(`unknown sku ${id}`);
  return s;
}

export function profileById(id: string): SliceProfile {
  const s = SLICE_PROFILES.find((x) => x.id === id);
  if (!s) throw new Error(`unknown slice profile ${id}`);
  return s;
}

export function profilesForSku(skuId: GpuModelId): SliceProfile[] {
  return SLICE_PROFILES.filter((s) => s.skuId === skuId);
}
