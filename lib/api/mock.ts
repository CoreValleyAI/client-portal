/**
 * In-memory implementation of CoreValleyClient.
 *
 * Demo data only. Everything is derived deterministically (see synthetic.ts)
 * so the server render and the client hydration agree; the subscribe* timers
 * add live drift after mount.
 *
 * Invoices are computed from usage events rather than hardcoded, so the
 * billing screens stay internally consistent with the usage screens.
 */
import { NPR, applyVat, type Paisa } from "@/lib/money";
import {
  CATALOG,
  DEDICATED_MONTHLY,
  GPU_SKUS,
  JUPYTER_RATES,
  REGIONS,
  SLICE_PROFILES,
  STORAGE_RATES,
  TERM_DISCOUNT_PERCENT,
  TOKEN_RATES,
  profileById,
  rateForEndpoint,
  rateForProfile,
  skuById,
} from "@/lib/catalog";
import type { CoreValleyClient, UsageQuery, Unsubscribe } from "./client";
import {
  DAY,
  HOUR,
  MINUTE,
  chainHash,
  hashSeed,
  intBetween,
  isoAt,
  makeRng,
  now,
  usageAt,
} from "./synthetic";
import type {
  ApiKey,
  AuditLogEntry,
  CapacityEntry,
  Certificate,
  ComplianceControl,
  DedicatedNode,
  Invoice,
  InvoiceLineItem,
  JupyterServer,
  JupyterSpawnerProfile,
  LogLine,
  Meter,
  MeterId,
  ModelEndpoint,
  NetworkPolicy,
  Organization,
  PaymentMethod,
  Pod,
  PodStatus,
  PodTelemetry,
  Project,
  SshKey,
  TimeSeriesPoint,
  UsageEvent,
  User,
  VCluster,
} from "./types";

/* ── Store ────────────────────────────────────────────────────────────── */

const ORG: Organization = {
  id: "org_himal",
  name: "Himal Analytics",
  tier: "team",
  panNumber: "601234567",
  createdAt: isoAt(-320 * DAY),
  spendCapPaisa: NPR(900_000),
  creditBalancePaisa: NPR(25_000),
};

const USERS: User[] = [
  {
    id: "usr_aarati",
    name: "Aarati Shrestha",
    email: "aarati@himalanalytics.com.np",
    role: "owner",
    lastActiveAt: isoAt(-12 * MINUTE),
    mfaEnabled: true,
  },
  {
    id: "usr_bikash",
    name: "Bikash Tamang",
    email: "bikash@himalanalytics.com.np",
    role: "engineer",
    lastActiveAt: isoAt(-2 * HOUR),
    mfaEnabled: true,
  },
  {
    id: "usr_pratima",
    name: "Pratima Gurung",
    email: "pratima@himalanalytics.com.np",
    role: "engineer",
    lastActiveAt: isoAt(-26 * HOUR),
    mfaEnabled: false,
  },
  {
    id: "usr_niraj",
    name: "Niraj Adhikari",
    email: "niraj@himalanalytics.com.np",
    role: "billing",
    lastActiveAt: isoAt(-4 * DAY),
    mfaEnabled: true,
  },
];

const PROJECTS: Project[] = [
  {
    id: "prj_nepali_llm",
    name: "Nepali LLM",
    slug: "nepali-llm",
    description: "Continued pre-training and instruction tuning for Nepali and Maithili.",
    vclusterId: "vc_research",
    createdAt: isoAt(-210 * DAY),
    archived: false,
  },
  {
    id: "prj_kyc_vision",
    name: "KYC Document Vision",
    slug: "kyc-vision",
    description: "Citizenship and passport OCR for a regulated banking customer.",
    vclusterId: "vc_regulated",
    createdAt: isoAt(-140 * DAY),
    archived: false,
  },
  {
    id: "prj_platform",
    name: "Platform",
    slug: "platform",
    description: "Shared inference endpoints and internal tooling.",
    vclusterId: "vc_research",
    createdAt: isoAt(-300 * DAY),
    archived: false,
  },
];

interface PodSeed {
  id: string;
  name: string;
  projectId: string;
  profileId: string;
  gpuCount: number;
  image: string;
  status: PodStatus;
  ageHours: number;
}

const POD_SEEDS: PodSeed[] = [
  {
    id: "pod_9f3a21",
    name: "nepali-7b-sft",
    projectId: "prj_nepali_llm",
    profileId: "h200-x8",
    gpuCount: 8,
    image: "corevalley/pytorch:2.5-cu124",
    status: "running",
    ageHours: 98,
  },
  {
    id: "pod_7b1c40",
    name: "maithili-tokenizer",
    projectId: "prj_nepali_llm",
    profileId: "h200-2g.35gb",
    gpuCount: 1,
    image: "corevalley/pytorch:2.5-cu124",
    status: "running",
    ageHours: 11,
  },
  {
    id: "pod_3a8d77",
    name: "kyc-ocr-train",
    projectId: "prj_kyc_vision",
    profileId: "h100-x1",
    gpuCount: 1,
    image: "corevalley/vision:0.9",
    status: "running",
    ageHours: 62,
  },
  {
    id: "pod_1e5f09",
    name: "embeddings-batch",
    projectId: "prj_platform",
    profileId: "h200-hami-25",
    gpuCount: 1,
    image: "corevalley/vllm:0.6.3",
    status: "queued",
    ageHours: 0,
  },
  {
    id: "pod_6c2b13",
    name: "eval-sweep",
    projectId: "prj_nepali_llm",
    profileId: "h200-1g.18gb",
    gpuCount: 1,
    image: "corevalley/pytorch:2.5-cu124",
    status: "stopped",
    ageHours: 190,
  },
  {
    id: "pod_2d9a55",
    name: "lora-experiment",
    projectId: "prj_kyc_vision",
    profileId: "h200-hami-10",
    gpuCount: 1,
    image: "corevalley/pytorch:2.5-cu124",
    status: "failed",
    ageHours: 30,
  },
];

function buildPod(seed: PodSeed): Pod {
  const profile = profileById(seed.profileId);
  const rate = rateForProfile(seed.profileId);
  const running = seed.status === "running";
  const billableSeconds =
    seed.status === "queued"
      ? 0
      : Math.round(seed.ageHours * 3600 * (running ? 1 : 0.72));
  const ratePaisaPerHour = rate.paisaPerHour * seed.gpuCount;
  return {
    id: seed.id,
    name: seed.name,
    projectId: seed.projectId,
    vclusterId:
      PROJECTS.find((p) => p.id === seed.projectId)?.vclusterId ?? "vc_research",
    regionId: "np-ktm-1",
    skuId: profile.skuId,
    profileId: seed.profileId,
    gpuCount: seed.gpuCount,
    image: seed.image,
    status: seed.status,
    statusDetail:
      seed.status === "failed"
        ? "CUDA OOM at step 1420. Reduce batch size or pick a larger slice."
        : seed.status === "queued"
          ? "Waiting for a free h200 HAMi slice in np-ktm-1."
          : null,
    createdAt: isoAt(-seed.ageHours * HOUR),
    startedAt: seed.status === "queued" ? null : isoAt(-seed.ageHours * HOUR + 40_000),
    stoppedAt:
      seed.status === "stopped" || seed.status === "failed"
        ? isoAt(-2 * HOUR)
        : null,
    billableSeconds,
    costToDatePaisa: Math.round(rate.paisaPerSecond * seed.gpuCount * billableSeconds),
    ratePaisaPerHour,
    sshCommand: `ssh ${seed.id.replace("pod_", "")}@np-ktm-1.corevalley.ai`,
    exposedPorts: running ? [8888, 6006] : [],
  };
}

