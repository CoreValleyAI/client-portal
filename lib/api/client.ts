/**
 * The contract every portal screen talks to.
 *
 * Written before either implementation, so the interface stays honestly
 * implementable over REST — no synchronous reads, no returning live objects
 * the caller can mutate. Both mock.ts and http.ts assert `satisfies
 * CoreValleyClient`, so signature drift is a compile error.
 *
 * subscribe* returns an Unsubscribe rather than exposing an EventSource: the
 * mock uses setInterval, a real backend will use SSE, and no screen changes.
 */
import type {
  ApiKey,
  AuditChainVerification,
  AuditLogEntry,
  CapacityEntry,
  Certificate,
  CompletionResult,
  ComplianceState,
  CreatedApiKey,
  CurrentSpend,
  DedicatedNode,
  DedicatedQuote,
  DedicatedQuoteInput,
  FlowSummary,
  GpuSku,
  Invoice,
  JupyterHubState,
  JupyterServer,
  JupyterSpawnerProfile,
  LaunchPodInput,
  LogLine,
  Meter,
  MeterId,
  ModelEndpoint,
  NetworkPolicy,
  NetworkPolicyMode,
  Organization,
  PaymentMethod,
  Pod,
  PodEstimate,
  PodTelemetry,
  Project,
  Region,
  SliceProfile,
  SshKey,
  TimeSeriesPoint,
  UsageBreakdownRow,
  UsageEvent,
  UsageSeries,
  UsageWindow,
  User,
  VCluster,
} from "./types";

export type Unsubscribe = () => void;

export interface UsageQuery {
  meterIds: MeterId[];
  window: UsageWindow;
  projectId?: string;
  subjectId?: string;
}

export interface CoreValleyClient {
  /* ── Identity ───────────────────────────────────────────────── */
  getCurrentUser(): Promise<User>;
  getOrganization(): Promise<Organization>;
  listUsers(): Promise<User[]>;
  inviteUser(input: { email: string; role: User["role"] }): Promise<User>;
  updateUserRole(userId: string, role: User["role"]): Promise<User>;
  removeUser(userId: string): Promise<void>;

  listProjects(): Promise<Project[]>;
  createProject(input: { name: string; description: string }): Promise<Project>;
  updateProject(id: string, patch: Partial<Pick<Project, "name" | "description">>): Promise<Project>;
  archiveProject(id: string): Promise<void>;

  /* ── Catalogue ──────────────────────────────────────────────── */
  listGpuSkus(): Promise<GpuSku[]>;
  listRegions(): Promise<Region[]>;
  listSliceProfiles(): Promise<SliceProfile[]>;
  listCapacity(): Promise<CapacityEntry[]>;

  /* ── Pods ───────────────────────────────────────────────────── */
  listPods(filter?: { status?: Pod["status"][]; projectId?: string }): Promise<Pod[]>;
  getPod(id: string): Promise<Pod>;
  estimatePod(input: Pick<LaunchPodInput, "profileId" | "gpuCount" | "skuId" | "regionId" | "name">): Promise<PodEstimate>;
  launchPod(input: LaunchPodInput): Promise<Pod>;
  stopPod(id: string): Promise<Pod>;
  startPod(id: string): Promise<Pod>;
  terminatePod(id: string): Promise<void>;
  getPodLogs(id: string, limit?: number): Promise<LogLine[]>;
  getPodTelemetrySeries(id: string, minutes: number): Promise<TimeSeriesPoint[]>;
  subscribePod(id: string, cb: (pod: Pod) => void): Unsubscribe;
  subscribePodTelemetry(id: string, cb: (t: PodTelemetry) => void): Unsubscribe;

  /* ── JupyterHub ─────────────────────────────────────────────── */
  getJupyterHub(): Promise<JupyterHubState>;
  listJupyterSpawnerProfiles(): Promise<JupyterSpawnerProfile[]>;
  listJupyterServers(): Promise<JupyterServer[]>;
  startJupyterServer(spawnerProfileId: string): Promise<JupyterServer>;
  stopJupyterServer(id: string): Promise<JupyterServer>;
  updateIdleCulling(minutes: number): Promise<JupyterHubState>;

