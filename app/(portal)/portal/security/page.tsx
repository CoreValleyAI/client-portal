import { Badge, Card, Icon } from "@/components/ui";
import {
  MetricTile,
  PortalPageHeader,
  TableScroll,
  Th,
} from "@/components/portal/primitives";
import { getClient } from "@/lib/api/client";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Security" };

const CONTROL_TONE = {
  implemented: "success",
  "in-progress": "warning",
  planned: "neutral",
} as const;

const CERT_TONE = {
  valid: "success",
  renewing: "info",
  "expiring-soon": "warning",
  expired: "danger",
} as const;

export default async function SecurityPage() {
  const cv = getClient();
  const [compliance, certificates, policies] = await Promise.all([
    cv.getComplianceState(),
    cv.listCertificates(),
    cv.listNetworkPolicies(),
  ]);

  const byCategory = compliance.controls.reduce<
    Record<string, typeof compliance.controls>
  >((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {});

  return (
    <>
      <PortalPageHeader
        title="security"
        description="Control posture, certificate status and tenant network isolation for this organisation."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="framework"
          value={compliance.framework}
          sub={`reviewed ${formatDate(compliance.lastReviewedAt)}`}
        />
        <MetricTile
          label="controls implemented"
          value={`${compliance.implementedCount} / ${compliance.totalCount}`}
          sub="design-stage evidence"
          accent
        />
        <MetricTile
          label="certificates"
          value={certificates.length}
          sub="all auto-renewing"
        />
        <MetricTile
          label="isolated vclusters"
          value={policies.length}
          sub="cilium enforced"
        />
      </div>

      {/* The framework claim is easy to overstate. State the limit plainly. */}
      <Card surface="panel" padding={20} className="mt-3">
        <div className="flex items-start gap-3">
          <Icon name="info" size={18} weight="duotone" className="mt-0.5 shrink-0 text-info" />
          <div>
            <p className="font-body text-[13.5px] font-semibold text-ink-200">
              What this attests to
            </p>
            <p className="mt-1.5 font-body text-[13px] font-light leading-relaxed text-ink-400">
              {compliance.posture}
            </p>
            <p className="mt-2.5 font-mono text-[12px] text-hydro">
              {compliance.dataResidency}
            </p>
          </div>
        </div>
      </Card>

      <section className="mt-8">
        <h2 className="mb-3 font-mono text-[14px] text-ink-200">controls</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(byCategory).map(([category, controls]) => (
            <Card key={category} surface="panel" padding={0}>
              <p className="cv-label border-b border-line-subtle px-5 py-3 text-[10px]">
                {category}
              </p>
              <ul>
                {controls.map((c, i) => (
                  <li
                    key={c.id}
                    className={`px-5 py-3.5 ${i > 0 ? "border-t border-line-subtle" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-body text-[13.5px] text-ink-200">
                        {c.name}
                      </span>
                      <Badge tone={CONTROL_TONE[c.status]}>{c.status}</Badge>
                    </div>
                    <p className="mt-1.5 font-body text-[12.5px] font-light leading-relaxed text-ink-500">
                      {c.evidence}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-mono text-[14px] text-ink-200">
          tls certificates
        </h2>
        <TableScroll minWidth="44rem">
          <thead>
            <tr>
              <Th>common name</Th>
              <Th>issuer</Th>
              <Th>issued</Th>
              <Th>expires</Th>
              <Th align="right">status</Th>
            </tr>
          </thead>
          <tbody>
            {certificates.map((c, i) => (
              <tr key={c.id} className={i > 0 ? "border-t border-line-subtle" : ""}>
                <td className="px-4 py-3.5 font-mono text-[12.5px] text-ink-100">
                  {c.commonName}
                </td>
                <td className="px-4 py-3.5 font-body text-[13px] font-light text-ink-400">
                  {c.issuer}
                </td>
                <td className="px-4 py-3.5 font-mono text-[11.5px] text-ink-500">
                  {formatDate(c.issuedAt)}
                </td>
                <td className="px-4 py-3.5 font-mono text-[11.5px] text-ink-500">
                  {formatDate(c.expiresAt)}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Badge tone={CERT_TONE[c.status]}>{c.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </TableScroll>
        <p className="mt-3 font-body text-[12.5px] font-light text-ink-500">
          Issuance and renewal are automated. No certificate has ever been
          renewed by hand, which is the point.
        </p>
      </section>
    </>
  );
}
