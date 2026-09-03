import { Badge, Card, Icon } from "@/components/ui";
import {
  MetricTile,
  PlaceholderPricingBadge,
  PortalPageHeader,
  TableScroll,
  Th,
} from "@/components/portal/primitives";
import { getClient } from "@/lib/api/client";
import { formatNpr } from "@/lib/money";
import { formatDateTime, formatDuration } from "@/lib/format";
import { JUPYTER_RATES } from "@/lib/catalog";

export const metadata = { title: "Notebooks" };

const STATUS_TONE = {
  running: "success",
  starting: "info",
  stopped: "neutral",
  culled: "warning",
} as const;

export default async function JupyterPage() {
  const cv = getClient();
  const [hub, servers, profiles] = await Promise.all([
    cv.getJupyterHub(),
    cv.listJupyterServers(),
    cv.listJupyterSpawnerProfiles(),
  ]);

  return (
    <>
      <PortalPageHeader
        title="notebooks"
        description="Managed JupyterHub. Users pick a spawner profile; idle servers are culled automatically so a forgotten notebook does not bill overnight."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="active servers"
          value={hub.activeServers}
          sub={`of ${hub.totalUsers} users`}
          accent
        />
        <MetricTile label="hub version" value={hub.version} sub="JupyterHub" />
        <MetricTile
          label="idle culling"
          value={`${hub.idleCullMinutes}m`}
          sub="then the meter stops"
        />
        <MetricTile
          label="named servers"
          value={hub.namedServerLimit}
          sub="limit per user"
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-mono text-[14px] text-ink-200">servers</h2>
        <TableScroll minWidth="52rem">
          <thead>
            <tr>
              <Th>user</Th>
              <Th>profile</Th>
              <Th>status</Th>
              <Th>last activity</Th>
              <Th>runtime</Th>
              <Th align="right">cost this cycle</Th>
            </tr>
          </thead>
          <tbody>
            {servers.map((s, i) => {
              const profile = profiles.find((p) => p.id === s.spawnerProfileId);
              return (
                <tr key={s.id} className={i > 0 ? "border-t border-line-subtle" : ""}>
                  <td className="px-4 py-3.5">
                    <div className="font-body text-[13.5px] text-ink-100">
                      {s.userName}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-ink-600">
                      {s.id}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[12.5px] text-ink-300">
                    {profile?.displayName ?? s.spawnerProfileId}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge tone={STATUS_TONE[s.status]} dot={s.status === "running"}>
                      {s.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[12px] text-ink-400">
                    {formatDateTime(s.lastActivityAt)}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[12.5px] text-ink-400">
                    {formatDuration(s.billableSeconds)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-[12.5px] text-ink-200">
                    {formatNpr(s.costToDatePaisa, { compact: true })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableScroll>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center gap-3">
          <h2 className="font-mono text-[14px] text-ink-200">spawner profiles</h2>
          <PlaceholderPricingBadge />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {profiles.map((p) => {
            const rate = JUPYTER_RATES.find((r) => r.spawnerProfileId === p.id);
            return (
              <Card key={p.id} surface="panel" padding={20}>
                <div className="flex items-center gap-2.5">
                  <Icon
                    name={p.skuId ? "cpu" : "database"}
                    size={17}
                    className="text-hydro"
                  />
                  <span className="font-mono text-[13.5px] text-ink-100">
                    {p.displayName}
                  </span>
                </div>
                <p className="mt-3 font-body text-[12.5px] font-light leading-relaxed text-ink-400">
                  {p.description}
                </p>
                {rate ? (
                  <p className="mt-4 border-t border-line-subtle pt-3.5 font-mono text-[14px] text-hydro">
                    {formatNpr(rate.paisaPerHour)}
                    <span className="ml-1 text-[11px] text-fg-muted">
                      per user-hour
                    </span>
                  </p>
                ) : null}
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
