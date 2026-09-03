/**
 * CoreValley domain model.
 *
 * Mirrors the real platform: HAMi/MIG-sliced GPU pods, JupyterHub, vLLM +
 * LiteLLM model endpoints, dedicated bare metal, per-customer vCluster
 * isolation, OpenMeter/Lago-style metering, Cilium tenant networking and an
 * immutable audit pipeline.
 */
import type { Paisa } from "@/lib/money";

/* ── Identity ─────────────────────────────────────────────────────────── */

export type OrgTier = "starter" | "team" | "dedicated" | "sovereign";
export type UserRole = "owner" | "admin" | "engineer" | "billing" | "viewer";

export interface Organization {
  id: string;
  name: string;
  tier: OrgTier;
  /** Registered VAT / PAN number, shown on invoices. */
  panNumber: string;
  createdAt: string;
  spendCapPaisa: Paisa | null;
  creditBalancePaisa: Paisa;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastActiveAt: string;
  mfaEnabled: boolean;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  vclusterId: string;
  createdAt: string;
  archived: boolean;
}

/* ── Hardware ─────────────────────────────────────────────────────────── */

export type GpuModelId =
  | "h200-sxm-141"
  | "h100-sxm-80"
  | "rtx-pro-6000-blackwell-96"
  | "l40s-48"
  | "l4-24";

export type FleetStatus = "available" | "coming-soon";

export interface GpuSku {
  id: GpuModelId;
  /** Marketing name, e.g. "NVIDIA H200". */
  name: string;
  /** Lowercase mono product-surface label, e.g. "h200". */
  shortName: string;
  architecture: string;
  memoryGb: number;
  memoryType: string;
  bandwidth: string;
  fp8Tflops: number | null;
  bestFor: string;
  status: FleetStatus;
  /** Whether this SKU can be partitioned with MIG. */
  migCapable: boolean;
}

export interface Region {
  id: string;
  city: string;
  country: string;
  status: "live" | "planned";
  /** Sovereignty claim surfaced across the marketing site. */
  dataResidency: string;
  powerSource: string;
}

export interface CapacityEntry {
  skuId: GpuModelId;
  regionId: string;
  totalGpus: number;
  allocatedGpus: number;
  /** Free MIG/HAMi slices by profile id. */
  availableSlices: Record<string, number>;
}

/* ── GPU slicing ──────────────────────────────────────────────────────── */

/**
 * MIG partitions a GPU in hardware: each slice gets dedicated SMs, L2 and
 * memory, with real fault isolation between tenants.
 *
 * HAMi slices in software via the device plugin: memory limits and a compute
 * percentage, scheduled onto a shared card. Cheaper, denser, but tenants are
 * NOT fault-isolated from each other. These are genuinely different products
 * and are priced and labelled as such — do not collapse them.
 */
export type SliceIsolation = "exclusive" | "mig" | "hami";

export interface SliceProfile {
  id: string;
  /** e.g. "1g.18gb" for MIG, "25%" for HAMi, "1x" for a whole card. */
  label: string;
  skuId: GpuModelId;
  isolation: SliceIsolation;
  gpuMemoryGb: number;
  /** Share of the card's compute, 1-100. */
  computePercent: number;
  vcpus: number;
  systemMemoryGb: number;
  faultIsolated: boolean;
  description: string;
}

/* ── Pods ─────────────────────────────────────────────────────────────── */

export type PodStatus =
  | "queued"
  | "provisioning"
  | "pulling-image"
  | "running"
  | "stopping"
  | "stopped"
  | "failed"
  | "terminated";

export interface Pod {
  id: string;
  name: string;
  projectId: string;
  vclusterId: string;
  regionId: string;
  skuId: GpuModelId;
  profileId: string;
  gpuCount: number;
  image: string;
  status: PodStatus;
  statusDetail: string | null;
  createdAt: string;
  startedAt: string | null;
  stoppedAt: string | null;
  /** Wall-clock seconds this pod has been billable. */
  billableSeconds: number;
  costToDatePaisa: Paisa;
  ratePaisaPerHour: Paisa;
  sshCommand: string;
  exposedPorts: number[];
}

export interface PodTelemetry {
  podId: string;
  at: string;
  gpuUtilPercent: number;
  gpuMemoryUsedGb: number;
  gpuTempC: number;
  gpuPowerW: number;
  cpuUtilPercent: number;
  systemMemoryUsedGb: number;
}

