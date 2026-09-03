"use client";

/**
 * Hero backdrop: layered snow-capped mountains under a neural particle field,
 * reacting to the pointer.
 *
 * WHY THE PREVIOUS VERSION READ AS WIREFRAME, not mountains:
 *
 *  1. The silhouette fills were rgba(6,9,15,0.9) against a #05080D sky —
 *     effectively the same colour. Only the crest strokes rendered, so the
 *     range looked like jagged lines drawn on black. Mountains are MASSES:
 *     they need a fill that differs in value from the sky.
 *  2. Frequency was far too high (5-11 cycles over 5 octaves), producing a
 *     dense sawtooth like an audio waveform rather than a few big landforms.
 *  3. There was no horizon light, so a dark near-ridge had nothing to be
 *     silhouetted against.
 *
 * The fix is how landscape painters do it: a lit horizon, then layers running
 * from hazy-light at the back to near-black at the front (aerial perspective),
 * each a solid gradient-filled mass. Skylines come from a handful of PLACED
 * peaks rather than octaves of noise, so each layer has a few dominant
 * landforms with smaller ones between — which is what a real range looks like.
 */
import * as React from "react";

const HYDRO = { r: 74, g: 222, b: 128 };
const INFO = { r: 56, g: 189, b: 248 };
/** Snow is Ink, not pure white — pure white on Carbon reads as blown out. */
const SNOW = { r: 247, g: 249, b: 250 };

function rgba(c: { r: number; g: number; b: number }, a: number) {
  return `rgba(${c.r},${c.g},${c.b},${a})`;
}

/** Deterministic hash. Same seed, same range, every render. */
function hash(n: number, seed: number): number {
  let t = (n + seed) * 374761393;
  t = (t ^ (t >>> 13)) * 1274126177;
  return ((t ^ (t >>> 16)) >>> 0) / 4294967296;
}

function valueNoise(x: number, seed: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(i, seed) * (1 - u) + hash(i + 1, seed) * u;
}

/** Low-amplitude texture for the flanks. Deliberately gentle — this is
 *  surface detail, not the skyline itself. */
function detailNoise(x: number, seed: number): number {
  return (
    valueNoise(x * 3.1, seed) * 0.6 +
    valueNoise(x * 7.3, seed + 57) * 0.28 +
    valueNoise(x * 15.7, seed + 113) * 0.12
  );
}

/** One placed landform. */
interface Peak {
  centre: number;
  halfWidth: number;
  height: number;
  /** <1 bulges the flanks outward, >1 pulls them in to a spire. */
  sharpness: number;
  /** -1..1, shifts the apex left or right so peaks are not symmetrical. */
  skew: number;
}

/**
 * Place `count` peaks across 0..1 with jittered spacing. Placement beats
 * summed octaves here: it guarantees a few dominant summits with clear space
 * between them, which is exactly what the noise version failed to produce.
 */
function placePeaks(
  seed: number,
  count: number,
  minH: number,
  maxH: number,
  width: number,
): Peak[] {
  const peaks: Peak[] = [];
  for (let i = 0; i < count; i++) {
    const slot = (i + 0.5) / count;
    const jitter = (hash(i * 3, seed) - 0.5) * (0.85 / count);
    peaks.push({
      centre: slot + jitter,
      halfWidth: width * (0.7 + hash(i * 5, seed + 11) * 0.6),
      height: minH + hash(i * 7, seed + 23) * (maxH - minH),
      sharpness: 0.95 + hash(i * 11, seed + 37) * 0.5,
      skew: (hash(i * 13, seed + 51) - 0.5) * 0.7,
    });
  }
  return peaks;
}

function peakValue(t: number, p: Peak): number {
  const d = (t - p.centre) / p.halfWidth;
  if (d <= -1 || d >= 1) return 0;
  // Skew moves the apex without breaking the footprint.
  const s = d < 0 ? d / (1 - p.skew * 0.5) : d / (1 + p.skew * 0.5);
  const a = Math.min(1, Math.abs(s));
  return p.height * Math.pow(1 - a, p.sharpness);
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  accent: boolean;
}