const store = {
  org: { ...ORG },
  users: [...USERS],
  projects: [...PROJECTS],
  pods: POD_SEEDS.map(buildPod),
  podCounter: 0,
  jupyterIdleCullMinutes: 60,
  apiKeys: [] as ApiKey[],
  sshKeys: [] as SshKey[],
  jupyterServers: [] as JupyterServer[],
  networkPolicies: [] as NetworkPolicy[],
  paidInvoiceIds: new Set<string>(),
};

/* ── Fixtures that depend on the store ────────────────────────────────── */

const VCLUSTERS: VCluster[] = [
  {
    id: "vc_research",
    name: "research",
    projectId: "prj_nepali_llm",
    k8sVersion: "v1.31.4",
    status: "ready",
    createdAt: isoAt(-210 * DAY),
    networkIsolated: true,
    apiServerEndpoint: "https://vc-research.np-ktm-1.corevalley.ai",
    nodePools: [
      {
        id: "np_h200",
        name: "h200-pool",
        skuId: "h200-sxm-141",
        profileId: "h200-x1",
        desiredReplicas: 4,
        readyReplicas: 4,
        autoscaleMin: 2,
        autoscaleMax: 8,
      },
      {
        id: "np_shared",
        name: "shared-slices",
        skuId: "h200-sxm-141",
        profileId: "h200-hami-25",
        desiredReplicas: 6,
        readyReplicas: 5,
        autoscaleMin: 2,
        autoscaleMax: 16,
      },
    ],
  },
  {
    id: "vc_regulated",
    name: "regulated",
    projectId: "prj_kyc_vision",
    k8sVersion: "v1.31.4",
    status: "ready",
    createdAt: isoAt(-140 * DAY),
    networkIsolated: true,
    apiServerEndpoint: "https://vc-regulated.np-ktm-1.corevalley.ai",
    nodePools: [
      {
        id: "np_h100",
        name: "h100-pool",
        skuId: "h100-sxm-80",
        profileId: "h100-x1",
        desiredReplicas: 2,
        readyReplicas: 2,
        autoscaleMin: 1,
        autoscaleMax: 4,
      },
    ],
  },
];

store.networkPolicies = VCLUSTERS.map((vc, i) => ({
  id: `np_${vc.id}`,
  name: `${vc.name}-baseline`,
  vclusterId: vc.id,
  mode: i === 1 ? "default-deny" : "namespace-isolated",
  updatedAt: isoAt(-6 * DAY),
  ingressRules: [
    {
      id: "in_1",
      description: "Portal control plane",
      selector: "app=corevalley-control",
      ports: "443/TCP",
      action: "allow",
    },
    {
      id: "in_2",
      description: "Everything else",
      selector: "*",
      ports: "*",
      action: "deny",
    },
  ],
  egressRules: [
    {
      id: "eg_1",
      description: "Object storage in region",
      selector: "svc=cv-storage",
      ports: "443/TCP",
      action: "allow",
    },
    {
      id: "eg_2",
      description: "Cross-border egress",
      selector: "cidr=0.0.0.0/0",
      ports: "*",
      action: i === 1 ? "deny" : "allow",
    },
  ],
}));

const MODEL_ENDPOINTS: ModelEndpoint[] = [
  {
    id: "llama-3.3-70b-instruct",
    displayName: "llama-3.3-70b-instruct",
    family: "llama",
    parameterCount: "70B",
    contextLength: 131072,
    engine: "vllm",
    servedOnSkuId: "h200-sxm-141",
    status: "live",
    quantization: "fp8",
    supportsToolCalling: true,
    supportsVision: false,
    rateLimitRpm: 600,
    tokensPerSecond: 58,
    description: "General-purpose instruction model. Strong multilingual baseline.",
  },
  {
    id: "qwen2.5-72b-instruct",
    displayName: "qwen2.5-72b-instruct",
    family: "qwen",
    parameterCount: "72B",
    contextLength: 131072,
    engine: "vllm",
    servedOnSkuId: "h200-sxm-141",
    status: "live",
    quantization: "fp8",
    supportsToolCalling: true,
    supportsVision: false,
    rateLimitRpm: 600,
    tokensPerSecond: 54,
    description: "Strong on structured output and code. Good Devanagari coverage.",
  },
  {
    id: "deepseek-v3",
    displayName: "deepseek-v3",
    family: "deepseek",
    parameterCount: "671B MoE / 37B active",
    contextLength: 65536,
    engine: "sglang",
    servedOnSkuId: "h200-sxm-141",
    status: "live",
    quantization: "fp8",
    supportsToolCalling: true,
    supportsVision: false,
    rateLimitRpm: 300,
    tokensPerSecond: 42,
    description: "Mixture-of-experts model for reasoning-heavy work.",
  },
  {
    id: "mistral-small-3.1-24b",
    displayName: "mistral-small-3.1-24b",
    family: "mistral",
    parameterCount: "24B",
    contextLength: 131072,
    engine: "vllm",
    servedOnSkuId: "h100-sxm-80",
    status: "live",
    quantization: "bf16",
    supportsToolCalling: true,
    supportsVision: true,
    rateLimitRpm: 1200,
    tokensPerSecond: 96,
    description: "Fast and inexpensive. The default for high-volume classification.",
  },
];

const JUPYTER_PROFILES: JupyterSpawnerProfile[] = JUPYTER_RATES.map((r) => ({
  id: r.spawnerProfileId,
  displayName: r.displayName,
  profileId: r.profileId,
  skuId: r.profileId === "jhub-cpu" ? null : r.skuId,
  description:
    r.profileId === "jhub-cpu"
      ? "4 vCPU / 16 GB. No GPU — for data prep and analysis."
      : profileById(r.profileId).description,
}));

store.jupyterServers = [
  {
    id: "jhub_bikash",
    userId: "usr_bikash",
    userName: "Bikash Tamang",
    spawnerProfileId: "jhub-2g",
    status: "running",
    startedAt: isoAt(-5 * HOUR),
    lastActivityAt: isoAt(-8 * MINUTE),
    url: "https://hub.np-ktm-1.corevalley.ai/user/bikash",
    billableSeconds: 5 * 3600,
    costToDatePaisa: Math.round(rateForProfile("h200-2g.35gb").paisaPerSecond * 5 * 3600),
  },
  {
    id: "jhub_pratima",
    userId: "usr_pratima",
    userName: "Pratima Gurung",
    spawnerProfileId: "jhub-1g",
    status: "culled",
    startedAt: isoAt(-30 * HOUR),
    lastActivityAt: isoAt(-26 * HOUR),
    url: "https://hub.np-ktm-1.corevalley.ai/user/pratima",
    billableSeconds: 4 * 3600,
    costToDatePaisa: Math.round(rateForProfile("h200-1g.18gb").paisaPerSecond * 4 * 3600),
  },
  {
    id: "jhub_aarati",
    userId: "usr_aarati",
    userName: "Aarati Shrestha",
    spawnerProfileId: "jhub-cpu",
    status: "stopped",
    startedAt: null,
    lastActivityAt: isoAt(-3 * DAY),
    url: "https://hub.np-ktm-1.corevalley.ai/user/aarati",
    billableSeconds: 0,
    costToDatePaisa: 0,
  },
];

