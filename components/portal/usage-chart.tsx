/**
 * Inline SVG area chart for a usage or telemetry series.
 *
 * Server component, no charting dependency. The series is already
 * deterministic (lib/api/synthetic.ts), so the path is identical on the server
 * and after hydration.
 */
import { formatCompactNumber } from "@/lib/format";
import type { TimeSeriesPoint } from "@/lib/api/types";

export function UsageChart({
  points,
  unit,
  height = 132,
  accent = "var(--hydro)",
  label,
}: {
  points: TimeSeriesPoint[];
  unit?: string;
  height?: number;
  accent?: string;
  label?: string;
}) {
  if (points.length === 0) return null;

  const W = 600;
  const H = height;
  const pad = 4;
  const max = Math.max(...points.map((p) => p.v), 1);
  const stepX = (W - pad * 2) / Math.max(1, points.length - 1);

  const coords = points.map((p, i) => {
    const x = pad + i * stepX;
    const y = H - pad - (p.v / max) * (H - pad * 2);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const line = `M${coords.join(" L")}`;
  const area = `${line} L${(pad + (points.length - 1) * stepX).toFixed(2)},${H - pad} L${pad},${H - pad} Z`;
  const gradientId = `usage-grad-${Math.abs(
    points.length * 31 + Math.round(max),
  )}`;

  return (
    <figure>
      {label ? (
        <figcaption className="mb-3 flex items-baseline justify-between">
          <span className="cv-label text-[10px]">{label}</span>
          <span className="font-mono text-[12px] text-ink-300">
            peak {formatCompactNumber(max)}
            {unit ? ` ${unit}` : ""}
          </span>
        </figcaption>
      ) : null}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={label ? `${label} over time` : "Usage over time"}
        className="w-full"
        style={{ height }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Baseline grid: three hairlines, no axis furniture. */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={pad}
            x2={W - pad}
            y1={pad + f * (H - pad * 2)}
            y2={pad + f * (H - pad * 2)}
            stroke="var(--border-subtle)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke={accent}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </figure>
  );
}

/** Compact inline sparkline for table rows and tiles. */
export function Sparkline({
  points,
  width = 96,
  height = 26,
  accent = "var(--hydro)",
}: {
  points: TimeSeriesPoint[];
  width?: number;
  height?: number;
  accent?: string;
}) {
  if (points.length === 0) return null;
  const max = Math.max(...points.map((p) => p.v), 1);
  const stepX = width / Math.max(1, points.length - 1);
  const d = points
    .map((p, i) => {
      const x = i * stepX;
      const y = height - (p.v / max) * (height - 2) - 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} aria-hidden="true" className="block">
      <path
        d={d}
        fill="none"
        stroke={accent}
        strokeWidth="1.25"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
