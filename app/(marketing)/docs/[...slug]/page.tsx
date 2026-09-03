import { notFound } from "next/navigation";
import { Card, Icon, Terminal } from "@/components/ui";
import type { TerminalLine } from "@/components/ui";

/**
 * The three reference pages under /docs. Content lives in this map rather than
 * MDX: it keeps the docs shell working end to end without adding a content
 * pipeline the project has not asked for yet.
 */
interface DocPage {
  title: string;
  lead: string;
  sections: {
    heading: string;
    body?: string;
    terminal?: TerminalLine[];
    rows?: [string, string][];
  }[];
}

const DOCS: Record<string, DocPage> = {
  quickstart: {
    title: "Quickstart",
    lead: "Install the CLI, authenticate, and launch your first GPU pod in np-ktm-1.",
    sections: [
      {
        heading: "1. Install the CLI",
        body: "The CLI is a single static binary. Homebrew, a shell installer and direct downloads are all available.",
        terminal: [
          { prompt: "$", text: "brew install corevalley/tap/corevalley" },
          { out: "# or:" },
          { prompt: "$", text: "curl -fsSL https://get.corevalley.ai | sh" },
          { prompt: "$", text: "corevalley version" },
          { out: "corevalley 0.9.2 (np-ktm-1)" },
        ],
      },
      {
        heading: "2. Authenticate",
        body: "Log in through the browser, or use an API key in CI. Keys are scoped and revocable from the portal.",
        terminal: [
          { prompt: "$", text: "corevalley auth login" },
          { out: "→ opened browser · signed in" },
          { out: "# non-interactive:" },
          { prompt: "$", text: "export CV_API_KEY=cv_live_..." },
        ],
      },
      {
        heading: "3. Pick a slice",
        body: "List what is available before you launch. MIG profiles are fault-isolated; HAMi profiles are cheaper but share a card.",
        terminal: [
          { prompt: "$", text: "corevalley slices list --gpu h200" },
          { out: "  1g.18gb    mig    18 GB   14%   NPR 72/hr" },
          { out: "  2g.35gb    mig    35 GB   29%   NPR 132/hr" },
          { out: "  25% 35gb   hami   35 GB   25%   NPR 118/hr" },
          { comment: "hami is cheaper: no hardware fault isolation" },
        ],
      },
      {
        heading: "4. Launch a pod",
        body: "Name it, pick an image, attach a volume if you need one. Billing starts when the pod reaches running.",
        terminal: [
          { prompt: "$", text: "corevalley pods launch \\" },
          { out: "    --name my-first-run --gpu h200 --slice 2g.35gb \\" },
          { out: "    --image pytorch:2.5-cu124" },
          { out: "→ pod cv-4a2f18 · provisioning" },
          { out: "→ pulling image · running" },
          { comment: "ready in 11s" },
        ],
      },
      {
        heading: "5. Connect",
        body: "SSH in with your registered key, or forward a port for Jupyter or TensorBoard.",
        terminal: [
          { prompt: "$", text: "corevalley pods ssh my-first-run" },
          { prompt: "$", text: "corevalley pods forward my-first-run 8888" },
          { out: "→ http://localhost:8888" },
          { prompt: "$", text: "corevalley pods stop my-first-run" },
          { comment: "meter stops immediately" },
        ],
      },
    ],
  },
  cli: {
    title: "CLI reference",
    lead: "Every command groups under a noun: pods, jupyter, endpoints, volumes, clusters, billing.",
    sections: [
      {
        heading: "Pods",
        rows: [
          ["corevalley pods list", "List pods, optionally filtered by status or project"],
          ["corevalley pods launch", "Create a pod from a slice profile and image"],
          ["corevalley pods stop <name>", "Stop a pod and halt its meter"],
          ["corevalley pods start <name>", "Restart a stopped pod"],
          ["corevalley pods rm <name>", "Terminate permanently"],
          ["corevalley pods logs <name> -f", "Stream stdout and stderr"],
          ["corevalley pods ssh <name>", "Open a shell in the container"],
          ["corevalley pods forward <name> <port>", "Forward a port to localhost"],
        ],
      },
      {
        heading: "Notebooks",
        rows: [
          ["corevalley jupyter profiles", "List spawner profiles and their rates"],
          ["corevalley jupyter start --profile <id>", "Spawn a notebook server"],
          ["corevalley jupyter stop", "Stop your server"],
        ],
      },
      {
        heading: "Endpoints and keys",
        rows: [
          ["corevalley endpoints list", "List available models and their rates"],
          ["corevalley keys create --name <n>", "Create an API key (shown once)"],
          ["corevalley keys rotate <id>", "Rotate a key without downtime"],
          ["corevalley keys revoke <id>", "Revoke immediately"],
        ],
      },
      {
        heading: "Clusters and billing",
        rows: [
          ["corevalley clusters list", "List your vClusters"],
          ["corevalley clusters kubeconfig <id>", "Download a kubeconfig"],
          ["corevalley usage --window day", "Usage series by meter"],
          ["corevalley billing invoices", "List invoices"],
        ],
      },
    ],
  },
  api: {
    title: "API reference",
    lead: "An OpenAI-compatible inference API, plus a REST control plane for everything the portal does.",
    sections: [
      {
        heading: "Inference — OpenAI compatible",
        body: "Point any OpenAI SDK at the CoreValley base URL and change the model string. Chat completions, embeddings and tool calling are supported.",
        terminal: [
          { prompt: "$", text: "curl https://api.corevalley.ai/v1/chat/completions \\" },
          { out: '    -H "Authorization: Bearer $CV_API_KEY" \\' },
          { out: '    -H "Content-Type: application/json" \\' },
          { out: '    -d \'{"model":"llama-3.3-70b-instruct",' },
          { out: '         "messages":[{"role":"user","content":"Hello"}]}\'' },
        ],
      },
      {
        heading: "Python",
        body: "The official OpenAI client works unchanged — only base_url and the model name differ.",
        terminal: [
          { out: "from openai import OpenAI" },
          { out: "" },
          { out: "client = OpenAI(" },
          { out: '    base_url="https://api.corevalley.ai/v1",' },
          { out: '    api_key=os.environ["CV_API_KEY"],' },
          { out: ")" },
          { out: 'resp = client.chat.completions.create(' },
          { out: '    model="qwen2.5-72b-instruct",' },
          { out: '    messages=[{"role": "user", "content": "नमस्ते"}],' },
          { out: ")" },
        ],
      },
      {
        heading: "Control plane",
        rows: [
          ["GET /v1/pods", "List pods"],
          ["POST /v1/pods", "Launch a pod"],
          ["DELETE /v1/pods/{id}", "Terminate a pod"],
          ["GET /v1/usage", "Usage series by meter and window"],
          ["GET /v1/invoices", "List invoices"],
          ["GET /v1/audit", "Audit log entries with chain hashes"],
        ],
      },
      {
        heading: "Rate limits",
        body: "Limits are per API key and per model, returned on every response in the X-RateLimit headers. Contact sales to raise them for production traffic.",
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((slug) => ({ slug: [slug] }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const doc = DOCS[slug.join("/")];
  if (!doc) return {};
  return { title: doc.title, description: doc.lead };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const doc = DOCS[slug.join("/")];
  if (!doc) notFound();

  return (
    <article>
      <p className="cv-label">Documentation</p>
      <h1 className="mt-3 font-body text-[clamp(1.8rem,3.6vw,2.3rem)] font-extrabold leading-tight tracking-[-0.03em] text-ink-100">
        {doc.title}
      </h1>
      <p className="mt-4 max-w-2xl font-body text-md font-light leading-relaxed text-ink-300">
        {doc.lead}
      </p>

      <div className="mt-10 space-y-10">
        {doc.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-body text-lg font-bold tracking-tight text-ink-100">
              {s.heading}
            </h2>
            {s.body ? (
              <p className="mt-2 max-w-2xl font-body text-[14px] font-light leading-relaxed text-ink-400">
                {s.body}
              </p>
            ) : null}
            {s.terminal ? (
              <Terminal className="mt-4" cursor={false} lines={s.terminal} />
            ) : null}
            {s.rows ? (
              <div className="mt-4 overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-[34rem] border-collapse">
                  <tbody>
                    {s.rows.map(([cmd, desc], i) => (
                      <tr
                        key={cmd}
                        className={i > 0 ? "border-t border-line-subtle" : ""}
                      >
                        <td className="px-4 py-3 font-mono text-[12.5px] whitespace-nowrap text-hydro">
                          {cmd}
                        </td>
                        <td className="px-4 py-3 font-body text-[13.5px] font-light text-ink-400">
                          {desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        ))}
      </div>

      <Card surface="solid" padding={22} className="mt-12">
        <div className="flex items-start gap-3">
          <Icon name="info" size={18} weight="duotone" className="mt-0.5 shrink-0 text-info" />
          <p className="font-body text-[13.5px] font-light leading-relaxed text-ink-400">
            Missing something? Email{" "}
            <a href="mailto:info@corevalley.ai" className="text-hydro hover:underline">
              info@corevalley.ai
            </a>
            .
          </p>
        </div>
      </Card>
    </article>
  );
}