store.apiKeys = [
  {
    id: "key_prod",
    name: "production-gateway",
    prefix: "cv_live_7Kd2",
    createdAt: isoAt(-90 * DAY),
    lastUsedAt: isoAt(-4 * MINUTE),
    scopedEndpointIds: [],
    revoked: false,
  },
  {
    id: "key_batch",
    name: "batch-embeddings",
    prefix: "cv_live_Q9xa",
    createdAt: isoAt(-40 * DAY),
    lastUsedAt: isoAt(-3 * HOUR),
    scopedEndpointIds: ["mistral-small-3.1-24b"],
    revoked: false,
  },
  {
    id: "key_old",
    name: "laptop-testing",
    prefix: "cv_live_1Bn4",
    createdAt: isoAt(-160 * DAY),
    lastUsedAt: isoAt(-58 * DAY),
    scopedEndpointIds: [],
    revoked: true,
  },
];

store.sshKeys = [
  {
    id: "ssh_1",
    name: "aarati@macbook",
    fingerprint: "SHA256:9r4Kd2pQvXm7TzL0aBcEfGhIjKlMnOpQrStUvWxYz01",
    addedAt: isoAt(-200 * DAY),
  },
  {
    id: "ssh_2",
    name: "bikash@workstation",
    fingerprint: "SHA256:2Xa7Bc9DeFgHiJkLmNoPqRsTuVwXyZ01234567890abc",
    addedAt: isoAt(-75 * DAY),
  },
];

const DEDICATED_NODES: DedicatedNode[] = [
  {
    id: "node_h100_01",
    name: "kyc-dedicated-01",
    skuId: "h100-sxm-80",
    gpuCount: 8,
    regionId: "np-ktm-1",
    form: "bare-metal",
    status: "active",
    term: "reserved-12mo",
    startedAt: isoAt(-140 * DAY),
    renewsAt: isoAt(225 * DAY),
    monthlyPaisa: Math.round(
      (DEDICATED_MONTHLY.find((d) => d.id === "node-h100-8x")?.paisaPerMonth ?? 0) *
        (1 - TERM_DISCOUNT_PERCENT["reserved-12mo"] / 100),
    ),
    ipmiEnabled: true,
  },
];

const METERS: Meter[] = [
  {
    id: "gpu_seconds",
    displayName: "GPU seconds",
    unit: "GPU-s",
    aggregation: "sum",
    description: "Billable GPU time, metered per second with a 60s minimum.",
  },
  {
    id: "tokens_in",
    displayName: "Input tokens",
    unit: "tok",
    aggregation: "sum",
    description: "Prompt tokens submitted to model endpoints.",
  },
  {
    id: "tokens_out",
    displayName: "Output tokens",
    unit: "tok",
    aggregation: "sum",
    description: "Tokens generated by model endpoints.",
  },
  {
    id: "storage_gb_hours",
    displayName: "Storage",
    unit: "GB-h",
    aggregation: "sum",
    description: "Provisioned volume capacity, metered hourly.",
  },
  {
    id: "egress_gb",
    displayName: "Egress",
    unit: "GB",
    aggregation: "sum",
    description: "Traffic leaving the region. Ingress and intra-region are free.",
  },
  {
    id: "dedicated_months",
    displayName: "Dedicated capacity",
    unit: "node-mo",
    aggregation: "max",
    description: "Reserved bare-metal and VM nodes.",
  },
];

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pm_esewa",
    rail: "esewa",
    displayName: "eSewa",
    detail: "98•••••321",
    isDefault: false,
  },
  {
    id: "pm_khalti",
    rail: "khalti",
    displayName: "Khalti",
    detail: "98•••••887",
    isDefault: false,
  },
  {
    id: "pm_bank",
    rail: "bank-transfer",
    displayName: "Nabil Bank",
    detail: "A/C •••• 4402",
    isDefault: false,
  },
  {
    id: "pm_invoice",
    rail: "corporate-invoice",
    displayName: "Corporate invoice",
    detail: "Net 15 · PAN 601234567",
    isDefault: true,
  },
];

const COMPLIANCE_CONTROLS: ComplianceControl[] = [
  {
    id: "cc_1",
    name: "Tenant network isolation",
    category: "Security",
    status: "implemented",
    evidence: "Cilium network policies, default-deny per vCluster namespace.",
  },
  {
    id: "cc_2",
    name: "Encryption in transit",
    category: "Security",
    status: "implemented",
    evidence: "Automated TLS issuance and renewal on all public endpoints.",
  },
  {
    id: "cc_3",
    name: "Immutable audit logging",
    category: "Security",
    status: "implemented",
    evidence: "Append-only, hash-chained audit pipeline with export.",
  },
  {
    id: "cc_4",
    name: "Data residency",
    category: "Privacy",
    status: "implemented",
    evidence: "All compute and storage physically located in Kathmandu, Nepal.",
  },
  {
    id: "cc_5",
    name: "Role-based access control",
    category: "Access",
    status: "implemented",
    evidence: "Five org roles with least-privilege defaults.",
  },
  {
    id: "cc_6",
    name: "Multi-factor authentication",
    category: "Access",
    status: "in-progress",
    evidence: "TOTP available; enforcement policy being rolled out.",
  },
  {
    id: "cc_7",
    name: "Encryption at rest",
    category: "Security",
    status: "in-progress",
    evidence: "LUKS on all NVMe; key custody procedure under review.",
  },
  {
    id: "cc_8",
    name: "Formal incident response plan",
    category: "Operations",
    status: "in-progress",
    evidence: "Runbooks drafted; tabletop exercise scheduled.",
  },
  {
    id: "cc_9",
    name: "Vendor risk management",
    category: "Governance",
    status: "planned",
    evidence: "Programme defined, not yet operating.",
  },
  {
    id: "cc_10",
    name: "Business continuity testing",
    category: "Operations",
    status: "planned",
    evidence: "Scheduled after the second region comes online.",
  },
];

const CERTIFICATES: Certificate[] = [
  {
    id: "cert_api",
    commonName: "api.corevalley.ai",
    issuer: "Let's Encrypt R11",
    autoRenew: true,
    issuedAt: isoAt(-40 * DAY),
    expiresAt: isoAt(50 * DAY),
    status: "valid",
  },
  {
    id: "cert_hub",
    commonName: "hub.np-ktm-1.corevalley.ai",
    issuer: "Let's Encrypt R11",
    autoRenew: true,
    issuedAt: isoAt(-70 * DAY),
    expiresAt: isoAt(20 * DAY),
    status: "renewing",
  },
  {
    id: "cert_vc",
    commonName: "*.np-ktm-1.corevalley.ai",
    issuer: "Let's Encrypt R11",
    autoRenew: true,
    issuedAt: isoAt(-15 * DAY),
    expiresAt: isoAt(75 * DAY),
    status: "valid",
  },
];

