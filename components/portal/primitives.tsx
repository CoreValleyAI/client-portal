/**
 * Small shared portal pieces: status pills, meters, page headers and the
 * placeholder-pricing badge. Server components — none of them hold state.
 */
import { Badge, Card, Icon } from "@/components/ui";
import { CATALOG } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { PodStatus } from "@/lib/api/types";

/* ── Status ───────────────────────────────────────────────────────────── */

const POD_TONE: Record<PodStatus, { tone: "success" | "info" | "neutral" | "danger" | "warning"; dot: boolean }> = {
  running: { tone: "success", dot: true },
  queued: { tone: "info", dot: true },
  provisioning: { tone: "info", dot: true },
  "pulling-image": { tone: "info", dot: true },
  stopping: { tone: "warning", dot: true },
  stopped: { tone: "neutral", dot: false },
  failed: { tone: "danger", dot: false },
  terminated: { tone: "neutral", dot: false },
};

export function PodStatusPill({ status }: { status: PodStatus }) {
  const s = POD_TONE[status];
  return (
    <Badge tone={s.tone} dot={s.dot}>
      {status}
    </Badge>
  );
}

/** Thin utilisation meter. Glows above 60% like the design-system original. */
export function UtilBar({ value, width = 64 }: { value: number; width?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-[5px] overflow-hidden rounded-pill bg-carbon-500"
        style={{ width }}
      >
        <div
          className={cn(
            "h-full rounded-pill",
            value > 0 ? "bg-hydro" : "bg-transparent",
            value > 60 && "shadow-[0_0_8px_rgba(74,222,128,0.5)]",
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="w-8 font-mono text-[11px] text-fg-muted">{value}%</span>
    </div>
  );
}

/* ── Layout ───────────────────────────────────────────────────────────── */

export function PortalPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-mono text-[17px] font-medium lowercase text-ink-100">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl font-body text-[13.5px] font-light leading-relaxed text-ink-400">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </div>
  );
}

export function MetricTile({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Card surface="panel" padding={18}>
      <p className="cv-label text-[10px]">{label}</p>
      <p
        className={cn(
          "mt-2.5 font-mono text-[26px] leading-none font-medium tracking-tight",
          accent ? "text-hydro" : "text-ink-100",
        )}
      >
        {value}
      </p>
      {sub ? (
        <p className="mt-2 font-body text-[12px] font-light text-ink-500">{sub}</p>
      ) : null}
    </Card>
  );
}

/** Rendered wherever a figure derives from placeholder catalogue rates. */
export function PlaceholderPricingBadge({ className }: { className?: string }) {
  if (!CATALOG.meta.pricingIsPlaceholder) return null;
  return (
    <span
      title={CATALOG.meta.notice}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-warning/30 bg-warning/8 px-2 py-1 font-mono text-[10px] tracking-wide text-warning",
        className,
      )}
    >
      <Icon name="warning" size={11} weight="fill" />
      indicative pricing
    </span>
  );
}

export function EmptyState({
  icon = "package",
  title,
  body,
  action,
}: {
  icon?: React.ComponentProps<typeof Icon>["name"];
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <Card surface="panel" padding={0}>
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <Icon name={icon} size={28} className="text-ink-600" />
        <p className="font-mono text-sm text-ink-300">{title}</p>
        <p className="max-w-sm font-body text-[13px] font-light text-ink-500">
          {body}
        </p>
        {action ? <div className="mt-2">{action}</div> : null}
      </div>
    </Card>
  );
}

/** Horizontal-scrolling wrapper so dense tables never break the page layout. */
export function TableScroll({
  children,
  minWidth = "48rem",
}: {
  children: React.ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-collapse" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  align = "left",
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={cn(
        "cv-label bg-carbon-800/60 px-4 py-3 text-[10px]",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      {children}
    </th>
  );
}
