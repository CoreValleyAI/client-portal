import type { IconName, TerminalLine } from "@/components/ui";

/** The four ways to buy compute. Drives /products, its detail pages and nav. */
export interface ProductDef {
  slug: string;
  icon: IconName;
  name: string;
  tagline: string;
  summary: string;
  meta: string;
  audience: string;
  features: { title: string; body: string }[];
  terminal: TerminalLine[];
  specs: { label: string; value: string }[];
}

export const PRODUCTS: ProductDef[] = [
  {
    slug: "gpu-pods",
    icon: "slice",
    name: "GPU Pods",
    tagline: "Whole cards, or a fourteenth of one.",
    summary:
      "Containerised GPU workloads on H100 and H200. Take an exclusive card, a hardware-partitioned MIG instance, or a soft HAMi slice — and pay per second either way.",
    meta: "mig · hami · per-second billing",
    audience: "ML engineers, startups and research teams",
    features: [
      {
        title: "MIG: hardware partitioning",
        body: "Multi-Instance GPU splits an H200 into up to seven instances, each with dedicated streaming multiprocessors, L2 cache and memory. Tenants are genuinely fault-isolated — a neighbour's OOM cannot touch your instance.",
      },
      {
        title: "HAMi: soft slicing",
        body: "For workloads that do not need hardware isolation, HAMi schedules by memory limit and compute percentage onto a shared card. Denser and cheaper than MIG, which is exactly why it is priced below it — and why we label the difference instead of hiding it.",
      },
      {
        title: "Per-second metering",
        body: "Billing runs on GPU-seconds with a sixty-second minimum. Stop a pod and the meter stops with it. No hourly rounding, no idle charges after termination.",
      },
      {
        title: "Pre-built images",
        body: "CUDA, cuDNN, PyTorch, TensorFlow, vLLM, DeepSpeed and the usual fine-tuning stack are ready at first boot. Bring your own image if you would rather.",
      },
      {
        title: "Persistent volumes",
        body: "Attach replicated network SSD that survives pod termination, or use ephemeral local NVMe for scratch. Mount the same volume across pods in a project.",
      },
      {
        title: "SSH and port forwarding",
        body: "Root in the container, SSH from your own key, and exposed ports for TensorBoard, Jupyter or your own service.",
      },
    ],
    terminal: [
      { prompt: "$", text: "corevalley pods launch \\" },
      { out: "    --name nepali-7b-sft --gpu h200 --slice 2g.35gb \\" },
      { out: "    --image pytorch:2.5-cu124 --volume datasets:/data" },
      { out: "→ h200 mig 2g.35gb · 35 GB · 7 vcpu · np-ktm-1" },
      { comment: "pod cv-9f3a21 running in 11s" },
      { prompt: "$", text: "" },
    ],
    specs: [
      { label: "Isolation", value: "exclusive · mig · hami" },
      { label: "Billing", value: "per second, 60s minimum" },
      { label: "GPUs", value: "H100 80 GB · H200 141 GB" },
      { label: "Region", value: "np-ktm-1 (Kathmandu)" },
    ],
  },
  {
    slug: "jupyterhub",
    icon: "notebook",
    name: "JupyterHub",
    tagline: "Notebooks for a whole department.",
    summary:
      "Managed multi-user JupyterHub with GPU spawner profiles, per-user resource limits and idle culling. Students and researchers get a real GPU without anyone administering a shared server.",
    meta: "multi-user · spawner profiles · idle culling",
    audience: "Universities, bootcamps and R&D teams",
    features: [
      {
        title: "Spawner profiles",
        body: "Offer a CPU-only profile for data prep and GPU-backed MIG slices for training. Users pick from a list; they never see a node or a scheduler.",
      },
      {
        title: "Idle culling",
        body: "Notebooks left open overnight stop billing. Set the threshold per organisation; the default stops a server after sixty idle minutes.",
      },
      {
        title: "Per-user limits",
        body: "Cap concurrent servers, memory and GPU share per user, so one runaway notebook cannot consume a department's quota.",
      },
      {
        title: "Shared and personal storage",
        body: "A private volume per user plus a shared read-only dataset mount, so a class of forty works from the same corpus without forty copies.",
      },
      {
        title: "Course-ready access",
        body: "Bulk-invite a cohort, hand out a profile, and remove access when term ends. No cloud accounts, no credit cards, no foreign billing.",
      },
      {
        title: "Real accounting",
        body: "Every notebook-hour is metered to the user and the project, so a department can see exactly where its budget went.",
      },
    ],
    terminal: [
      { prompt: "$", text: "corevalley jupyter profiles" },
      { out: "  cpu only          4 vcpu · 16 gb          NPR 9/hr" },
      { out: "  h200 1g.18gb      18 gb · mig            NPR 84/hr" },
      { out: "  h200 2g.35gb      35 gb · mig            NPR 146/hr" },
      { comment: "idle cull after 60 min · 3 named servers per user" },
      { prompt: "$", text: "" },
    ],
    specs: [
      { label: "Hub version", value: "JupyterHub 5.2" },
      { label: "Profiles", value: "CPU · MIG 1g · MIG 2g" },
      { label: "Billing", value: "per user-hour, metered per second" },
      { label: "Culling", value: "configurable, 60 min default" },
    ],
  },
  {
    slug: "model-endpoints",
    icon: "broadcast",
    name: "Model API Endpoints",
    tagline: "Open models, per token, in-country.",
    summary:
      "OpenAI-compatible inference for open-weight models, served on vLLM behind a LiteLLM gateway. Pay per token, keep every request inside Nepal, and never manage a GPU.",
    meta: "vllm · litellm · openai-compatible",
    audience: "Product teams shipping AI features",
    features: [
      {
        title: "vLLM serving",
        body: "Continuous batching and paged attention keep throughput high and latency predictable under real concurrency, not just in a benchmark.",
      },
      {
        title: "LiteLLM gateway",
        body: "One OpenAI-compatible base URL across every model. Point an existing SDK at it, change the model string, and you are done.",
      },
      {
        title: "Per-token billing",
        body: "Separate input and output rates, with a discounted rate for cached prompt prefixes. Usage is metered per request and appears on the same invoice as your GPU time.",
      },
      {
        title: "Scoped API keys",
        body: "Issue keys per service, scope them to specific models, rotate without downtime and revoke instantly. Keys are shown once at creation.",
      },
      {
        title: "Data residency",
        body: "Prompts and completions are processed and logged inside Nepal. Nothing is sent to a third-party model provider, because there isn't one.",
      },
      {
        title: "Tool calling and vision",
        body: "Function calling across the catalogue, and vision input on the models that support it.",
      },
    ],
    terminal: [
      { prompt: "$", text: "curl https://api.corevalley.ai/v1/chat/completions \\" },
      { out: '    -H "Authorization: Bearer $CV_API_KEY" \\' },
      { out: '    -d \'{"model":"llama-3.3-70b-instruct",' },
      { out: '         "messages":[{"role":"user","content":"नमस्ते"}]}\'' },
      { comment: "58 tok/s · 131k context · served from np-ktm-1" },
      { prompt: "$", text: "" },
    ],
    specs: [
      { label: "Engines", value: "vLLM · SGLang" },
      { label: "Gateway", value: "LiteLLM, OpenAI-compatible" },
      { label: "Billing", value: "per million tokens, in/out" },
      { label: "Models", value: "Llama · Qwen · DeepSeek · Mistral" },
    ],
  },
  {
    slug: "dedicated",
    icon: "node",
    name: "Dedicated & Bare Metal",
    tagline: "A whole node, and no neighbours.",
    summary:
      "Entire H100 or H200 nodes reserved for one tenant, as bare metal or as a VM. For Sovereign and Dedicated tiers where isolation is a contractual requirement, not a preference.",
    meta: "bare metal · reserved terms · ipmi",
    audience: "Banks, government and regulated enterprises",
    features: [
      {
        title: "Single tenancy",
        body: "The whole node is yours: all eight GPUs, the NVLink fabric, the local NVMe. Nothing else is scheduled onto it for the length of your term.",
      },
      {
        title: "Bare metal or VM",
        body: "Bare metal for maximum performance and IPMI access, or a KVM VM if you would rather have snapshots and faster rebuilds.",
      },
      {
        title: "Reserved pricing",
        body: "Commit for six, twelve or thirty-six months and the effective rate falls well below on-demand. Terms and discounts are shown up front, not negotiated per call.",
      },
      {
        title: "Private networking",
        body: "Your node sits behind a default-deny Cilium policy with an explicit allow-list, and can be peered to your own network.",
      },
      {
        title: "Compliance posture",
        body: "Dedicated hardware makes the data-residency and tenancy questions on a bank's security review trivial to answer.",
      },
      {
        title: "Named support",
        body: "A named engineer in Kathmandu, reachable in Nepal business hours, who knows your deployment.",
      },
    ],
    terminal: [
      { prompt: "$", text: "corevalley nodes list" },
      { out: "  kyc-dedicated-01   8x h100   bare-metal   active" },
      { out: "  term: reserved-12mo · renews in 225d" },
      { out: "  network: default-deny · egress: allow-list only" },
      { comment: "ipmi enabled · np-ktm-1" },
      { prompt: "$", text: "" },
    ],
    specs: [
      { label: "Form", value: "bare metal · KVM VM" },
      { label: "Configurations", value: "4x and 8x nodes" },
      { label: "Terms", value: "monthly · 6 · 12 · 36 months" },
      { label: "Networking", value: "Cilium default-deny" },
    ],
  },
];

export function productBySlug(slug: string): ProductDef | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
