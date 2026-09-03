/**
 * Node model for the Kathmandu Sovereign Latency & Token Mesh.
 *
 * Cities are plotted at their real coordinates on the Natural Earth basemap
 * (see lib/mesh-basemap.ts). An earlier version placed them on a radial
 * latency scale, which piled four regional tiers on top of each other at
 * 22-38% of the radius while US-East sat alone at 100%. Radius now carries no
 * meaning: the metric lives in the label, the particle speed and the curve.
 *
 * Latency and throughput figures are ILLUSTRATIVE, matching the values agreed
 * for the marketing graphic. They are not measured SLAs — see
 * `MESH_DISCLOSURE` and keep it rendered wherever these numbers appear.
 */

export type MeshMode = "latency" | "throughput";

/** How a node relates to CoreValley's own footprint. */
export type NodeTier =
  /** The Kathmandu datacentre itself. */
  | "core"
  /** Regional peers reachable over local and regional transit. */
  | "regional"
  /** Foreign hyperscaler regions — the comparison case, not a CoreValley site. */
  | "hyperscaler";

/** Where a label sits relative to its dot, so neighbours do not collide. */
export type LabelAnchor = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export interface MeshCity {
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  /** The city carrying the tier's metric label and hover target. */
  readonly primary: boolean;
  readonly labelAnchor: LabelAnchor;
}

export interface MeshNode {
  readonly id: string;
  /** Display label, e.g. "Kolkata / Delhi". */
  readonly label: string;
  readonly region: string;
  readonly tier: NodeTier;
  /**
   * Cities in this latency tier. Every one is drawn; the primary carries the
   * metric label. Plotting both keeps the map honest — Dubai and Singapore
   * share a tier but sit on opposite sides of the region.
   */
  readonly cities: readonly MeshCity[];
  /** Round-trip milliseconds from the Kathmandu core. */
  readonly latencyMs: number;
  /** Latency the same workload sees when served from a US hyperscaler. */
  readonly usCloudLatencyMs: number;
  /** Simulated streaming rate through the local LiteLLM gateway. */
  readonly tokensPerSecond: number;
  /** Streaming rate for the same model served cross-border from US-East. */
  readonly usCloudTokensPerSecond: number;
  /** Models served to this node from Kathmandu via LiteLLM. */
  readonly endpoints: readonly string[];
  readonly note: string;
}

/** Kathmandu datacentre. Every curve originates here. */
export const CORE_NODE = {
  id: "np-ktm-1",
  label: "Kathmandu (HQ DC)",
  shortLabel: "Kathmandu",
  region: "Nepal",
  latitude: 27.7172,
  longitude: 85.324,
  latencyMs: 0.8,
  latencyLabel: "0.8ms (Local Core)",
  acceleratorPool: "NVIDIA H200 pool",
  tokensPerSecond: 180,
} as const;

