import { Badge, Card, Icon, Terminal } from "@/components/ui";
import { PortalPageHeader, UtilBar } from "@/components/portal/primitives";
import { getClient } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import { skuById } from "@/lib/catalog";

export const metadata = { title: "vClusters" };

export default async function ClustersPage() {
  const cv = getClient();
  const [clusters, projects, policies] = await Promise.all([
    cv.listVClusters(),
    cv.listProjects(),
    cv.listNetworkPolicies(),
  ]);

  return (
    <>
      <PortalPageHeader
        title="vclusters"
        description="Each project runs in a dedicated virtual Kubernetes cluster with its own API server. Bring kubectl if you would rather not use our CLI."
      />

      <div className="space-y-4">
        {clusters.map((vc) => {
          const project = projects.find((p) => p.id === vc.projectId);
          const policy = policies.find((p) => p.vclusterId === vc.id);
          return (
            <Card key={vc.id} surface="panel" padding={0}>
              <div className="flex flex-wrap items-center gap-3 border-b border-line-subtle px-5 py-4">
                <Icon name="cluster" size={18} className="text-hydro" />
                <div>
                  <h2 className="font-mono text-[14px] text-ink-100">{vc.name}</h2>
                  <p className="mt-0.5 font-body text-[12px] font-light text-ink-500">
                    {project?.name ?? vc.projectId} · {vc.k8sVersion}
                  </p>
                </div>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  {vc.networkIsolated ? (
                    <Badge tone="info">network isolated</Badge>
                  ) : null}
                  {policy ? <Badge tone="neutral">{policy.mode}</Badge> : null}
                  <Badge tone={vc.status === "ready" ? "success" : "warning"} dot>
                    {vc.status}
                  </Badge>
                </div>
              </div>

              <div className="px-5 py-4">
                <p className="cv-label mb-3 text-[10px]">node pools</p>
                <div className="space-y-3">
                  {vc.nodePools.map((pool) => {
                    const sku = skuById(pool.skuId);
                    const pct = Math.round(
                      (pool.readyReplicas / Math.max(1, pool.desiredReplicas)) * 100,
                    );
                    return (
                      <div
                        key={pool.id}
                        className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-md border border-line bg-carbon-700 px-4 py-3"
                      >
                        <span className="font-mono text-[12.5px] text-ink-200">
                          {pool.name}
                        </span>
                        <span className="font-mono text-[11.5px] text-ink-500">
                          {sku.shortName} · {pool.profileId}
                        </span>
                        <span className="font-mono text-[11.5px] text-ink-400">
                          {pool.readyReplicas}/{pool.desiredReplicas} ready
                        </span>
                        <span className="ml-auto flex items-center gap-4">
                          <span className="font-mono text-[11px] text-ink-600">
                            autoscale {pool.autoscaleMin}–{pool.autoscaleMax}
                          </span>
                          <UtilBar value={pct} width={80} />
                        </span>
                      </div>
                    );
                  })}
                  {vc.nodePools.length === 0 ? (
                    <p className="font-body text-[13px] font-light text-ink-500">
                      No node pools yet.
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line-subtle pt-4">
                  <span className="cv-label text-[10px]">api server</span>
                  <code className="font-mono text-[12px] text-hydro">
                    {vc.apiServerEndpoint}
                  </code>
                  <span className="ml-auto font-mono text-[11px] text-ink-600">
                    created {formatDate(vc.createdAt)}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-mono text-[14px] text-ink-200">
          connect with kubectl
        </h2>
        <Terminal
          cursor={false}
          lines={[
            { prompt: "$", text: "corevalley clusters kubeconfig research > ~/.kube/cv" },
            { prompt: "$", text: "export KUBECONFIG=~/.kube/cv" },
            { prompt: "$", text: "kubectl get nodes" },
            { out: "NAME              STATUS   ROLES    VERSION" },
            { out: "cv-h200-pool-01   Ready    <none>   v1.31.4" },
            { comment: "your namespaces, your CRDs, your RBAC" },
          ]}
        />
      </section>
    </>
  );
}