  /* ── Model endpoints ────────────────────────────────────────── */
  listModelEndpoints(): Promise<ModelEndpoint[]>;
  getModelEndpoint(id: string): Promise<ModelEndpoint>;
  testCompletion(input: { endpointId: string; prompt: string }): Promise<CompletionResult>;

  listApiKeys(): Promise<ApiKey[]>;
  createApiKey(input: { name: string; scopedEndpointIds: string[] }): Promise<CreatedApiKey>;
  rotateApiKey(id: string): Promise<CreatedApiKey>;
  revokeApiKey(id: string): Promise<void>;

  /* ── Dedicated ──────────────────────────────────────────────── */
  listDedicatedNodes(): Promise<DedicatedNode[]>;
  getDedicatedNode(id: string): Promise<DedicatedNode>;
  requestDedicatedQuote(input: DedicatedQuoteInput): Promise<DedicatedQuote>;

  /* ── vClusters and networking ───────────────────────────────── */
  listVClusters(): Promise<VCluster[]>;
  getVCluster(id: string): Promise<VCluster>;
  createVCluster(input: { name: string; projectId: string }): Promise<VCluster>;
  deleteVCluster(id: string): Promise<void>;
  getKubeconfig(id: string): Promise<string>;
  scaleNodePool(vclusterId: string, poolId: string, replicas: number): Promise<VCluster>;

  listNetworkPolicies(filter?: { vclusterId?: string }): Promise<NetworkPolicy[]>;
  getNetworkPolicy(id: string): Promise<NetworkPolicy>;
  setNetworkPolicyMode(id: string, mode: NetworkPolicyMode): Promise<NetworkPolicy>;
  getFlowSummary(): Promise<FlowSummary>;

  /* ── Metering and billing ───────────────────────────────────── */
  listMeters(): Promise<Meter[]>;
  getUsageSeries(query: UsageQuery): Promise<UsageSeries[]>;
  getUsageBreakdown(groupBy: "project" | "sku" | "subject"): Promise<UsageBreakdownRow[]>;
  listUsageEvents(limit?: number): Promise<UsageEvent[]>;
  getCurrentSpend(): Promise<CurrentSpend>;

  getDraftInvoice(): Promise<Invoice>;
  listInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice>;
  payInvoice(id: string, paymentMethodId: string): Promise<Invoice>;
  listPaymentMethods(): Promise<PaymentMethod[]>;
  setSpendCap(paisa: number | null): Promise<Organization>;
  addCredit(paisa: number): Promise<Organization>;

  /* ── Audit, compliance, keys ────────────────────────────────── */
  listAuditLog(filter?: { limit?: number; actorId?: string }): Promise<AuditLogEntry[]>;
  verifyAuditChain(): Promise<AuditChainVerification>;
  exportAuditLog(): Promise<string>;
  getComplianceState(): Promise<ComplianceState>;
  listCertificates(): Promise<Certificate[]>;

  listSshKeys(): Promise<SshKey[]>;
  addSshKey(input: { name: string; publicKey: string }): Promise<SshKey>;
  removeSshKey(id: string): Promise<void>;
}

/* ── Selection ────────────────────────────────────────────────────────── */

import { httpClient } from "./http";
import { mockClient } from "./mock";

/**
 * NEXT_PUBLIC_API_MODE=http points the whole portal at a real backend.
 * Defaults to the mock so the app runs with no services present.
 *
 * Static imports rather than require(): require is not available in client
 * bundles. Because NEXT_PUBLIC_API_MODE is inlined at build time, the unused
 * branch is dead code and gets eliminated in the production build.
 */
export function getClient(): CoreValleyClient {
  return process.env.NEXT_PUBLIC_API_MODE === "http" ? httpClient : mockClient;
}
