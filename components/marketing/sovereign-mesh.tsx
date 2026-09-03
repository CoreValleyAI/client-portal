"use client";

/**
 * The Kathmandu Sovereign Latency & Token Mesh.
 *
 * A real regional basemap (Natural Earth, generated into lib/mesh-basemap.ts)
 * with cities plotted at their true coordinates and glowing links pulsing out
 * from the Kathmandu core.
 *
 * Geometry note: an earlier version placed nodes on a radial latency scale.
 * That piled four regional tiers on top of one another at 22-38% of the radius
 * while US-East sat alone at 100% — the "jumbled" layout. Position is now
 * purely geographic; the metric is carried by the label, the particle speed
 * and the curve opacity instead.
 *
 * Architecture: the canvas draws the basemap, graticule, links and packets.
 * Every interactive node is a real HTML <button> positioned over it, so the
 * graphic is keyboard navigable and screen-reader legible. Positions are held
 * in one state object written on resize, not per frame.
 *
 * No framer-motion or lucide-react: neither is in package.json, and this sits
 * on the LCP-critical homepage. Animation is canvas plus CSS; the three icons
 * are imported directly from Phosphor rather than through the shared <Icon>
 * barrel, which would ship all ~65 registered glyphs to the browser.
 */
import * as React from "react";
import { Heartbeat, Warning } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { BASEMAP_ASPECT, BASEMAP_PATHS, projectToUnit } from "@/lib/mesh-basemap";
import {
  CORE_ENDPOINTS,
  CORE_NODE,
  MESH_DISCLOSURE,
  MESH_NODES,
  MESH_TAGLINE,
  OFF_MAP_ANCHOR,
  formatMetric,
  qualityScore,
  type LabelAnchor,
  type MeshMode,
  type MeshNode,
} from "@/lib/mesh-nodes";

/* ── Palette ───────────────────────────────────────────────────────────────
   Resolved from design-system tokens so the graphic cannot drift from the
   brand. --info is exactly the requested cyan (#38BDF8); --hydro (#4ADE80) and
   --danger (#F87171) are the brand's emerald and red. */
const RGB = {
  core: [74, 222, 128],
  regional: [56, 189, 248],
  hyperscaler: [248, 113, 113],
  land: [232, 236, 239],
} as const;

function rgba(c: readonly number[], a: number) {
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}

const tierRgb = (node: MeshNode) =>
  node.tier === "hyperscaler" ? RGB.hyperscaler : RGB.regional;

interface Point {
  x: number;
  y: number;
}

interface Particle {
  t: number;
  speed: number;
}

/** One drawn link: core -> a plotted city, or core -> the off-map anchor. */
interface Link {
  nodeId: string;
  target: Point;
  control: Point;
  dashed: boolean;
  particles: Particle[];
}

/** Quadratic bezier evaluation. */
function bezier(p0: Point, p1: Point, p2: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

/** Label placement per anchor, so neighbouring cities do not collide. */
const ANCHOR_CLASS: Record<LabelAnchor, string> = {
  n: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  s: "top-full left-1/2 -translate-x-1/2 mt-2",
  e: "left-full top-1/2 -translate-y-1/2 ml-2",
  w: "right-full top-1/2 -translate-y-1/2 mr-2",
  ne: "bottom-full left-full mb-1.5 ml-1",
  nw: "bottom-full right-full mb-1.5 mr-1",
  se: "top-full left-full mt-1.5 ml-1",
  sw: "top-full right-full mt-1.5 mr-1",
};

/* ── Clock ────────────────────────────────────────────────────────────────
   Rendered as a placeholder until mount: a server-rendered clock would never
   match the client's first paint and would trip a hydration error. */
function KathmanduClock() {
  const [time, setTime] = React.useState<string | null>(null);

  React.useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kathmandu",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const tick = () => setTime(formatter.format(new Date()).toUpperCase());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="flex items-center gap-2 font-mono text-[12.5px] tracking-wide text-ink-200 tabular-nums">
      <Heartbeat size={14} className="text-hydro" aria-hidden="true" />
      <time suppressHydrationWarning>{time ?? "--:--:-- --"}</time>
      <span className="text-fg-muted">NPT</span>
    </span>
  );
}

/* ── Inspection card ──────────────────────────────────────────────────────*/

