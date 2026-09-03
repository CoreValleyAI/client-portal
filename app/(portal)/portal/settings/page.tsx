import { Badge, Card, Icon } from "@/components/ui";
import {
  PortalPageHeader,
  TableScroll,
  Th,
} from "@/components/portal/primitives";
import { getClient } from "@/lib/api/client";
import { formatNpr } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/format";

export const metadata = { title: "Settings" };

const ROLE_TONE = {
  owner: "hydro",
  admin: "info",
  engineer: "neutral",
  billing: "neutral",
  viewer: "neutral",
} as const;

export default async function SettingsPage() {
  const cv = getClient();
  const [org, users, projects, sshKeys] = await Promise.all([
    cv.getOrganization(),
    cv.listUsers(),
    cv.listProjects(),
    cv.listSshKeys(),
  ]);

  return (
    <>
      <PortalPageHeader
        title="settings"
        description="Organisation, projects, team and access keys."
      />

      <section>
        <h2 className="mb-3 font-mono text-[14px] text-ink-200">organisation</h2>
        <Card surface="panel" padding={0}>
          <dl className="grid sm:grid-cols-2">
            {[
              ["Name", org.name],
              ["Tier", org.tier],
              ["PAN / VAT", org.panNumber],
              ["Customer since", formatDate(org.createdAt)],
              [
                "Spend cap",
                org.spendCapPaisa ? formatNpr(org.spendCapPaisa, { compact: true }) : "none",
              ],
              ["Credit balance", formatNpr(org.creditBalancePaisa, { compact: true })],
            ].map(([k, v], i) => (
              <div
                key={k}
                className={`px-5 py-4 ${i >= 2 ? "border-t border-line-subtle" : ""} ${
                  i % 2 === 1 ? "sm:border-l sm:border-line-subtle" : ""
                }`}
              >
                <dt className="cv-label text-[10px]">{k}</dt>
                <dd className="mt-1.5 font-mono text-[13px] text-ink-200">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-mono text-[14px] text-ink-200">projects</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.id} surface="panel" padding={20}>
              <div className="flex items-center gap-2.5">
                <Icon name="folder" size={16} className="text-hydro" />
                <h3 className="font-mono text-[13.5px] text-ink-100">{p.name}</h3>
              </div>
              <p className="mt-2.5 font-body text-[12.5px] font-light leading-relaxed text-ink-400">
                {p.description}
              </p>
              <p className="mt-3 border-t border-line-subtle pt-3 font-mono text-[11px] text-ink-600">
                {p.vclusterId} · created {formatDate(p.createdAt)}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-mono text-[14px] text-ink-200">team</h2>
        <TableScroll minWidth="44rem">
          <thead>
            <tr>
              <Th>member</Th>
              <Th>role</Th>
              <Th>mfa</Th>
              <Th align="right">last active</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} className={i > 0 ? "border-t border-line-subtle" : ""}>
                <td className="px-4 py-3.5">
                  <div className="font-body text-[13.5px] text-ink-100">{u.name}</div>
                  <div className="mt-0.5 font-mono text-[11.5px] text-ink-600">
                    {u.email}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <Badge tone={ROLE_TONE[u.role]}>{u.role}</Badge>
                </td>
                <td className="px-4 py-3.5">
                  {u.mfaEnabled ? (
                    <span className="flex items-center gap-1.5 font-mono text-[12px] text-hydro">
                      <Icon name="check" size={13} />
                      enabled
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 font-mono text-[12px] text-warning">
                      <Icon name="warning" size={13} />
                      off
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-[11.5px] text-ink-500">
                  {formatDateTime(u.lastActiveAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </TableScroll>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-mono text-[14px] text-ink-200">ssh keys</h2>
        <Card surface="panel" padding={0}>
          {sshKeys.map((k, i) => (
            <div
              key={k.id}
              className={`flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 ${
                i > 0 ? "border-t border-line-subtle" : ""
              }`}
            >
              <Icon name="key" size={15} className="text-hydro" />
              <span className="font-mono text-[13px] text-ink-100">{k.name}</span>
              <span className="font-mono text-[11px] text-ink-600">
                {k.fingerprint.slice(0, 30)}…
              </span>
              <span className="ml-auto font-mono text-[11px] text-ink-600">
                added {formatDate(k.addedAt)}
              </span>
            </div>
          ))}
        </Card>
      </section>
    </>
  );
}