/* ── Audit chain ──────────────────────────────────────────────────────── */

const AUDIT_ACTIONS: [string, string, AuditLogEntry["outcome"]][] = [
  ["pod.launch", "pod", "success"],
  ["pod.stop", "pod", "success"],
  ["apikey.create", "api_key", "success"],
  ["apikey.revoke", "api_key", "success"],
  ["invoice.download", "invoice", "success"],
  ["vcluster.scale", "vcluster", "success"],
  ["networkpolicy.update", "network_policy", "success"],
  ["user.login", "session", "success"],
  ["user.login", "session", "denied"],
  ["jupyter.start", "jupyter_server", "success"],
  ["kubeconfig.download", "vcluster", "success"],
  ["sshkey.add", "ssh_key", "success"],
];

function buildAuditLog(count: number): AuditLogEntry[] {
  const entries: AuditLogEntry[] = [];
  let previousHash = "0000000000000000";
  for (let i = count - 1; i >= 0; i--) {
    const rng = makeRng(hashSeed(`audit:${i}`));
    const spec = AUDIT_ACTIONS[Math.floor(rng() * AUDIT_ACTIONS.length)]!;
    const actor = USERS[Math.floor(rng() * USERS.length)]!;
    const at = isoAt(-i * 47 * MINUTE);
    const resourceId = `res_${hashSeed(`r:${i}`).toString(16).slice(0, 6)}`;
    const payload = `${at}|${actor.id}|${spec[0]}|${resourceId}|${spec[2]}`;
    const hash = chainHash(previousHash, payload);
    entries.push({
      id: `aud_${i}`,
      at,
      actorId: actor.id,
      actorName: actor.name,
      action: spec[0],
      resourceType: spec[1],
      resourceId,
      sourceIp: `27.34.${intBetween(`ip1:${i}`, 1, 254)}.${intBetween(`ip2:${i}`, 1, 254)}`,
      outcome: spec[2],
      hash,
      previousHash,
    });
    previousHash = hash;
  }
  return entries.reverse();
}

const AUDIT_LOG = buildAuditLog(60);

/* ── Usage derivation ─────────────────────────────────────────────────── */

/** Meter quantity for one subject in one hourly bucket. */
function quantityFor(subjectId: string, meterId: MeterId, bucket: number): number {
  const base = usageAt(subjectId, meterId, bucket);
  switch (meterId) {
    case "gpu_seconds":
      return Math.round(base * 3600);
    case "tokens_in":
      return Math.round(base * 420_000);
    case "tokens_out":
      return Math.round(base * 140_000);
    case "storage_gb_hours":
      return Math.round(base * 1800);
    case "egress_gb":
      return Math.round(base * 22);
    case "dedicated_months":
      return 1;
  }
}

function costFor(subjectId: string, meterId: MeterId, quantity: number): Paisa {
  switch (meterId) {
    case "gpu_seconds": {
      const pod = store.pods.find((p) => p.id === subjectId);
      const rate = rateForProfile(pod?.profileId ?? "h200-1g.18gb");
      return Math.round(rate.paisaPerSecond * quantity * (pod?.gpuCount ?? 1));
    }
    case "tokens_in": {
      const r = TOKEN_RATES.find((t) => t.endpointId === subjectId) ?? TOKEN_RATES[0]!;
      return Math.round((r.inputPaisaPerMillion * quantity) / 1_000_000);
    }
    case "tokens_out": {
      const r = TOKEN_RATES.find((t) => t.endpointId === subjectId) ?? TOKEN_RATES[0]!;
      return Math.round((r.outputPaisaPerMillion * quantity) / 1_000_000);
    }
    case "storage_gb_hours":
      return Math.round((STORAGE_RATES["network-ssd"].paisaPerGbMonth * quantity) / 730);
    case "egress_gb":
      return Math.round(CATALOG.egress.paisaPerGb * quantity);
    case "dedicated_months":
      return DEDICATED_NODES[0]?.monthlyPaisa ?? 0;
  }
}

/** Every metered subject, so usage and invoices draw from one source. */
function meteredSubjects(): { id: string; label: string; meterId: MeterId; projectId: string }[] {
  const out: { id: string; label: string; meterId: MeterId; projectId: string }[] = [];
  for (const pod of store.pods) {
    if (pod.status === "queued") continue;
    out.push({ id: pod.id, label: pod.name, meterId: "gpu_seconds", projectId: pod.projectId });
  }
  for (const ep of MODEL_ENDPOINTS) {
    out.push({ id: ep.id, label: ep.displayName, meterId: "tokens_in", projectId: "prj_platform" });
    out.push({ id: ep.id, label: ep.displayName, meterId: "tokens_out", projectId: "prj_platform" });
  }
  out.push({ id: "vol_datasets", label: "datasets", meterId: "storage_gb_hours", projectId: "prj_nepali_llm" });
  out.push({ id: "egress_region", label: "region egress", meterId: "egress_gb", projectId: "prj_platform" });
  for (const n of DEDICATED_NODES) {
    out.push({ id: n.id, label: n.name, meterId: "dedicated_months", projectId: "prj_kyc_vision" });
  }
  return out;
}

/** Hours elapsed in the current billing period (calendar month to date). */
function hoursThisPeriod(): number {
  const d = new Date(now());
  return (d.getUTCDate() - 1) * 24 + d.getUTCHours() + 1;
}

function periodBounds(): { start: string; end: string } {
  const d = new Date(now());
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59));
  return { start: start.toISOString(), end: end.toISOString() };
}

/** Total quantity for a subject+meter across a whole period. */
function totalQuantity(subjectId: string, meterId: MeterId, buckets: number): number {
  let sum = 0;
  for (let i = 0; i < buckets; i++) sum += quantityFor(subjectId, meterId, i);
  return sum;
}

function buildLineItems(buckets: number): InvoiceLineItem[] {
  const byMeter = new Map<MeterId, InvoiceLineItem>();
  for (const s of meteredSubjects()) {
    const qty = totalQuantity(s.id, s.meterId, buckets);
    const cost = costFor(s.id, s.meterId, qty);
    const meter = METERS.find((m) => m.id === s.meterId)!;
    const existing = byMeter.get(s.meterId);
    if (existing) {
      existing.quantity += qty;
      existing.amountPaisa += cost;
    } else {
      byMeter.set(s.meterId, {
        id: `li_${s.meterId}`,
        meterId: s.meterId,
        description: meter.displayName,
        quantity: qty,
        unit: meter.unit,
        unitPricePaisa: qty > 0 ? Math.round(cost / qty) : 0,
        amountPaisa: cost,
        ratePlaceholder: true,
      });
    }
  }
  return [...byMeter.values()].filter((li) => li.amountPaisa > 0);
}

