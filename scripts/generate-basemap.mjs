/**
 * Generates lib/mesh-basemap.ts from Natural Earth data (via world-atlas).
 *
 * Run:  node scripts/generate-basemap.mjs
 *
 * Output is a set of SVG path strings already projected into a unit box, so
 * the runtime needs no geo dependency at all — it just scales the unit box to
 * the canvas. Node markers use the same projection, so cities always land on
 * the right piece of coastline.
 *
 * Re-run this only if the window or the source data changes; the generated
 * file is committed.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { feature } from "topojson-client";

/** Geographic window: Dubai in the west to Singapore in the east. */
const BBOX = { lonMin: 45, lonMax: 112, latMin: -5, latMax: 42 };

/**
 * Equirectangular with a cos(centre latitude) correction on longitude, so the
 * region does not look horizontally stretched. Good enough for a regional
 * backdrop and far cheaper than carrying a projection library at runtime.
 */
const CENTRE_LAT = (BBOX.latMin + BBOX.latMax) / 2;
const LON_SCALE = Math.cos((CENTRE_LAT * Math.PI) / 180);

const spanX = (BBOX.lonMax - BBOX.lonMin) * LON_SCALE;
const spanY = BBOX.latMax - BBOX.latMin;

/** Project lon/lat into a 0..1 unit box (y down). */
function project(lon, lat) {
  const x = ((lon - BBOX.lonMin) * LON_SCALE) / spanX;
  const y = (BBOX.latMax - lat) / spanY;
  return [x, y];
}

/** Generous margin so coastlines run past the frame instead of stopping. */
const PAD = 0.12;
const inWindow = ([x, y]) => x > -PAD && x < 1 + PAD && y > -PAD && y < 1 + PAD;

/** Drop points closer than epsilon to the previous kept point. */
function decimate(points, epsilon) {
  if (points.length < 3) return points;
  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const q = out[out.length - 1];
    if (Math.hypot(p[0] - q[0], p[1] - q[1]) >= epsilon) out.push(p);
  }
  out.push(points[points.length - 1]);
  return out;
}

/**
 * Clip a ring to the window and emit the inside runs as OPEN polylines.
 *
 * Whole rings are unusable here: China and Russia each pass through the window
 * but carry thousands of points spanning the globe, which is what made the
 * first pass 400 KB. Borders are stroked, never filled, so open runs are all
 * we need.
 */
function ringToPaths(ring, epsilon) {
  const projected = ring.map(([lon, lat]) => project(lon, lat));
  const runs = [];
  let run = [];
  for (let i = 0; i < projected.length; i++) {
    const p = projected[i];
    if (inWindow(p)) {
      run.push(p);
    } else {
      // Keep one point past the edge so the line exits the frame cleanly.
      if (run.length > 0) {
        run.push(p);
        runs.push(run);
        run = [];
      }
    }
  }
  if (run.length > 0) runs.push(run);

  const out = [];
  for (const r of runs) {
    const pts = decimate(r, epsilon);
    if (pts.length < 2) continue;
    out.push(
      pts
        .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(3)},${y.toFixed(3)}`)
        .join(""),
    );
  }
  return out;
}

function collectPaths(geometry, epsilon) {
  const paths = [];
  const push = (polygon) => {
    for (const ring of polygon) paths.push(...ringToPaths(ring, epsilon));
  };
  if (geometry.type === "Polygon") push(geometry.coordinates);
  else if (geometry.type === "MultiPolygon") geometry.coordinates.forEach(push);
  return paths;
}

const topo = JSON.parse(
  readFileSync("node_modules/world-atlas/countries-110m.json", "utf8"),
);
const geo = feature(topo, topo.objects.countries);

// ~0.3% of the window width: a subdued backdrop, not a detail map.
const EPSILON = 0.003;

const countryPaths = [];
for (const f of geo.features) {
  if (!f.geometry) continue;
  countryPaths.push(...collectPaths(f.geometry, EPSILON));
}

const banner = `/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with:  node scripts/generate-basemap.mjs
 *
 * Country outlines from Natural Earth (public domain) via the world-atlas
 * package, clipped to the South Asia window and projected into a 0..1 unit
 * box. The runtime carries no geo dependency: it scales this unit box onto
 * the canvas and projects city coordinates through the same maths.
 */`;

const out = `${banner}

/** Geographic window covered by the basemap. */
export const BASEMAP_BBOX = {
  lonMin: ${BBOX.lonMin},
  lonMax: ${BBOX.lonMax},
  latMin: ${BBOX.latMin},
  latMax: ${BBOX.latMax},
} as const;

/** cos(centre latitude): stops the region looking horizontally stretched. */
export const BASEMAP_LON_SCALE = ${LON_SCALE.toFixed(6)};

/** Aspect ratio (width / height) of the projected window. */
export const BASEMAP_ASPECT = ${(spanX / spanY).toFixed(6)};

/** Project a coordinate into the same 0..1 unit box as the paths below. */
export function projectToUnit(lon: number, lat: number): { u: number; v: number } {
  const spanX = (BASEMAP_BBOX.lonMax - BASEMAP_BBOX.lonMin) * BASEMAP_LON_SCALE;
  const spanY = BASEMAP_BBOX.latMax - BASEMAP_BBOX.latMin;
  return {
    u: ((lon - BASEMAP_BBOX.lonMin) * BASEMAP_LON_SCALE) / spanX,
    v: (BASEMAP_BBOX.latMax - lat) / spanY,
  };
}

/** Country border polylines (open, stroked) in unit space. */
export const BASEMAP_PATHS: readonly string[] = ${JSON.stringify(countryPaths, null, 0).replace(/","/g, '",\n  "').replace(/^\[/, "[\n  ").replace(/\]$/, ",\n]")};
`;

mkdirSync("lib", { recursive: true });
writeFileSync("lib/mesh-basemap.ts", out);

const bytes = Buffer.byteLength(out);
console.log(`rings kept : ${countryPaths.length}`);
console.log(`output     : lib/mesh-basemap.ts (${(bytes / 1024).toFixed(1)} KB)`);
console.log(`aspect     : ${(spanX / spanY).toFixed(3)}`);