interface Layer {
  points: { x: number; y: number }[];
  /** Canvas y above which the layer is snow-covered. */
  snowlineY: number;
  /** Highest point, for gradient anchoring. */
  topY: number;
  baseY: number;
  parallax: number;
  fillTop: string;
  fillBottom: string;
  snowAlpha: number;
  rimAlpha: number;
}

export function HeroCanvas({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const interactive = finePointer && !reduceMotion;

    let width = 0;
    let height = 0;
    let horizonY = 0;
    let layers: Layer[] = [];
    let particles: Particle[] = [];
    let raf = 0;
    let running = false;

    let pointerX = -9999;
    let pointerY = -9999;
    let smoothX = -9999;
    let smoothY = -9999;
    let pointerInside = false;

    function buildLayer(opts: {
      seed: number;
      baseline: number;
      relief: number;
      majorCount: number;
      minorCount: number;
      majorWidth: number;
      detailAmount: number;
      snowFraction: number;
      fillTop: string;
      fillBottom: string;
      snowAlpha: number;
      rimAlpha: number;
      parallax: number;
    }): Layer {
      const major = placePeaks(
        opts.seed,
        opts.majorCount,
        0.62,
        1,
        opts.majorWidth,
      );
      // Smaller shoulders between the summits, so the skyline is not a row of
      // identical triangles.
      const minor = placePeaks(
        opts.seed + 977,
        opts.minorCount,
        0.2,
        0.52,
        opts.majorWidth * 0.45,
      );

      const step = 2;
      const count = Math.ceil(width / step) + 1;
      const points: { x: number; y: number }[] = [];
      let topY = Infinity;

      for (let i = 0; i < count; i++) {
        const x = i * step;
        const t = x / Math.max(1, width);

        let e = 0;
        for (const p of major) e = Math.max(e, peakValue(t, p));
        for (const p of minor) e = Math.max(e, peakValue(t, p));

        // Surface texture, faded out toward the base so foothills stay clean.
        e += (detailNoise(t, opts.seed) - 0.5) * opts.detailAmount * e;
        e = Math.max(0, e);

        const y = opts.baseline - e * opts.relief;
        if (y < topY) topY = y;
        points.push({ x, y });
      }

      return {
        points,
        topY,
        baseY: opts.baseline,
        snowlineY: topY + (opts.baseline - topY) * opts.snowFraction,
        parallax: opts.parallax,
        fillTop: opts.fillTop,
        fillBottom: opts.fillBottom,
        snowAlpha: opts.snowAlpha,
        rimAlpha: opts.rimAlpha,
      };
    }

    function build() {
      const rect = canvas!.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      horizonY = height * 0.78;

      // Aerial perspective: hazy and light at the back, near-black at the
      // front. This value separation is what makes them read as solid masses.
      layers = [
        buildLayer({
          seed: 9311,
          baseline: height * 0.9,
          relief: height * 0.34,
          majorCount: 4,
          minorCount: 7,
          majorWidth: 0.17,
          detailAmount: 0.1,
          snowFraction: 0.34,
          fillTop: "#202c3c",
          fillBottom: "#151f2d",
          snowAlpha: 0.5,
          rimAlpha: 0.2,
          parallax: 5,
        }),
        buildLayer({
          seed: 4177,
          baseline: height * 1.0,
          relief: height * 0.46,
          majorCount: 3,
          minorCount: 5,
          majorWidth: 0.21,
          detailAmount: 0.13,
          snowFraction: 0.3,
          fillTop: "#16212f",
          fillBottom: "#0c1420",
          snowAlpha: 0.82,
          rimAlpha: 0.34,
          parallax: 13,
        }),
        buildLayer({
          seed: 2087,
          baseline: height * 1.16,
          relief: height * 0.36,
          majorCount: 2,
          minorCount: 4,
          majorWidth: 0.3,
          detailAmount: 0.16,
          snowFraction: 0.16,
          fillTop: "#080d15",
          fillBottom: "#04070c",
          snowAlpha: 0.22,
          rimAlpha: 0.42,
          parallax: 24,
        }),
      ];

      const target = width < 700 ? 24 : width < 1200 ? 40 : 58;
      particles = Array.from({ length: target }, (_, i) => {
        const a = hash(i * 7, 4211);
        const b = hash(i * 13, 8821);
        const c = hash(i * 19, 1559);
        return {
          x: a * width,
          y: b * height * 0.52,
          vx: (c - 0.5) * 0.13,
          vy: (a - 0.5) * 0.08,
          accent: i % 9 === 0,
        };
      });
    }

    function drawSky() {
      // A lit horizon. Without it the front ridge is black on black and the
      // whole range loses its silhouette.
      const glow = ctx!.createLinearGradient(0, horizonY - height * 0.42, 0, horizonY);
      glow.addColorStop(0, "rgba(20,32,44,0)");
      glow.addColorStop(0.62, "rgba(22,38,50,0.4)");
      glow.addColorStop(1, "rgba(30,52,64,0.62)");
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, horizonY - height * 0.42, width, height * 0.42);

      // A cool Hydro wash just above the ridgeline — the brand's only glow.
      const hydroGlow = ctx!.createRadialGradient(
        width * 0.46,
        horizonY,
        0,
        width * 0.46,
        horizonY,
        width * 0.55,
      );
      hydroGlow.addColorStop(0, rgba(HYDRO, 0.11));
      hydroGlow.addColorStop(0.45, rgba(HYDRO, 0.035));
      hydroGlow.addColorStop(1, rgba(HYDRO, 0));
      ctx!.fillStyle = hydroGlow;
      ctx!.fillRect(0, 0, width, height);
    }

    function drawLayer(layer: Layer, dx: number) {
      const pts = layer.points;
      if (pts.length < 2) return;

      ctx!.save();
      ctx!.translate(dx, 0);

      // Silhouette as a solid mass with a vertical gradient: lighter at the
      // ridge, darker at the base. The gradient is what gives it volume.
      ctx!.beginPath();
      ctx!.moveTo(pts[0]!.x - 60, height + 60);
      for (const p of pts) ctx!.lineTo(p.x, p.y);
      ctx!.lineTo(pts[pts.length - 1]!.x + 60, height + 60);
      ctx!.closePath();

      const body = ctx!.createLinearGradient(0, layer.topY, 0, layer.baseY);
      body.addColorStop(0, layer.fillTop);
      body.addColorStop(1, layer.fillBottom);
      ctx!.fillStyle = body;
      ctx!.fill();

      // Snow. Clip to the mass, then lay a bright wash from the summits down
      // to the snowline — so each cap takes the exact shape of its own peak.
      ctx!.save();
      ctx!.clip();
      const snow = ctx!.createLinearGradient(0, layer.topY, 0, layer.snowlineY);
      snow.addColorStop(0, rgba(SNOW, layer.snowAlpha));
      snow.addColorStop(0.4, rgba(SNOW, layer.snowAlpha * 0.72));
      snow.addColorStop(0.78, rgba(SNOW, layer.snowAlpha * 0.22));
      snow.addColorStop(1, rgba(SNOW, 0));
      ctx!.fillStyle = snow;
      ctx!.fillRect(
        -80,
        layer.topY - 20,
        width + 160,
        layer.snowlineY - layer.topY + 20,
      );
      ctx!.restore();

      // Rim light along the crest: bright on snow, a whisper of Hydro below.
      ctx!.lineJoin = "round";
      ctx!.lineCap = "round";
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1]!;
        const b = pts[i]!;
        const snowy = a.y < layer.snowlineY && b.y < layer.snowlineY;
        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);
        ctx!.strokeStyle = snowy
          ? rgba(SNOW, Math.min(0.9, layer.rimAlpha * 2.2))
          : rgba(HYDRO, layer.rimAlpha * 0.35);
        ctx!.lineWidth = snowy ? 1.4 : 1;
        ctx!.stroke();
      }

      ctx!.restore();
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      drawSky();

      if (interactive && pointerInside) {
        const r = Math.min(width, height) * 0.34;
        const g = ctx!.createRadialGradient(smoothX, smoothY, 0, smoothX, smoothY, r);
        g.addColorStop(0, rgba(HYDRO, 0.09));
        g.addColorStop(0.5, rgba(HYDRO, 0.03));
        g.addColorStop(1, rgba(HYDRO, 0));
        ctx!.fillStyle = g;
        ctx!.fillRect(0, 0, width, height);
      }

      // Particle field, above the range where the headline sits.
      const linkDistance = width < 700 ? 110 : 155;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]!;
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist > linkDistance) continue;
          ctx!.strokeStyle = rgba(HYDRO, (1 - dist / linkDistance) * 0.12);
          ctx!.lineWidth = 0.6;
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(q.x, q.y);
          ctx!.stroke();
        }
      }
      for (const p of particles) {
        const near =
          interactive && pointerInside
            ? Math.max(0, 1 - Math.hypot(p.x - smoothX, p.y - smoothY) / 190)
            : 0;
        const c = p.accent ? INFO : HYDRO;
        ctx!.fillStyle = rgba(c, (p.accent ? 0.5 : 0.3) + near * 0.45);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, (p.accent ? 1.7 : 1.2) + near * 1.1, 0, Math.PI * 2);
        ctx!.fill();
      }

      const px = interactive && pointerInside ? smoothX / width - 0.5 : 0;
      for (const layer of layers) drawLayer(layer, -px * layer.parallax);

      // Scrim: keeps headline copy above AA contrast over the range.
      const scrim = ctx!.createLinearGradient(0, 0, 0, height);
      scrim.addColorStop(0, "rgba(5,8,13,0.66)");
      scrim.addColorStop(0.46, "rgba(5,8,13,0.2)");
      scrim.addColorStop(1, "rgba(5,8,13,0.55)");
      ctx!.fillStyle = scrim;
      ctx!.fillRect(0, 0, width, height);
    }

    function step() {
      if (interactive) {
        if (smoothX < -1000) {
          smoothX = pointerX;
          smoothY = pointerY;
        } else {
          smoothX += (pointerX - smoothX) * 0.07;
          smoothY += (pointerY - smoothY) * 0.07;
        }
      }

      const ceiling = height * 0.52;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (interactive && pointerInside) {
          const dx = p.x - smoothX;
          const dy = p.y - smoothY;
          const d = Math.hypot(dx, dy);
          if (d < 130 && d > 0.01) {
            const push = ((130 - d) / 130) * 0.55;
            p.x += (dx / d) * push;
            p.y += (dy / d) * push;
          }
        }

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = ceiling;
        if (p.y > ceiling + 10) p.y = -10;
      }

      draw();
      raf = requestAnimationFrame(step);
    }

    function play() {
      if (running || reduceMotion) return;
      running = true;
      raf = requestAnimationFrame(step);
    }

    function pause() {
      running = false;
      cancelAnimationFrame(raf);
    }

    build();
    draw();

    const ro = new ResizeObserver(() => {
      build();
      draw();
    });
    ro.observe(canvas);

    if (reduceMotion) {
      // One static frame; the loop never starts.
      return () => ro.disconnect();
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) play();
        else pause();
      },
      { threshold: 0.01 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) pause();
      else play();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // The canvas lives in a -z-10 wrapper behind the content, so pointer
    // events over the headline never reach it. Track on the hero section.
    const host: HTMLElement =
      canvas.closest("section") ?? canvas.parentElement ?? canvas;
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = e.clientX - rect.left;
      pointerY = e.clientY - rect.top;
      pointerInside = true;
    };
    const onPointerLeave = () => {
      pointerInside = false;
    };
    if (interactive) {
      host.addEventListener("pointermove", onPointerMove, { passive: true });
      host.addEventListener("pointerleave", onPointerLeave, { passive: true });
    }

    return () => {
      pause();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (interactive) {
        host.removeEventListener("pointermove", onPointerMove);
        host.removeEventListener("pointerleave", onPointerLeave);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