function buildInvoice(
  id: string,
  monthsAgo: number,
  status: Invoice["status"],
): Invoice {
  const buckets = monthsAgo === 0 ? hoursThisPeriod() : 730;
  const lineItems = buildLineItems(buckets);
  const subtotal = lineItems.reduce((a, li) => a + li.amountPaisa, 0);
  const { vat, total } = applyVat(subtotal);
  const credit = monthsAgo === 0 ? Math.min(store.org.creditBalancePaisa, total) : 0;
  const d = new Date(now());
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - monthsAgo, 1));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - monthsAgo + 1, 0));
  const paid = store.paidInvoiceIds.has(id) || status === "paid";
  return {
    id,
    number: `CV-${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`,
    status: paid ? "paid" : status,
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    issuedAt: monthsAgo === 0 ? null : end.toISOString(),
    dueAt: monthsAgo === 0 ? null : new Date(end.getTime() + 15 * DAY).toISOString(),
    paidAt: paid ? new Date(end.getTime() + 9 * DAY).toISOString() : null,
    lineItems,
    subtotalPaisa: subtotal,
    vatPaisa: vat,
    creditAppliedPaisa: credit,
    totalPaisa: total - credit,
    pricingIsPlaceholder: CATALOG.meta.pricingIsPlaceholder,
  };
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

const delay = <T,>(value: T, ms = 90): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function podOrThrow(id: string): Pod {
  const p = store.pods.find((x) => x.id === id);
  if (!p) throw new Error(`pod ${id} not found`);
  return p;
}

function telemetryFor(pod: Pod, tick: number): PodTelemetry {
  const profile = profileById(pod.profileId);
  const base = usageAt(pod.id, "telemetry", tick);
  const live = pod.status === "running";
  return {
    podId: pod.id,
    at: new Date().toISOString(),
    gpuUtilPercent: live ? Math.round(base * 96) : 0,
    gpuMemoryUsedGb: live ? Math.round(base * profile.gpuMemoryGb * 0.88 * 10) / 10 : 0,
    gpuTempC: live ? Math.round(46 + base * 28) : 32,
    gpuPowerW: live ? Math.round(120 + base * 480) : 42,
    cpuUtilPercent: live ? Math.round(base * 62) : 1,
    systemMemoryUsedGb: live
      ? Math.round(base * profile.systemMemoryGb * 0.6 * 10) / 10
      : 0.4,
  };
}

/** Drives a launched pod through realistic status transitions. */
function scheduleLaunch(pod: Pod, notify: () => void) {
  const steps: [PodStatus, string | null, number][] = [
    ["provisioning", "Allocating a slice on np-ktm-1", 1200],
    ["pulling-image", `Pulling ${pod.image}`, 2600],
    ["running", null, 1800],
  ];
  let acc = 0;
  for (const [status, detail, ms] of steps) {
    acc += ms;
    setTimeout(() => {
      const target = store.pods.find((p) => p.id === pod.id);
      if (!target || target.status === "terminated") return;
      target.status = status;
      target.statusDetail = detail;
      if (status === "running") target.startedAt = new Date().toISOString();
      notify();
    }, acc);
  }
}

const podSubscribers = new Map<string, Set<(p: Pod) => void>>();

function notifyPod(id: string) {
  const subs = podSubscribers.get(id);
  if (!subs) return;
  const pod = store.pods.find((p) => p.id === id);
  if (pod) subs.forEach((cb) => cb(clone(pod)));
}

/* ── Implementation ───────────────────────────────────────────────────── */