function NodeCard({ node, mode }: { node: MeshNode; mode: MeshMode }) {
  const isHyperscaler = node.tier === "hyperscaler";
  const localValue = isHyperscaler
    ? "—"
    : mode === "latency"
      ? `${node.latencyMs} ms`
      : `${node.tokensPerSecond} tok/s`;
  const usValue =
    mode === "latency"
      ? `${node.usCloudLatencyMs} ms`
      : `${node.usCloudTokensPerSecond} tok/s`;

  return (
    <div className="glass-modal w-60 rounded-lg p-4 text-left xl:w-[16.5rem]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[13px] text-ink-100">{node.label}</p>
          <p className="mt-0.5 font-body text-[11.5px] font-light text-ink-500">
            {node.region}
          </p>
        </div>
        <span
          className="mt-1 size-2 shrink-0 rounded-pill"
          style={{
            background: rgba(tierRgb(node), 1),
            boxShadow: `0 0 8px ${rgba(tierRgb(node), 0.8)}`,
          }}
        />
      </div>

      <dl className="mt-3.5 grid grid-cols-2 gap-2 border-t border-line-subtle pt-3.5">
        <div>
          <dt className="cv-label text-[9px]">
            {isHyperscaler ? "Not served" : "via CoreValley"}
          </dt>
          <dd
            className={cn(
              "mt-1 font-mono text-[14px]",
              isHyperscaler ? "text-ink-600" : "text-hydro",
            )}
          >
            {localValue}
          </dd>
        </div>
        <div>
          <dt className="cv-label text-[9px]">via US cloud</dt>
          <dd className="mt-1 font-mono text-[14px] text-danger">{usValue}</dd>
        </div>
      </dl>

      {node.endpoints.length > 0 ? (
        <div className="mt-3.5 border-t border-line-subtle pt-3.5">
          <p className="cv-label text-[9px]">Served locally via LiteLLM</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {node.endpoints.map((e) => (
              <li
                key={e}
                className="rounded-sm border border-line bg-carbon-600/60 px-1.5 py-0.5 font-mono text-[10px] text-ink-300"
              >
                {e}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-3.5 border-t border-line-subtle pt-3 font-body text-[11.5px] font-light leading-relaxed text-ink-400">
        {node.note}
      </p>

      {/* The in-country residency badge was removed from these cards: it lives
          in the bottom banner instead. The cross-border warning stays, because
          it is specific to this node and reverses the meaning. */}
      {isHyperscaler ? (
        <p className="mt-3 flex items-start gap-1.5 rounded-sm border border-danger/30 bg-danger/8 px-2 py-1.5 font-mono text-[9.5px] leading-snug tracking-wide text-danger">
          <Warning size={11} weight="fill" className="mt-px shrink-0" aria-hidden="true" />
          Cross-border export — data leaves Nepal
        </p>
      ) : null}
    </div>
  );
}

/* ── Component ────────────────────────────────────────────────────────────*/

export interface SovereignMeshProps {
  className?: string;
}

export function SovereignMesh({ className }: SovereignMeshProps) {
  const [mode, setMode] = React.useState<MeshMode>("latency");
  const [activeId, setActiveId] = React.useState<string | null>(null);
  /** Screen positions keyed by node id, "nodeId:cityName", and "core". */
  const [pos, setPos] = React.useState<Record<string, Point>>({});
  const [frameWidth, setFrameWidth] = React.useState(0);

  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const modeRef = React.useRef<MeshMode>(mode);
  const activeRef = React.useRef<string | null>(activeId);
  React.useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  React.useEffect(() => {
    activeRef.current = activeId;
  }, [activeId]);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Basemap geometry is static; parse the 67 path strings once.
    const mapPaths = BASEMAP_PATHS.map((d) => new Path2D(d));

    let width = 0;
    let height = 0;
    let mapW = 0;
    let mapH = 0;
    let offX = 0;
    let offY = 0;
    let core: Point = { x: 0, y: 0 };
    let links: Link[] = [];
    let raf = 0;
    let running = false;
    let lastTs = 0;

    /** Unit space (0..1 over the projected window) -> screen pixels. */
    const toScreen = (u: number, v: number): Point => ({
      x: offX + u * mapW,
      y: offY + v * mapH,
    });

    function measure() {
      const rect = wrap!.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Contain-fit the projected window so every plotted city stays visible.
      mapH = Math.min(height, width / BASEMAP_ASPECT);
      mapW = mapH * BASEMAP_ASPECT;
      offX = (width - mapW) / 2;
      offY = (height - mapH) / 2;
    }

    function layout() {
      const next: Record<string, Point> = {};

      const coreUnit = projectToUnit(CORE_NODE.longitude, CORE_NODE.latitude);
      core = toScreen(coreUnit.u, coreUnit.v);
      next.core = core;

      links = [];

      for (const node of MESH_NODES) {
        const quality = qualityScore(node, modeRef.current);
        // Fast pulses for a close, high-throughput node; a crawl for US-East.
        const speed = 0.05 + quality * 0.4;
        const targets: { p: Point; dashed: boolean }[] = [];

        if (node.cities.length === 0) {
          // Off-map hyperscaler: anchored outside the projected window, then
          // clamped inward so it never leaves the frame on narrow viewports.
          const raw = toScreen(OFF_MAP_ANCHOR.u, OFF_MAP_ANCHOR.v);
          const p = {
            x: Math.max(width * 0.08, raw.x),
            y: Math.max(height * 0.12, raw.y),
          };
          next[node.id] = p;
          targets.push({ p, dashed: true });
        } else {
          for (const city of node.cities) {
            const unit = projectToUnit(city.longitude, city.latitude);
            const p = toScreen(unit.u, unit.v);
            next[`${node.id}:${city.name}`] = p;
            if (city.primary) next[node.id] = p;
            targets.push({ p, dashed: false });
          }
        }

        for (const t of targets) {
          const dx = t.p.x - core.x;
          const dy = t.p.y - core.y;
          const len = Math.hypot(dx, dy) || 1;
          const bend = len * 0.16;
          links.push({
            nodeId: node.id,
            target: t.p,
            control: {
              x: (core.x + t.p.x) / 2 - (dy / len) * bend,
              y: (core.y + t.p.y) / 2 + (dx / len) * bend,
            },
            dashed: t.dashed,
            particles: Array.from({ length: 4 }, (_, i) => ({ t: i / 4, speed })),
          });
        }
      }

      setPos(next);
      setFrameWidth(width);
    }

    function drawGraticule() {
      ctx!.save();
      ctx!.strokeStyle = rgba(RGB.land, 0.05);
      ctx!.lineWidth = 1;
      for (let lon = 50; lon <= 110; lon += 10) {
        const x = offX + projectToUnit(lon, 0).u * mapW;
        ctx!.beginPath();
        ctx!.moveTo(x, offY);
        ctx!.lineTo(x, offY + mapH);
        ctx!.stroke();
      }
      for (let lat = 0; lat <= 40; lat += 10) {
        const y = offY + projectToUnit(0, lat).v * mapH;
        ctx!.beginPath();
        ctx!.moveTo(offX, y);
        ctx!.lineTo(offX + mapW, y);
        ctx!.stroke();
      }
      ctx!.restore();
    }

    function drawBasemap() {
      ctx!.save();
      ctx!.translate(offX, offY);
      ctx!.scale(mapW, mapH);
      // Counteract the scale so the hairline stays about 1px on screen.
      ctx!.lineWidth = 1 / Math.max(mapW, mapH);
      ctx!.strokeStyle = rgba(RGB.land, 0.2);
      ctx!.lineJoin = "round";
      ctx!.lineCap = "round";
      for (const p of mapPaths) ctx!.stroke(p);
      ctx!.restore();
    }

    function draw(dt: number) {
      ctx!.clearRect(0, 0, width, height);
      const active = activeRef.current;

      drawGraticule();
      drawBasemap();

      for (const link of links) {
        const node = MESH_NODES.find((n) => n.id === link.nodeId);
        if (!node) continue;
        const rgb = tierRgb(node);
        const isActive = active === node.id;
        const dim = active !== null && !isActive;
        const quality = qualityScore(node, modeRef.current);

        ctx!.save();
        if (link.dashed) ctx!.setLineDash([5, 5]);
        ctx!.beginPath();
        ctx!.moveTo(core.x, core.y);
        ctx!.quadraticCurveTo(
          link.control.x,
          link.control.y,
          link.target.x,
          link.target.y,
        );
        const grad = ctx!.createLinearGradient(
          core.x,
          core.y,
          link.target.x,
          link.target.y,
        );
        // A better link glows brighter — the metric, carried by the curve.
        const base = dim ? 0.09 : isActive ? 0.6 : 0.2 + quality * 0.32;
        grad.addColorStop(0, rgba(RGB.core, base));
        grad.addColorStop(1, rgba(rgb, base * 0.85));
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = isActive ? 1.7 : 1.1;
        ctx!.stroke();
        ctx!.restore();

        for (const p of link.particles) {
          if (!reduceMotion) {
            p.t += p.speed * dt;
            if (p.t > 1) p.t -= 1;
          }
          const pt = bezier(core, link.control, link.target, p.t);
          const fade = Math.sin(Math.PI * p.t);
          const alpha = (dim ? 0.16 : 0.9) * fade;
          const size = (isActive ? 2.5 : 2) * (0.6 + fade * 0.4);

          ctx!.beginPath();
          ctx!.arc(pt.x, pt.y, size, 0, Math.PI * 2);
          ctx!.fillStyle = rgba(rgb, alpha);
          ctx!.fill();

          if (!dim) {
            ctx!.beginPath();
            ctx!.arc(pt.x, pt.y, size * 3.2, 0, Math.PI * 2);
            ctx!.fillStyle = rgba(rgb, alpha * 0.12);
            ctx!.fill();
          }
        }
      }

      // Core bloom, under the HTML rings.
      const r = Math.min(mapW, mapH) * 0.22;
      const glow = ctx!.createRadialGradient(core.x, core.y, 0, core.x, core.y, r);
      glow.addColorStop(0, rgba(RGB.core, 0.22));
      glow.addColorStop(1, rgba(RGB.core, 0));
      ctx!.fillStyle = glow;
      ctx!.beginPath();
      ctx!.arc(core.x, core.y, r, 0, Math.PI * 2);
      ctx!.fill();
    }

    function frame(ts: number) {
      const dt = Math.min(0.05, lastTs ? (ts - lastTs) / 1000 : 0.016);
      lastTs = ts;
      draw(dt);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      lastTs = 0;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    measure();
    layout();
    draw(0);

    const ro = new ResizeObserver(() => {
      measure();
      layout();
      draw(0);
    });
    ro.observe(wrap);

    // Mode changes alter particle speed and curve alpha, both read live from
    // modeRef. Relayout so the speeds refresh immediately.
    const onModeChange = () => {
      layout();
      draw(0);
    };
    wrap.addEventListener("cv:mode", onModeChange);

    if (reduceMotion) {
      return () => {
        ro.disconnect();
        wrap.removeEventListener("cv:mode", onModeChange);
      };
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) start();
        else stop();
      },
      { threshold: 0.05 },
    );
    io.observe(wrap);

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      wrap.removeEventListener("cv:mode", onModeChange);
    };
  }, []);

  // Nudge the canvas layer on mode change without re-running the whole effect.
  React.useEffect(() => {
    wrapRef.current?.dispatchEvent(new CustomEvent("cv:mode"));
  }, [mode]);

  const activeNode = MESH_NODES.find((n) => n.id === activeId) ?? null;
  const corePos = pos.core;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-line bg-carbon-800/60",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-40" />

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="relative border-b border-line-subtle px-4 py-3 md:px-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <KathmanduClock />

          <span className="flex items-center gap-2 font-mono text-[12.5px] text-ink-100">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-2 animate-cursor rounded-pill bg-hydro opacity-70" />
              <span className="relative inline-flex size-2 rounded-pill bg-hydro shadow-[0_0_8px_var(--hydro)]" />
            </span>
            KATHMANDU (HQ DC)
            <span className="text-hydro">— {CORE_NODE.latencyLabel}</span>
          </span>

          <div className="ml-auto flex rounded-md border border-line bg-carbon-900/70 p-0.5">
            {(
              [
                ["latency", "Latency Matrix", "ms"],
                ["throughput", "Token Throughput", "tok/s"],
              ] as const
            ).map(([value, label, unit]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
                className={cn(
                  "cursor-pointer rounded-sm px-2.5 py-1.5 font-mono text-[11.5px] whitespace-nowrap",
                  "transition-colors duration-fast ease-standard",
                  mode === value
                    ? "bg-hydro/12 text-hydro"
                    : "text-ink-500 hover:text-ink-200",
                )}
              >
                {label}
                <span className="ml-1.5 opacity-60">({unit})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ticker — the same nodes as the map, and the same selection. */}
        <ul className="mt-3 -mb-1 flex gap-2 overflow-x-auto pb-1">
          {MESH_NODES.map((node) => {
            const on = activeId === node.id;
            const hyper = node.tier === "hyperscaler";
            return (
              <li key={node.id} className="shrink-0">
                <button
                  type="button"
                  onMouseEnter={() => setActiveId(node.id)}
                  onFocus={() => setActiveId(node.id)}
                  onClick={() => setActiveId(on ? null : node.id)}
                  aria-pressed={on}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-sm border px-2.5 py-1.5",
                    "font-mono text-[11.5px] transition-colors duration-fast ease-standard",
                    on
                      ? "border-line-strong bg-carbon-600"
                      : "border-line bg-carbon-700/70 hover:bg-carbon-600",
                  )}
                >
                  <span
                    className="size-1.5 shrink-0 rounded-pill"
                    style={{
                      background: rgba(tierRgb(node), 1),
                      boxShadow: `0 0 6px ${rgba(tierRgb(node), 0.9)}`,
                    }}
                  />
                  <span className="text-ink-300">{node.label}</span>
                  <span
                    className={cn("tabular-nums", hyper ? "text-danger" : "text-hydro")}
                  >
                    {formatMetric(node, mode)}
                  </span>
                  {hyper ? (
                    <span className="rounded-pill border border-danger/30 bg-danger/10 px-1.5 py-px text-[9px] tracking-wide text-danger">
                      High Latency / Cross-Border Export
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Map frame ───────────────────────────────────────── */}
      <div
        ref={wrapRef}
        className="relative aspect-[16/11] w-full sm:aspect-[16/9] lg:aspect-[16/8]"
        onMouseLeave={() => setActiveId(null)}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block" aria-hidden="true" />

        {/* Accessible text equivalent of the graphic. */}
        <p className="sr-only">
          Network map of South Asia centred on the Kathmandu datacentre.{" "}
          {MESH_NODES.map(
            (n) =>
              `${n.label}: ${n.latencyMs} milliseconds, ${n.tokensPerSecond} tokens per second.`,
          ).join(" ")}
        </p>

        {/* Secondary cities — plotted and lightly labelled, not hover targets. */}
        {MESH_NODES.flatMap((node) =>
          node.cities
            .filter((c) => !c.primary)
            .map((city) => {
              const p = pos[`${node.id}:${city.name}`];
              if (!p) return null;
              const on = activeId === node.id;
              return (
                <div
                  key={`${node.id}:${city.name}`}
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 left-0"
                  style={{ transform: `translate3d(${p.x}px, ${p.y}px, 0)` }}
                >
                  <span className="relative block size-0">
                    <span
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-pill transition-all duration-fast"
                      style={{
                        width: on ? 7 : 5,
                        height: on ? 7 : 5,
                        background: rgba(tierRgb(node), on ? 1 : 0.75),
                        boxShadow: `0 0 ${on ? 12 : 6}px ${rgba(tierRgb(node), on ? 0.9 : 0.45)}`,
                      }}
                    />
                    <span
                      className={cn(
                        "absolute hidden font-mono text-[9.5px] whitespace-nowrap sm:block",
                        on ? "text-ink-200" : "text-ink-500",
                        ANCHOR_CLASS[city.labelAnchor],
                      )}
                    >
                      {city.name}
                    </span>
                  </span>
                </div>
              );
            }),
        )}

        {/* Primary nodes — interactive. */}
        {MESH_NODES.map((node) => {
          const p = pos[node.id];
          if (!p) return null;
          const on = activeId === node.id;
          const hyper = node.tier === "hyperscaler";
          const primary = node.cities.find((c) => c.primary);
          const anchor: LabelAnchor = primary?.labelAnchor ?? "se";
          const cardSide = frameWidth > 0 && p.x > frameWidth / 2 ? "left" : "right";

          return (
            <div
              key={node.id}
              className="absolute top-0 left-0"
              style={{ transform: `translate3d(${p.x}px, ${p.y}px, 0)` }}
            >
              <span className="relative block size-0">
                <button
                  type="button"
                  onMouseEnter={() => setActiveId(node.id)}
                  onFocus={() => setActiveId(node.id)}
                  onClick={() => setActiveId(on ? null : node.id)}
                  aria-expanded={on}
                  aria-label={`${node.label}, ${formatMetric(node, mode)}`}
                  className={cn(
                    "absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-pill p-2.5",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hydro",
                  )}
                >
                  <span
                    className="block rounded-pill transition-all duration-fast"
                    style={{
                      width: on ? 12 : 9,
                      height: on ? 12 : 9,
                      background: rgba(tierRgb(node), 1),
                      boxShadow: `0 0 ${on ? 18 : 10}px ${rgba(tierRgb(node), on ? 0.95 : 0.7)}`,
                    }}
                  />
                </button>

                {/* Metric label, offset so neighbours do not collide. */}
                <span
                  className={cn(
                    "pointer-events-none absolute hidden items-center gap-1.5 rounded-sm border bg-carbon-900/90 px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap sm:flex",
                    on ? "border-line-strong" : "border-line",
                    ANCHOR_CLASS[anchor],
                  )}
                >
                  <span className="text-ink-300">{primary?.name ?? "US-East"}</span>
                  <span
                    className={cn("tabular-nums", hyper ? "text-danger" : "text-hydro")}
                  >
                    {formatMetric(node, mode)}
                  </span>
                </span>

                {on ? (
                  <div
                    role="tooltip"
                    className={cn(
                      "absolute top-1/2 z-20 hidden -translate-y-1/2 lg:block",
                      cardSide === "right" ? "left-5" : "right-5",
                    )}
                  >
                    <NodeCard node={node} mode={mode} />
                  </div>
                ) : null}
              </span>
            </div>
          );
        })}

        {/* Core — multi-ring H200 pulse. */}
        {corePos ? (
          <div
            className="pointer-events-none absolute top-0 left-0"
            style={{ transform: `translate3d(${corePos.x}px, ${corePos.y}px, 0)` }}
          >
            <span className="relative block size-0">
              <span className="absolute -translate-x-1/2 -translate-y-1/2">
                <span className="relative flex size-4 items-center justify-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      aria-hidden="true"
                      className="absolute size-4 rounded-pill border border-hydro motion-reduce:hidden"
                      style={{
                        animation: `cv-ring 3.4s ${i * 1.13}s cubic-bezier(0.2,0,0.2,1) infinite`,
                      }}
                    />
                  ))}
                  <span className="relative size-3 rounded-pill bg-hydro shadow-[0_0_18px_var(--hydro)]" />
                </span>
              </span>
              <span className="absolute top-4 left-1/2 -translate-x-1/2 rounded-sm border border-hydro/40 bg-carbon-900/90 px-2 py-1 text-center font-mono text-[10.5px] whitespace-nowrap text-hydro">
                {CORE_NODE.shortLabel} · {CORE_NODE.latencyLabel}
              </span>
            </span>
          </div>
        ) : null}

        {/* Legend, pinned rather than attached to the core so it never collides
            with Delhi or Thimphu. */}
        <div className="pointer-events-none absolute right-3 bottom-3 hidden rounded-md border border-line bg-carbon-900/80 px-3 py-2 sm:block">
          <p className="cv-label text-[9px]">{CORE_NODE.acceleratorPool}</p>
          <p className="mt-1 font-mono text-[10px] text-ink-400">
            {CORE_ENDPOINTS.length} models served locally
          </p>
        </div>
      </div>

      {/* ── Bottom banner ───────────────────────────────────── */}
      <div className="relative border-t border-line-subtle px-4 py-3.5 md:px-5">
        <p className="text-center font-mono text-[10.5px] tracking-label uppercase text-ink-300 sm:text-[11.5px]">
          {MESH_TAGLINE}
        </p>
        <p className="mt-1.5 text-center font-body text-[10.5px] font-light text-ink-600">
          {MESH_DISCLOSURE}
        </p>
      </div>

      {/* Detail panel below the frame, where the floating card has no room. */}
      {activeNode ? (
        <div className="border-t border-line-subtle p-4 lg:hidden">
          <NodeCard node={activeNode} mode={mode} />
        </div>
      ) : null}
    </div>
  );
}