export interface TimeSeriesPoint {
  t: string;
  v: number;
}

export interface LogLine {
  at: string;
  stream: "stdout" | "stderr";
  message: string;
}

export interface LaunchPodInput {
  name: string;
  projectId: string;
  skuId: GpuModelId;
  profileId: string;
  gpuCount: number;
  image: string;
  regionId: string;
  exposedPorts?: number[];
}

export interface PodEstimate {
  profileId: string;
  gpuCount: number;
  ratePaisaPerHour: Paisa;
  ratePaisaPerSecond: number;
  estimatedMonthlyPaisa: Paisa;
  minimumBillableSeconds: number;
  /** Propagated from the catalog so the UI can badge unapproved pricing. */
  ratePlaceholder: boolean;
  cliPreview: string;
}

/* ── JupyterHub ───────────────────────────────────────────────────────── */

export type JupyterServerStatus = "stopped" | "starting" | "running" | "culled";

export interface JupyterSpawnerProfile {
  id: string;
  displayName: string;
  profileId: string;
  skuId: GpuModelId | null;
  description: string;
}

export interface JupyterServer {
  id: string;
  userId: string;
  userName: string;
  spawnerProfileId: string;
  status: JupyterServerStatus;
  startedAt: string | null;
  lastActivityAt: string;
  url: string;
  billableSeconds: number;
  costToDatePaisa: Paisa;
}

export interface JupyterHubState {
  version: string;
  namedServerLimit: number;
  idleCullMinutes: number;
  activeServers: number;
  totalUsers: number;
}

/* ── Model endpoints ──────────────────────────────────────────────────── */

export interface ModelEndpoint {
  id: string;
  displayName: string;
  family: "llama" | "qwen" | "deepseek" | "mistral";
  parameterCount: string;
  contextLength: number;
  /** Inference engine actually serving it. */
  engine: "vllm" | "sglang";
  servedOnSkuId: GpuModelId;
  status: "live" | "loading" | "offline";
  quantization: string;
  supportsToolCalling: boolean;
  supportsVision: boolean;
  /** Requests per minute for the caller's tier. */
  rateLimitRpm: number;
  tokensPerSecond: number;
  description: string;
}

export interface ApiKey {
  id: string;
  name: string;
  /** Only the display prefix is ever returned after creation. */
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  /** Empty means all endpoints. */
  scopedEndpointIds: string[];
  revoked: boolean;
}

export interface CreatedApiKey extends ApiKey {
  /** Returned exactly once, at creation. */
  secret: string;
}

export interface CompletionResult {
  endpointId: string;
  output: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  costPaisa: Paisa;
}

/* ── Dedicated nodes ──────────────────────────────────────────────────── */

export interface DedicatedNode {
  id: string;
  name: string;
  skuId: GpuModelId;
  gpuCount: number;
  regionId: string;
  form: "bare-metal" | "vm";
  status: "provisioning" | "active" | "maintenance" | "expired";
  term: "on-demand-monthly" | "reserved-6mo" | "reserved-12mo" | "reserved-36mo";
  startedAt: string;
  renewsAt: string;
  monthlyPaisa: Paisa;
  ipmiEnabled: boolean;
}

export interface DedicatedQuoteInput {
  skuId: GpuModelId;
  gpuCount: number;
  term: DedicatedNode["term"];
  months: number;
}

export interface DedicatedQuote {
  input: DedicatedQuoteInput;
  listMonthlyPaisa: Paisa;
  discountPercent: number;
  effectiveMonthlyPaisa: Paisa;
  totalPaisa: Paisa;
  pricingIsPlaceholder: boolean;
}

/* ── vClusters ────────────────────────────────────────────────────────── */

export interface VCluster {
  id: string;
  name: string;
  projectId: string;
  k8sVersion: string;
  status: "provisioning" | "ready" | "degraded" | "deleting";
  createdAt: string;
  nodePools: NodePool[];
  /** Cilium-enforced tenant isolation. */
  networkIsolated: boolean;
  apiServerEndpoint: string;
}

export interface NodePool {
  id: string;
  name: string;
  skuId: GpuModelId;
  profileId: string;
  desiredReplicas: number;
  readyReplicas: number;
  autoscaleMin: number;
  autoscaleMax: number;
}

/* ── Networking ───────────────────────────────────────────────────────── */

export type NetworkPolicyMode = "default-deny" | "namespace-isolated" | "open";

