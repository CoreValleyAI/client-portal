import { Badge, Card, Icon } from "@/components/ui";
import {
  PortalPageHeader,
  TableScroll,
  Th,
} from "@/components/portal/primitives";
import { getClient } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "API keys" };

export default async function KeysPage() {
  const cv = getClient();
  const [keys, endpoints] = await Promise.all([
    cv.listApiKeys(),
    cv.listModelEndpoints(),
  ]);

  return (
    <>
      <PortalPageHeader
        title="api keys"
        description="Keys authenticate against the model endpoints and the control-plane API. The secret is shown once at creation and never again."
      />

      <Card surface="panel" padding={18} className="mb-5">
        <div className="flex items-start gap-3">
          <Icon name="lock" size={17} weight="duotone" className="mt-0.5 shrink-0 text-info" />
          <p className="font-body text-[13px] font-light leading-relaxed text-ink-400">
            Scope each key to the endpoints it actually needs. Rotating a key
            issues a new secret while the old one keeps working until you
            revoke it, so a deploy never has to race a credential change.
          </p>
        </div>
      </Card>

      <TableScroll minWidth="52rem">
        <thead>
          <tr>
            <Th>name</Th>
            <Th>key</Th>
            <Th>scope</Th>
            <Th>created</Th>
            <Th>last used</Th>
            <Th align="right">status</Th>
          </tr>
        </thead>
        <tbody>
          {keys.map((k, i) => (
            <tr key={k.id} className={i > 0 ? "border-t border-line-subtle" : ""}>
              <td className="px-4 py-3.5 font-mono text-[13px] text-ink-100">
                {k.name}
              </td>
              <td className="px-4 py-3.5">
                <span className="font-mono text-[12.5px] text-ink-400">
                  {k.prefix}
                  <span className="text-ink-700">••••••••••••</span>
                </span>
              </td>
              <td className="px-4 py-3.5">
                {k.scopedEndpointIds.length === 0 ? (
                  <span className="font-mono text-[12px] text-ink-500">
                    all endpoints
                  </span>
                ) : (
                  <span className="flex flex-wrap gap-1.5">
                    {k.scopedEndpointIds.map((id) => (
                      <span
                        key={id}
                        className="rounded-sm border border-line bg-carbon-600/60 px-2 py-0.5 font-mono text-[10.5px] text-ink-300"
                      >
                        {endpoints.find((e) => e.id === id)?.displayName ?? id}
                      </span>
                    ))}
                  </span>
                )}
              </td>
              <td className="px-4 py-3.5 font-mono text-[12px] text-ink-500">
                {formatDateTime(k.createdAt)}
              </td>
              <td className="px-4 py-3.5 font-mono text-[12px] text-ink-500">
                {k.lastUsedAt ? formatDateTime(k.lastUsedAt) : "never"}
              </td>
              <td className="px-4 py-3.5 text-right">
                {k.revoked ? (
                  <Badge tone="danger">revoked</Badge>
                ) : (
                  <Badge tone="success" dot>
                    active
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </TableScroll>
    </>
  );
}