export const MESH_NODES: readonly MeshNode[] = [
  {
    id: "kolkata-delhi",
    label: "Kolkata / Delhi",
    region: "North India",
    tier: "regional",
    cities: [
      {
        name: "Delhi",
        latitude: 28.6139,
        longitude: 77.209,
        primary: true,
        labelAnchor: "nw",
      },
      {
        name: "Kolkata",
        latitude: 22.5726,
        longitude: 88.3639,
        primary: false,
        labelAnchor: "sw",
      },
    ],
    latencyMs: 14,
    usCloudLatencyMs: 271,
    tokensPerSecond: 162,
    usCloudTokensPerSecond: 26,
    endpoints: ["llama-3.3-70b-instruct", "qwen2.5-72b-instruct"],
    note: "Nearest major regional transit. First hop for cross-border peering.",
  },
  {
    id: "dhaka-thimphu",
    label: "Dhaka / Thimphu",
    region: "Eastern South Asia",
    tier: "regional",
    cities: [
      {
        name: "Dhaka",
        latitude: 23.8103,
        longitude: 90.4125,
        primary: true,
        labelAnchor: "se",
      },
      {
        name: "Thimphu",
        latitude: 27.4728,
        longitude: 89.639,
        primary: false,
        labelAnchor: "ne",
      },
    ],
    latencyMs: 18,
    usCloudLatencyMs: 288,
    tokensPerSecond: 154,
    usCloudTokensPerSecond: 24,
    endpoints: ["llama-3.3-70b-instruct", "mistral-small-3.1-24b"],
    note: "Himalayan-adjacent markets sharing the same regional backbone.",
  },
  {
    id: "bangalore-mumbai",
    label: "Bangalore / Mumbai",
    region: "West & South India",
    tier: "regional",
    cities: [
      {
        name: "Bangalore",
        latitude: 12.9716,
        longitude: 77.5946,
        primary: true,
        labelAnchor: "sw",
      },
      {
        name: "Mumbai",
        latitude: 19.076,
        longitude: 72.8777,
        primary: false,
        labelAnchor: "w",
      },
    ],
    latencyMs: 28,
    usCloudLatencyMs: 242,
    tokensPerSecond: 141,
    usCloudTokensPerSecond: 29,
    endpoints: ["qwen2.5-72b-instruct", "deepseek-v3"],
    note: "India's primary cloud and engineering corridor.",
  },
  {
    id: "singapore-dubai",
    label: "Singapore / Dubai",
    region: "SEA & Gulf",
    tier: "regional",
    cities: [
      {
        name: "Singapore",
        latitude: 1.3521,
        longitude: 103.8198,
        primary: true,
        labelAnchor: "nw",
      },
      {
        name: "Dubai",
        latitude: 25.2048,
        longitude: 55.2708,
        primary: false,
        labelAnchor: "s",
      },
    ],
    latencyMs: 42,
    usCloudLatencyMs: 218,
    tokensPerSecond: 128,
    usCloudTokensPerSecond: 31,
    endpoints: ["llama-3.3-70b-instruct", "deepseek-v3"],
    note: "Regional interconnect hubs for onward international transit.",
  },
  {
    id: "us-east",
    label: "US-East (AWS / GCP)",
    region: "N. Virginia",
    tier: "hyperscaler",
    // Far outside the map window. Rendered at a fixed off-map anchor in the
    // north-west corner with a dashed link, rather than plotted.
    cities: [],
    latencyMs: 285,
    usCloudLatencyMs: 285,
    tokensPerSecond: 24,
    usCloudTokensPerSecond: 24,
    endpoints: [],
    note: "Foreign hyperscaler region. Every request leaves the country.",
  },
];

/**
 * Where the off-map hyperscaler sits, in basemap unit space. Negative u places
 * it left of the projected window — the direction of North America — so the
 * dashed link reads as leaving the region entirely.
 */
export const OFF_MAP_ANCHOR = { u: -0.075, v: 0.08 } as const;

/** Models the Kathmandu core serves locally through the LiteLLM gateway. */
export const CORE_ENDPOINTS: readonly string[] = [
  "llama-3.3-70b-instruct",
  "qwen2.5-72b-instruct",
  "deepseek-v3",
  "mistral-small-3.1-24b",
];

export const MESH_TAGLINE =
  "Direct high-speed AI fabric from Kathmandu — 100% local data residency";

/** Shown with the figures so nobody reads them as a measured SLA. */
export const MESH_DISCLOSURE =
  "Illustrative figures for comparison. Not a measured service-level guarantee.";

export function formatMetric(node: MeshNode, mode: MeshMode): string {
  return mode === "latency"
    ? `${node.latencyMs} ms`
    : `${node.tokensPerSecond} tok/s`;
}

/**
 * 0..1 quality score for a node, 1 being best. Drives particle speed and curve
 * opacity so the animation, not the geometry, carries the comparison.
 */
export function qualityScore(node: MeshNode, mode: MeshMode): number {
  if (mode === "latency") {
    const worst = Math.max(...MESH_NODES.map((n) => n.latencyMs));
    // Log scale: 14ms vs 18ms should not look identical next to 285ms.
    return 1 - Math.log(node.latencyMs) / Math.log(worst);
  }
  const best = Math.max(...MESH_NODES.map((n) => n.tokensPerSecond));
  const worst = Math.min(...MESH_NODES.map((n) => n.tokensPerSecond));
  return (node.tokensPerSecond - worst) / (best - worst || 1);
}