export interface NetworkPolicy {
  id: string;
  name: string;
  vclusterId: string;
  mode: NetworkPolicyMode;
  /** Rendered as Cilium CiliumNetworkPolicy rules. */
  ingressRules: NetworkRule[];
  egressRules: NetworkRule[];
  updatedAt: string;
}

export interface NetworkRule {
  id: string;
  description: string;
  selector: string;
  ports: string;
  action: "allow" | "deny";
}

export interface FlowSummary {
  windowMinutes: number;
  allowedFlows: number;
  deniedFlows: number;
  topTalkers: { source: string; destination: string; flows: number }[];
}

/* ── Metering & billing ───────────────────────────────────────────────── */

export type MeterId =
  | "gpu_seconds"
  | "tokens_in"
  | "tokens_out"
  | "storage_gb_hours"
  | "egress_gb"
  | "dedicated_months";

export interface Meter {
  id: MeterId;
  displayName: string;
  unit: string;
  aggregation: "sum" | "max" | "last";
  description: string;
}

export type UsageWindow = "hour" | "day" | "month";

export interface UsageSeries {
  meterId: MeterId;
  window: UsageWindow;
  points: TimeSeriesPoint[];
  total: number;
  unit: string;
}

export interface UsageEvent {
  id: string;
  at: string;
  meterId: MeterId;
  /** The pod, endpoint, server or node the usage is attributed to. */
  subjectId: string;
  subjectLabel: string;
  projectId: string;
  quantity: number;
  costPaisa: Paisa;
}

export interface UsageBreakdownRow {
  key: string;
  label: string;
  quantity: number;
  unit: string;
  costPaisa: Paisa;
  sharePercent: number;
}

export interface CurrentSpend {
  periodStart: string;
  periodEnd: string;
  subtotalPaisa: Paisa;
  vatPaisa: Paisa;
  totalPaisa: Paisa;
  creditAppliedPaisa: Paisa;
  spendCapPaisa: Paisa | null;
  /** Straight-line extrapolation to period end. */
  projectedTotalPaisa: Paisa;
  pricingIsPlaceholder: boolean;
}

export interface InvoiceLineItem {
  id: string;
  meterId: MeterId;
  description: string;
  quantity: number;
  unit: string;
  unitPricePaisa: Paisa;
  amountPaisa: Paisa;
  ratePlaceholder: boolean;
}

export type InvoiceStatus = "draft" | "open" | "paid" | "overdue" | "void";

export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  periodStart: string;
  periodEnd: string;
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  lineItems: InvoiceLineItem[];
  subtotalPaisa: Paisa;
  vatPaisa: Paisa;
  creditAppliedPaisa: Paisa;
  totalPaisa: Paisa;
  pricingIsPlaceholder: boolean;
}

export type PaymentRail = "esewa" | "khalti" | "bank-transfer" | "corporate-invoice";

export interface PaymentMethod {
  id: string;
  rail: PaymentRail;
  displayName: string;
  detail: string;
  isDefault: boolean;
}

/* ── Audit & compliance ───────────────────────────────────────────────── */

export interface AuditLogEntry {
  id: string;
  at: string;
  actorId: string;
  actorName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  sourceIp: string;
  outcome: "success" | "denied" | "error";
  /** Hash chain: each entry commits to its predecessor. */
  hash: string;
  previousHash: string;
}

export interface AuditChainVerification {
  verified: boolean;
  entriesChecked: number;
  brokenAtEntryId: string | null;
  verifiedAt: string;
}

export interface Certificate {
  id: string;
  commonName: string;
  issuer: string;
  /** Automated issuance and renewal. */
  autoRenew: boolean;
  issuedAt: string;
  expiresAt: string;
  status: "valid" | "renewing" | "expiring-soon" | "expired";
}

export interface ComplianceControl {
  id: string;
  name: string;
  category: string;
  status: "implemented" | "in-progress" | "planned";
  evidence: string;
}

export interface ComplianceState {
  framework: string;
  /** Type I attests design of controls at a point in time, not operating
   *  effectiveness over a period — the copy must not overstate this. */
  posture: string;
  controls: ComplianceControl[];
  implementedCount: number;
  totalCount: number;
  dataResidency: string;
  lastReviewedAt: string;
}

export interface SshKey {
  id: string;
  name: string;
  fingerprint: string;
  addedAt: string;
}