export const mockClient = {
  /* Identity */
  getCurrentUser: async () => delay(clone(store.users[0]!)),
  getOrganization: async () => delay(clone(store.org)),
  listUsers: async () => delay(clone(store.users)),
  inviteUser: async (input: { email: string; role: User["role"] }) => {
    const user: User = {
      id: `usr_${store.users.length + 1}`,
      name: input.email.split("@")[0] ?? input.email,
      email: input.email,
      role: input.role,
      lastActiveAt: new Date().toISOString(),
      mfaEnabled: false,
    };
    store.users.push(user);
    return delay(clone(user));
  },
  updateUserRole: async (userId: string, role: User["role"]) => {
    const u = store.users.find((x) => x.id === userId);
    if (!u) throw new Error("user not found");
    u.role = role;
    return delay(clone(u));
  },
  removeUser: async (userId: string) => {
    store.users = store.users.filter((u) => u.id !== userId);
    return delay(undefined);
  },

  listProjects: async () => delay(clone(store.projects.filter((p) => !p.archived))),
  createProject: async (input: { name: string; description: string }) => {
    const project: Project = {
      id: `prj_${hashSeed(input.name).toString(16).slice(0, 6)}`,
      name: input.name,
      slug: input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: input.description,
      vclusterId: "vc_research",
      createdAt: new Date().toISOString(),
      archived: false,
    };
    store.projects.push(project);
    return delay(clone(project));
  },
  updateProject: async (id: string, patch: Partial<Pick<Project, "name" | "description">>) => {
    const p = store.projects.find((x) => x.id === id);
    if (!p) throw new Error("project not found");
    Object.assign(p, patch);
    return delay(clone(p));
  },
  archiveProject: async (id: string) => {
    const p = store.projects.find((x) => x.id === id);
    if (p) p.archived = true;
    return delay(undefined);
  },

  /* Catalogue */
  listGpuSkus: async () => delay(clone(GPU_SKUS)),
  listRegions: async () => delay(clone(REGIONS)),
  listSliceProfiles: async () => delay(clone(SLICE_PROFILES)),
  listCapacity: async () => {
    const entries: CapacityEntry[] = GPU_SKUS.filter(
      (s) => s.status === "available",
    ).map((sku) => {
      const total = sku.id === "h200-sxm-141" ? 32 : 16;
      const allocated = store.pods
        .filter((p) => p.skuId === sku.id && p.status === "running")
        .reduce((a, p) => a + p.gpuCount, 0);
      const availableSlices: Record<string, number> = {};
      for (const prof of SLICE_PROFILES.filter((p) => p.skuId === sku.id)) {
        availableSlices[prof.id] = intBetween(`cap:${sku.id}:${prof.id}`, 0, 14);
      }
      return { skuId: sku.id, regionId: "np-ktm-1", totalGpus: total, allocatedGpus: allocated, availableSlices };
    });
    return delay(entries);
  },

  /* Pods */
  listPods: async (filter?: { status?: PodStatus[]; projectId?: string }) => {
    let pods = store.pods;
    if (filter?.status) pods = pods.filter((p) => filter.status!.includes(p.status));
    if (filter?.projectId) pods = pods.filter((p) => p.projectId === filter.projectId);
    return delay(clone(pods));
  },
  getPod: async (id: string) => delay(clone(podOrThrow(id))),
  estimatePod: async (input: {
    profileId: string;
    gpuCount: number;
    skuId: string;
    regionId: string;
    name: string;
  }) => {
    const rate = rateForProfile(input.profileId);
    const profile = profileById(input.profileId);
    const perHour = rate.paisaPerHour * input.gpuCount;
    const sku = skuById(profile.skuId);
    const flag =
      profile.isolation === "exclusive"
        ? `--gpu ${sku.shortName} --count ${input.gpuCount}`
        : `--gpu ${sku.shortName} --slice ${profile.label.replace(/\s/g, "")}`;
    return delay({
      profileId: input.profileId,
      gpuCount: input.gpuCount,
      ratePaisaPerHour: perHour,
      ratePaisaPerSecond: rate.paisaPerSecond * input.gpuCount,
      estimatedMonthlyPaisa: perHour * 730,
      minimumBillableSeconds: rate.minimumBillableSeconds,
      ratePlaceholder: rate.placeholder,
      cliPreview: `corevalley pods launch --name ${input.name || "my-pod"} ${flag} --region ${input.regionId}`,
    }, 60);
  },
  launchPod: async (input: {
    name: string;
    projectId: string;
    skuId: string;
    profileId: string;
    gpuCount: number;
    image: string;
    regionId: string;
    exposedPorts?: number[];
  }) => {
    const profile = profileById(input.profileId);
    const rate = rateForProfile(input.profileId);
    store.podCounter += 1;
    const pod: Pod = {
      id: `pod_${hashSeed(input.name + store.podCounter).toString(16).slice(0, 6)}`,
      name: input.name,
      projectId: input.projectId,
      vclusterId:
        store.projects.find((p) => p.id === input.projectId)?.vclusterId ?? "vc_research",
      regionId: input.regionId,
      skuId: profile.skuId,
      profileId: input.profileId,
      gpuCount: input.gpuCount,
      image: input.image,
      status: "queued",
      statusDetail: "Queued for scheduling",
      createdAt: new Date().toISOString(),
      startedAt: null,
      stoppedAt: null,
      billableSeconds: 0,
      costToDatePaisa: 0,
      ratePaisaPerHour: rate.paisaPerHour * input.gpuCount,
      sshCommand: `ssh ${input.name}@np-ktm-1.corevalley.ai`,
      exposedPorts: input.exposedPorts ?? [8888],
    };
    store.pods.unshift(pod);
    scheduleLaunch(pod, () => notifyPod(pod.id));
    return delay(clone(pod), 260);
  },
  stopPod: async (id: string) => {
    const pod = podOrThrow(id);
    pod.status = "stopping";
    pod.statusDetail = "Draining workload";
    notifyPod(id);
    setTimeout(() => {
      pod.status = "stopped";
      pod.statusDetail = null;
      pod.stoppedAt = new Date().toISOString();
      notifyPod(id);
    }, 1600);
    return delay(clone(pod));
  },
  startPod: async (id: string) => {
    const pod = podOrThrow(id);
    pod.status = "queued";
    pod.statusDetail = "Queued for scheduling";
    pod.stoppedAt = null;
    scheduleLaunch(pod, () => notifyPod(id));
    return delay(clone(pod));
  },
  terminatePod: async (id: string) => {
    const pod = podOrThrow(id);
    pod.status = "terminated";
    pod.statusDetail = null;
    notifyPod(id);
    return delay(undefined);
  },
  getPodLogs: async (id: string, limit = 60) => {
    const pod = podOrThrow(id);
    const templates = [
      "loading checkpoint shards",
      "train/loss 2.418 · lr 1.4e-05 · tok/s 18422",
      "train/loss 2.301 · lr 1.4e-05 · tok/s 18517",
      "saving adapter to /workspace/out/checkpoint-1200",
      "eval/perplexity 9.84",
      "nccl: all-reduce 8 ranks · 412 MB/s",
    ];
    const lines: LogLine[] = Array.from({ length: limit }, (_, i) => {
      const rng = makeRng(hashSeed(`${id}:log:${i}`));
      const isErr = pod.status === "failed" && i >= limit - 3;
      return {
        at: new Date(now() - (limit - i) * 30_000).toISOString(),
        stream: isErr ? ("stderr" as const) : ("stdout" as const),
        message: isErr
          ? "torch.OutOfMemoryError: CUDA out of memory. Tried to allocate 2.14 GiB"
          : templates[Math.floor(rng() * templates.length)]!,
      };
    });
    return delay(lines);
  },
  getPodTelemetrySeries: async (id: string, minutes: number) => {
    const points: TimeSeriesPoint[] = Array.from({ length: minutes }, (_, i) => ({
      t: new Date(now() - (minutes - i) * MINUTE).toISOString(),
      v: Math.round(usageAt(id, "telemetry", i) * 96),
    }));
    return delay(points);
  },
  subscribePod: (id: string, cb: (pod: Pod) => void): Unsubscribe => {
    let set = podSubscribers.get(id);
    if (!set) {
      set = new Set();
      podSubscribers.set(id, set);
    }
    set.add(cb);
    return () => {
      set!.delete(cb);
    };
  },
  subscribePodTelemetry: (id: string, cb: (t: PodTelemetry) => void): Unsubscribe => {
    let tick = 0;
    const timer = setInterval(() => {
      const pod = store.pods.find((p) => p.id === id);
      if (pod) cb(telemetryFor(pod, tick++));
    }, 2000);
    return () => clearInterval(timer);
  },

  /* JupyterHub */
  getJupyterHub: async () =>
    delay({
      version: "5.2.1",
      namedServerLimit: 3,
      idleCullMinutes: store.jupyterIdleCullMinutes,
      activeServers: store.jupyterServers.filter((s) => s.status === "running").length,
      totalUsers: store.users.length,
    }),
  listJupyterSpawnerProfiles: async () => delay(clone(JUPYTER_PROFILES)),
  listJupyterServers: async () => delay(clone(store.jupyterServers)),
  startJupyterServer: async (spawnerProfileId: string) => {
    const existing = store.jupyterServers.find(
      (s) => s.spawnerProfileId === spawnerProfileId,
    );
    const target = existing ?? store.jupyterServers[0]!;
    target.spawnerProfileId = spawnerProfileId;
    target.status = "starting";
    setTimeout(() => {
      target.status = "running";
      target.startedAt = new Date().toISOString();
      target.lastActivityAt = new Date().toISOString();
    }, 2200);
    return delay(clone(target));
  },
  stopJupyterServer: async (id: string) => {
    const s = store.jupyterServers.find((x) => x.id === id);
    if (!s) throw new Error("server not found");
    s.status = "stopped";
    s.startedAt = null;
    return delay(clone(s));
  },
  updateIdleCulling: async (minutes: number) => {
    store.jupyterIdleCullMinutes = minutes;
    return delay({
      version: "5.2.1",
      namedServerLimit: 3,
      idleCullMinutes: minutes,
      activeServers: store.jupyterServers.filter((s) => s.status === "running").length,
      totalUsers: store.users.length,
    });
  },

  /* Model endpoints */
  listModelEndpoints: async () => delay(clone(MODEL_ENDPOINTS)),
  getModelEndpoint: async (id: string) => {
    const ep = MODEL_ENDPOINTS.find((e) => e.id === id);
    if (!ep) throw new Error("endpoint not found");
    return delay(clone(ep));
  },
  testCompletion: async (input: { endpointId: string; prompt: string }) => {
    const rate = rateForEndpoint(input.endpointId);
    const inputTokens = Math.max(8, Math.ceil(input.prompt.length / 3.6));
    const outputTokens = intBetween(`gen:${input.prompt}`, 40, 180);
    const cost =
      Math.round((rate.inputPaisaPerMillion * inputTokens) / 1_000_000) +
      Math.round((rate.outputPaisaPerMillion * outputTokens) / 1_000_000);
    return delay(
      {
        endpointId: input.endpointId,
        output:
          "This is a demo response from the mock client. Connect a real vLLM gateway by setting NEXT_PUBLIC_API_MODE=http and implementing testCompletion in lib/api/http.ts.",
        inputTokens,
        outputTokens,
        latencyMs: intBetween(`lat:${input.prompt}`, 180, 900),
        costPaisa: cost,
      },
      700,
    );
  },

  listApiKeys: async () => delay(clone(store.apiKeys)),
  createApiKey: async (input: { name: string; scopedEndpointIds: string[] }) => {
    const suffix = hashSeed(input.name + Date.now()).toString(36).slice(0, 4);
    const key = {
      id: `key_${suffix}`,
      name: input.name,
      prefix: `cv_live_${suffix}`,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      scopedEndpointIds: input.scopedEndpointIds,
      revoked: false,
      secret: `cv_live_${suffix}${hashSeed(input.name).toString(36)}${suffix}xR7QpL2mT9`,
    };
    store.apiKeys.unshift({ ...key, secret: undefined } as unknown as ApiKey);
    return delay(key);
  },
  rotateApiKey: async (id: string) => {
    const k = store.apiKeys.find((x) => x.id === id);
    if (!k) throw new Error("key not found");
    const suffix = hashSeed(id + Date.now()).toString(36).slice(0, 4);
    k.prefix = `cv_live_${suffix}`;
    k.createdAt = new Date().toISOString();
    k.lastUsedAt = null;
    return delay({ ...k, secret: `cv_live_${suffix}${hashSeed(id).toString(36)}rotated` });
  },
  revokeApiKey: async (id: string) => {
    const k = store.apiKeys.find((x) => x.id === id);
    if (k) k.revoked = true;
    return delay(undefined);
  },

  /* Dedicated */
  listDedicatedNodes: async () => delay(clone(DEDICATED_NODES)),
  getDedicatedNode: async (id: string) => {
    const n = DEDICATED_NODES.find((x) => x.id === id);
    if (!n) throw new Error("node not found");
    return delay(clone(n));
  },
  requestDedicatedQuote: async (input: {
    skuId: string;
    gpuCount: number;
    term: keyof typeof TERM_DISCOUNT_PERCENT;
    months: number;
  }) => {
    const match =
      DEDICATED_MONTHLY.find(
        (d) => d.skuId === input.skuId && d.gpuCount === input.gpuCount,
      ) ?? DEDICATED_MONTHLY[0]!;
    const discount = TERM_DISCOUNT_PERCENT[input.term];
    const effective = Math.round(match.paisaPerMonth * (1 - discount / 100));
    return delay({
      input: {
        skuId: match.skuId,
        gpuCount: input.gpuCount,
        term: input.term,
        months: input.months,
      },
      listMonthlyPaisa: match.paisaPerMonth,
      discountPercent: discount,
      effectiveMonthlyPaisa: effective,
      totalPaisa: effective * input.months,
      pricingIsPlaceholder: CATALOG.meta.pricingIsPlaceholder,
    });
  },

  /* vClusters and networking */
  listVClusters: async () => delay(clone(VCLUSTERS)),
  getVCluster: async (id: string) => {
    const vc = VCLUSTERS.find((v) => v.id === id);
    if (!vc) throw new Error("vcluster not found");
    return delay(clone(vc));
  },
  createVCluster: async (input: { name: string; projectId: string }) => {
    const vc: VCluster = {
      id: `vc_${hashSeed(input.name).toString(16).slice(0, 6)}`,
      name: input.name,
      projectId: input.projectId,
      k8sVersion: "v1.31.4",
      status: "provisioning",
      createdAt: new Date().toISOString(),
      networkIsolated: true,
      apiServerEndpoint: `https://vc-${input.name}.np-ktm-1.corevalley.ai`,
      nodePools: [],
    };
    VCLUSTERS.push(vc);
    return delay(clone(vc));
  },
  deleteVCluster: async (id: string) => {
    const i = VCLUSTERS.findIndex((v) => v.id === id);
    if (i >= 0) VCLUSTERS.splice(i, 1);
    return delay(undefined);
  },
  getKubeconfig: async (id: string) => {
    const vc = VCLUSTERS.find((v) => v.id === id);
    return delay(
      `apiVersion: v1\nkind: Config\nclusters:\n- name: ${vc?.name ?? id}\n  cluster:\n    server: ${vc?.apiServerEndpoint ?? ""}\ncontexts:\n- name: ${vc?.name ?? id}\n  context:\n    cluster: ${vc?.name ?? id}\n    user: cv-user\ncurrent-context: ${vc?.name ?? id}\nusers:\n- name: cv-user\n  user:\n    token: <redacted-in-demo>\n`,
    );
  },
  scaleNodePool: async (vclusterId: string, poolId: string, replicas: number) => {
    const vc = VCLUSTERS.find((v) => v.id === vclusterId);
    if (!vc) throw new Error("vcluster not found");
    const pool = vc.nodePools.find((p) => p.id === poolId);
    if (pool) {
      pool.desiredReplicas = replicas;
      pool.readyReplicas = replicas;
    }
    return delay(clone(vc));
  },

  listNetworkPolicies: async (filter?: { vclusterId?: string }) => {
    const list = filter?.vclusterId
      ? store.networkPolicies.filter((p) => p.vclusterId === filter.vclusterId)
      : store.networkPolicies;
    return delay(clone(list));
  },
  getNetworkPolicy: async (id: string) => {
    const p = store.networkPolicies.find((x) => x.id === id);
    if (!p) throw new Error("policy not found");
    return delay(clone(p));
  },
  setNetworkPolicyMode: async (id: string, mode: NetworkPolicy["mode"]) => {
    const p = store.networkPolicies.find((x) => x.id === id);
    if (!p) throw new Error("policy not found");
    p.mode = mode;
    p.updatedAt = new Date().toISOString();
    return delay(clone(p));
  },
  getFlowSummary: async () =>
    delay({
      windowMinutes: 60,
      allowedFlows: 184_220,
      deniedFlows: 1_842,
      topTalkers: [
        { source: "vc-research/nepali-7b-sft", destination: "cv-storage", flows: 42_118 },
        { source: "vc-regulated/kyc-ocr-train", destination: "cv-storage", flows: 28_004 },
        { source: "vc-research/vllm-gateway", destination: "hub", flows: 19_772 },
      ],
    }),

  /* Metering and billing */
  listMeters: async () => delay(clone(METERS)),
  getUsageSeries: async (query: UsageQuery) => {
    const buckets = query.window === "hour" ? 24 : query.window === "day" ? 30 : 12;
    const stepMs = query.window === "hour" ? HOUR : query.window === "day" ? DAY : 30 * DAY;
    const subjects = meteredSubjects().filter(
      (s) =>
        query.meterIds.includes(s.meterId) &&
        (!query.projectId || s.projectId === query.projectId) &&
        (!query.subjectId || s.id === query.subjectId),
    );
    const series = query.meterIds.map((meterId) => {
      const meter = METERS.find((m) => m.id === meterId)!;
      const relevant = subjects.filter((s) => s.meterId === meterId);
      const points: TimeSeriesPoint[] = Array.from({ length: buckets }, (_, i) => ({
        t: new Date(now() - (buckets - i) * stepMs).toISOString(),
        v: relevant.reduce((a, s) => a + quantityFor(s.id, meterId, i), 0),
      }));
      return {
        meterId,
        window: query.window,
        points,
        total: points.reduce((a, p) => a + p.v, 0),
        unit: meter.unit,
      };
    });
    return delay(series);
  },
  getUsageBreakdown: async (groupBy: "project" | "sku" | "subject") => {
    const buckets = hoursThisPeriod();
    const rows = new Map<string, { label: string; quantity: number; unit: string; costPaisa: Paisa }>();
    for (const s of meteredSubjects()) {
      const qty = totalQuantity(s.id, s.meterId, buckets);
      const cost = costFor(s.id, s.meterId, qty);
      const meter = METERS.find((m) => m.id === s.meterId)!;
      let key: string, label: string;
      if (groupBy === "project") {
        key = s.projectId;
        label = store.projects.find((p) => p.id === s.projectId)?.name ?? s.projectId;
      } else if (groupBy === "sku") {
        const pod = store.pods.find((p) => p.id === s.id);
        key = pod?.skuId ?? s.meterId;
        label = pod ? skuById(pod.skuId).name : meter.displayName;
      } else {
        key = s.id;
        label = s.label;
      }
      const existing = rows.get(key);
      if (existing) {
        existing.quantity += qty;
        existing.costPaisa += cost;
      } else {
        rows.set(key, { label, quantity: qty, unit: meter.unit, costPaisa: cost });
      }
    }
    const total = [...rows.values()].reduce((a, r) => a + r.costPaisa, 0) || 1;
    const out = [...rows.entries()]
      .map(([key, r]) => ({
        key,
        label: r.label,
        quantity: r.quantity,
        unit: r.unit,
        costPaisa: r.costPaisa,
        sharePercent: Math.round((r.costPaisa / total) * 1000) / 10,
      }))
      .sort((a, b) => b.costPaisa - a.costPaisa);
    return delay(out);
  },
  listUsageEvents: async (limit = 50) => {
    const subjects = meteredSubjects();
    const events: UsageEvent[] = Array.from({ length: limit }, (_, i) => {
      const s = subjects[i % subjects.length]!;
      const qty = quantityFor(s.id, s.meterId, i);
      return {
        id: `evt_${i}`,
        at: new Date(now() - i * 7 * MINUTE).toISOString(),
        meterId: s.meterId,
        subjectId: s.id,
        subjectLabel: s.label,
        projectId: s.projectId,
        quantity: qty,
        costPaisa: costFor(s.id, s.meterId, qty),
      };
    });
    return delay(events);
  },
  getCurrentSpend: async () => {
    const draft = buildInvoice("inv_draft", 0, "draft");
    const elapsed = hoursThisPeriod();
    const d = new Date(now());
    const daysInMonth = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0),
    ).getUTCDate();
    const projected = Math.round((draft.totalPaisa / elapsed) * daysInMonth * 24);
    const { start, end } = periodBounds();
    return delay({
      periodStart: start,
      periodEnd: end,
      subtotalPaisa: draft.subtotalPaisa,
      vatPaisa: draft.vatPaisa,
      totalPaisa: draft.totalPaisa,
      creditAppliedPaisa: draft.creditAppliedPaisa,
      spendCapPaisa: store.org.spendCapPaisa,
      projectedTotalPaisa: projected,
      pricingIsPlaceholder: CATALOG.meta.pricingIsPlaceholder,
    });
  },

  getDraftInvoice: async () => delay(buildInvoice("inv_draft", 0, "draft")),
  listInvoices: async () =>
    delay([
      buildInvoice("inv_draft", 0, "draft"),
      buildInvoice("inv_m1", 1, "open"),
      buildInvoice("inv_m2", 2, "paid"),
      buildInvoice("inv_m3", 3, "paid"),
    ]),
  getInvoice: async (id: string) => {
    const map: Record<string, [number, Invoice["status"]]> = {
      inv_draft: [0, "draft"],
      inv_m1: [1, "open"],
      inv_m2: [2, "paid"],
      inv_m3: [3, "paid"],
    };
    const spec = map[id];
    if (!spec) throw new Error("invoice not found");
    return delay(buildInvoice(id, spec[0], spec[1]));
  },
  payInvoice: async (id: string) => {
    store.paidInvoiceIds.add(id);
    const map: Record<string, number> = { inv_draft: 0, inv_m1: 1, inv_m2: 2, inv_m3: 3 };
    return delay(buildInvoice(id, map[id] ?? 1, "paid"), 900);
  },
  listPaymentMethods: async () => delay(clone(PAYMENT_METHODS)),
  setSpendCap: async (paisa: number | null) => {
    store.org.spendCapPaisa = paisa;
    return delay(clone(store.org));
  },
  addCredit: async (paisa: number) => {
    store.org.creditBalancePaisa += paisa;
    return delay(clone(store.org));
  },

  /* Audit and compliance */
  listAuditLog: async (filter?: { limit?: number; actorId?: string }) => {
    let list = AUDIT_LOG;
    if (filter?.actorId) list = list.filter((e) => e.actorId === filter.actorId);
    return delay(clone(list.slice(0, filter?.limit ?? 40)));
  },
  verifyAuditChain: async () => {
    let previousHash = "0000000000000000";
    let broken: string | null = null;
    const ordered = [...AUDIT_LOG].reverse();
    for (const e of ordered) {
      const payload = `${e.at}|${e.actorId}|${e.action}|${e.resourceId}|${e.outcome}`;
      if (chainHash(previousHash, payload) !== e.hash) {
        broken = e.id;
        break;
      }
      previousHash = e.hash;
    }
    return delay(
      {
        verified: broken === null,
        entriesChecked: ordered.length,
        brokenAtEntryId: broken,
        verifiedAt: new Date().toISOString(),
      },
      600,
    );
  },
  exportAuditLog: async () => {
    const header = "id,at,actor,action,resource_type,resource_id,source_ip,outcome,hash";
    const rows = AUDIT_LOG.map(
      (e) =>
        `${e.id},${e.at},${e.actorName},${e.action},${e.resourceType},${e.resourceId},${e.sourceIp},${e.outcome},${e.hash}`,
    );
    return delay([header, ...rows].join("\n"));
  },
  getComplianceState: async () =>
    delay({
      framework: "SOC 2 Type I",
      posture:
        "Controls are designed and documented against the SOC 2 Type I framework. Type I attests to the design of controls at a point in time, not their operating effectiveness over a period. An independent audit has not yet been completed.",
      controls: clone(COMPLIANCE_CONTROLS),
      implementedCount: COMPLIANCE_CONTROLS.filter((c) => c.status === "implemented").length,
      totalCount: COMPLIANCE_CONTROLS.length,
      dataResidency: "All compute and storage physically located in Kathmandu, Nepal.",
      lastReviewedAt: isoAt(-18 * DAY),
    }),
  listCertificates: async () => delay(clone(CERTIFICATES)),

  listSshKeys: async () => delay(clone(store.sshKeys)),
  addSshKey: async (input: { name: string; publicKey: string }) => {
    const key: SshKey = {
      id: `ssh_${store.sshKeys.length + 1}`,
      name: input.name,
      fingerprint: `SHA256:${hashSeed(input.publicKey).toString(36).padEnd(43, "x")}`,
      addedAt: new Date().toISOString(),
    };
    store.sshKeys.push(key);
    return delay(clone(key));
  },
  removeSshKey: async (id: string) => {
    store.sshKeys = store.sshKeys.filter((k) => k.id !== id);
    return delay(undefined);
  },
} satisfies CoreValleyClient;
