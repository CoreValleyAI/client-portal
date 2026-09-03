import { Badge, Card, Icon } from "@/components/ui";
import {
  MetricTile,
  PortalPageHeader,
  TableScroll,
  Th,
} from "@/components/portal/primitives";
import { getClient } from "@/lib/api/client";
import { formatCompactNumber, formatDateTime } from "@/lib/format";

export const metadata = { title: "Network" };

const MODE_COPY: Record<string, string> = {
  "default-deny":
    "Nothing is permitted unless a rule allows it. The strictest posture, and the right default for regulated projects.",
  "namespace-isolated":
    "Traffic is permitted within the namespace and denied across tenants.",
  open: "No policy enforcement. Use only for scratch projects.",
};

export default async function NetworkPage() {
  const cv = getClient();
  const [policies, flows, clusters] = await Promise.all([
    cv.listNetworkPolicies(),
    cv.getFlowSummary(),
    cv.listVClusters(),
  ]);

  const denyRate =
    (flows.deniedFlows / Math.max(1, flows.allowedFlows + flows.deniedFlows)) * 100;

  return (
    <>
      <PortalPageHeader
        title="network"
        description="Tenant isolation is enforced with Cilium. Policies compile to CiliumNetworkPolicy resources inside your vCluster, and every flow decision is observable."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricTile
          label={`allowed flows · ${flows.windowMinutes}m`}
          value={formatCompactNumber(flows.allowedFlows)}
        />
        <MetricTile
          label={`denied flows · ${flows.windowMinutes}m`}
          value={formatCompactNumber(flows.deniedFlows)}
          sub={`${denyRate.toFixed(1)}% of traffic`}
        />
        <MetricTile
          label="policies enforced"
          value={policies.length}
          sub="one per vcluster"
          accent
        />
      </div>

      <section className="mt-8 space-y-4">
        {policies.map((p) => {
          const vc = clusters.find((c) => c.id === p.vclusterId);
          return (
            <Card key={p.id} surface="panel" padding={0}>
              <div className="flex flex-wrap items-center gap-3 border-b border-line-subtle px-5 py-4">
                <Icon name="certificate" size={17} className="text-hydro" />
                <div>
                  <h2 className="font-mono text-[13.5px] text-ink-100">{p.name}</h2>
                  <p className="mt-0.5 font-body text-[12px] font-light text-ink-500">
                    {vc?.name ?? p.vclusterId}
                  </p>
                </div>
                <Badge
                  tone={p.mode === "default-deny" ? "hydro" : "neutral"}
                  className="ml-auto"
                >
                  {p.mode}
                </Badge>
              </div>

              <p className="border-b border-line-subtle px-5 py-3 font-body text-[12.5px] font-light leading-relaxed text-ink-400">
                {MODE_COPY[p.mode]}
              </p>

              <div className="grid gap-0 md:grid-cols-2">
                {(
                  [
                    ["ingress", p.ingressRules],
                    ["egress", p.egressRules],
                  ] as const
                ).map(([label, rules], idx) => (
                  <div
                    key={label}
                    className={idx === 1 ? "md:border-l md:border-line-subtle" : ""}
                  >
                    <p className="cv-label px-5 pt-4 pb-2 text-[10px]">{label}</p>
                    <ul>
                      {rules.map((r) => (
                        <li
                          key={r.id}
                          className="flex items-start gap-3 border-t border-line-subtle px-5 py-3"
                        >
                          <Icon
                            name={r.action === "allow" ? "check" : "x"}
                            size={14}
                            className={
                              r.action === "allow"
                                ? "mt-0.5 shrink-0 text-hydro"
                                : "mt-0.5 shrink-0 text-danger"
                            }
                          />
                          <span className="min-w-0">
                            <span className="block font-body text-[13px] text-ink-200">
                              {r.description}
                            </span>
                            <span className="mt-0.5 block font-mono text-[11px] text-ink-600">
                              {r.selector} · {r.ports}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <p className="border-t border-line-subtle px-5 py-3 font-mono text-[11px] text-ink-600">
                updated {formatDateTime(p.updatedAt)}
              </p>
            </Card>
          );
        })}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-mono text-[14px] text-ink-200">top talkers</h2>
        <TableScroll minWidth="40rem">
          <thead>
            <tr>
              <Th>source</Th>
              <Th>destination</Th>
              <Th align="right">flows</Th>
            </tr>
          </thead>
          <tbody>
            {flows.topTalkers.map((t, i) => (
              <tr
                key={`${t.source}-${t.destination}`}
                className={i > 0 ? "border-t border-line-subtle" : ""}
              >
                <td className="px-4 py-3.5 font-mono text-[12.5px] text-ink-200">
                  {t.source}
                </td>
                <td className="px-4 py-3.5 font-mono text-[12.5px] text-ink-400">
                  {t.destination}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-[12.5px] text-ink-300">
                  {formatCompactNumber(t.flows)}
                </td>
              </tr>
            ))}
          </tbody>
        </TableScroll>
      </section>
    </>
  );
}
