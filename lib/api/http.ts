/**
 * Real-backend implementation. Every method is a stub until the control-plane
 * API exists.
 *
 * This file is written and kept in step with client.ts deliberately: it proves
 * the interface is implementable over plain REST, and the `satisfies` check at
 * the bottom turns any signature drift between here and mock.ts into a compile
 * error rather than a runtime surprise.
 *
 * Selected with NEXT_PUBLIC_API_MODE=http.
 */
import type { CoreValleyClient } from "./client";

export class NotImplementedError extends Error {
  constructor(method: string) {
    super(
      `CoreValley HTTP client: ${method}() is not implemented yet. ` +
        "Set NEXT_PUBLIC_API_MODE=mock, or implement this method against the control-plane API.",
    );
    this.name = "NotImplementedError";
  }
}

const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/** Placeholder for the eventual fetch wrapper (auth headers, error mapping). */
function todo(method: string): never {
  void base;
  throw new NotImplementedError(method);
}

export const httpClient = {
  getCurrentUser: () => todo("getCurrentUser"),
  getOrganization: () => todo("getOrganization"),
  listUsers: () => todo("listUsers"),
  inviteUser: () => todo("inviteUser"),
  updateUserRole: () => todo("updateUserRole"),
  removeUser: () => todo("removeUser"),
  listProjects: () => todo("listProjects"),
  createProject: () => todo("createProject"),
  updateProject: () => todo("updateProject"),
  archiveProject: () => todo("archiveProject"),
  listGpuSkus: () => todo("listGpuSkus"),
  listRegions: () => todo("listRegions"),
  listSliceProfiles: () => todo("listSliceProfiles"),
  listCapacity: () => todo("listCapacity"),
  listPods: () => todo("listPods"),
  getPod: () => todo("getPod"),
  estimatePod: () => todo("estimatePod"),
  launchPod: () => todo("launchPod"),
  stopPod: () => todo("stopPod"),
  startPod: () => todo("startPod"),
  terminatePod: () => todo("terminatePod"),
  getPodLogs: () => todo("getPodLogs"),
  getPodTelemetrySeries: () => todo("getPodTelemetrySeries"),
  subscribePod: () => todo("subscribePod"),
  subscribePodTelemetry: () => todo("subscribePodTelemetry"),
  getJupyterHub: () => todo("getJupyterHub"),
  listJupyterSpawnerProfiles: () => todo("listJupyterSpawnerProfiles"),
  listJupyterServers: () => todo("listJupyterServers"),
  startJupyterServer: () => todo("startJupyterServer"),
  stopJupyterServer: () => todo("stopJupyterServer"),
  updateIdleCulling: () => todo("updateIdleCulling"),
  listModelEndpoints: () => todo("listModelEndpoints"),
  getModelEndpoint: () => todo("getModelEndpoint"),
  testCompletion: () => todo("testCompletion"),
  listApiKeys: () => todo("listApiKeys"),
  createApiKey: () => todo("createApiKey"),
  rotateApiKey: () => todo("rotateApiKey"),
  revokeApiKey: () => todo("revokeApiKey"),
  listDedicatedNodes: () => todo("listDedicatedNodes"),
  getDedicatedNode: () => todo("getDedicatedNode"),
  requestDedicatedQuote: () => todo("requestDedicatedQuote"),
  listVClusters: () => todo("listVClusters"),
  getVCluster: () => todo("getVCluster"),
  createVCluster: () => todo("createVCluster"),
  deleteVCluster: () => todo("deleteVCluster"),
  getKubeconfig: () => todo("getKubeconfig"),
  scaleNodePool: () => todo("scaleNodePool"),
  listNetworkPolicies: () => todo("listNetworkPolicies"),
  getNetworkPolicy: () => todo("getNetworkPolicy"),
  setNetworkPolicyMode: () => todo("setNetworkPolicyMode"),
  getFlowSummary: () => todo("getFlowSummary"),
  listMeters: () => todo("listMeters"),
  getUsageSeries: () => todo("getUsageSeries"),
  getUsageBreakdown: () => todo("getUsageBreakdown"),
  listUsageEvents: () => todo("listUsageEvents"),
  getCurrentSpend: () => todo("getCurrentSpend"),
  getDraftInvoice: () => todo("getDraftInvoice"),
  listInvoices: () => todo("listInvoices"),
  getInvoice: () => todo("getInvoice"),
  payInvoice: () => todo("payInvoice"),
  listPaymentMethods: () => todo("listPaymentMethods"),
  setSpendCap: () => todo("setSpendCap"),
  addCredit: () => todo("addCredit"),
  listAuditLog: () => todo("listAuditLog"),
  verifyAuditChain: () => todo("verifyAuditChain"),
  exportAuditLog: () => todo("exportAuditLog"),
  getComplianceState: () => todo("getComplianceState"),
  listCertificates: () => todo("listCertificates"),
  listSshKeys: () => todo("listSshKeys"),
  addSshKey: () => todo("addSshKey"),
  removeSshKey: () => todo("removeSshKey"),
} satisfies CoreValleyClient;
