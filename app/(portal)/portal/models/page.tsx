import { Badge, Card, Icon, Terminal } from "@/components/ui";
import {
  PlaceholderPricingBadge,
  PortalPageHeader,
} from "@/components/portal/primitives";
import { getClient } from "@/lib/api/client";
import { formatNpr } from "@/lib/money";
import { formatCompactNumber } from "@/lib/format";
import { TOKEN_RATES } from "@/lib/catalog";

export const metadata = { title: "Models" };

export default async function ModelsPage() {
  const cv = getClient();
  const [endpoints, usage] = await Promise.all([
    cv.listModelEndpoints(),
    cv.getUsageSeries({ meterIds: ["tokens_in", "tokens_out"], window: "day" }),
  ]);

  const tokensIn = usage.find((u) => u.meterId === "tokens_in");
  const tokensOut = usage.find((u) => u.meterId === "tokens_out");

  return (
    <>
      <PortalPageHeader
        title="models"
        description="Open-weight models served on vLLM behind a LiteLLM gateway. OpenAI-compatible, billed per token, processed inside Nepal."
      />

      <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
        <Card surface="panel" padding={20}>
          <p className="cv-label text-[10px]">tokens in · 30 days</p>
          <p className="mt-2.5 font-mono text-[26px] leading-none text-ink-100">
            {formatCompactNumber(tokensIn?.total ?? 0)}
          </p>
        </Card>
        <Card surface="panel" padding={20}>
          <p className="cv-label text-[10px]">tokens out · 30 days</p>
          <p className="mt-2.5 font-mono text-[26px] leading-none text-hydro">
            {formatCompactNumber(tokensOut?.total ?? 0)}
          </p>
        </Card>
      </div>

      <div className="mt-6 mb-3 flex items-center gap-3">
        <h2 className="font-mono text-[14px] text-ink-200">catalogue</h2>
        <PlaceholderPricingBadge />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {endpoints.map((ep) => {
          const rate = TOKEN_RATES.find((r) => r.endpointId === ep.id);
          return (
            <Card key={ep.id} surface="panel" padding={22}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-mono text-[14px] text-ink-100">
                    {ep.displayName}
                  </h3>
                  <p className="mt-1 font-body text-[12.5px] font-light text-ink-500">
                    {ep.parameterCount} · {ep.quantization} ·{" "}
                    {formatCompactNumber(ep.contextLength)} context
                  </p>
                </div>
                <Badge tone={ep.status === "live" ? "success" : "warning"} dot>
                  {ep.status}
                </Badge>
              </div>

              <p className="mt-3 font-body text-[13px] font-light leading-relaxed text-ink-400">
                {ep.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-sm border border-line bg-carbon-600/60 px-2 py-1 font-mono text-[10.5px] text-ink-400">
                  {ep.engine}
                </span>
                {ep.supportsToolCalling ? (
                  <span className="rounded-sm border border-line bg-carbon-600/60 px-2 py-1 font-mono text-[10.5px] text-ink-400">
                    tools
                  </span>
                ) : null}
                {ep.supportsVision ? (
                  <span className="rounded-sm border border-line bg-carbon-600/60 px-2 py-1 font-mono text-[10.5px] text-ink-400">
                    vision
                  </span>
                ) : null}
                <span className="rounded-sm border border-line bg-carbon-600/60 px-2 py-1 font-mono text-[10.5px] text-ink-400">
                  {ep.tokensPerSecond} tok/s
                </span>
                <span className="rounded-sm border border-line bg-carbon-600/60 px-2 py-1 font-mono text-[10.5px] text-ink-400">
                  {ep.rateLimitRpm} rpm
                </span>
              </div>

              {rate ? (
                <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line-subtle pt-4">
                  <div>
                    <dt className="cv-label text-[9.5px]">in / 1M</dt>
                    <dd className="mt-1 font-mono text-[13px] text-ink-200">
                      {formatNpr(rate.inputPaisaPerMillion)}
                    </dd>
                  </div>
                  <div>
                    <dt className="cv-label text-[9.5px]">cached in</dt>
                    <dd className="mt-1 font-mono text-[13px] text-ink-400">
                      {rate.cachedInputPaisaPerMillion === null
                        ? "—"
                        : formatNpr(rate.cachedInputPaisaPerMillion)}
                    </dd>
                  </div>
                  <div>
                    <dt className="cv-label text-[9.5px]">out / 1M</dt>
                    <dd className="mt-1 font-mono text-[13px] text-hydro">
                      {formatNpr(rate.outputPaisaPerMillion)}
                    </dd>
                  </div>
                </dl>
              ) : null}
            </Card>
          );
        })}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 font-mono text-[14px] text-ink-200">
          <Icon name="terminal" size={15} className="text-hydro" />
          calling an endpoint
        </h2>
        <Terminal
          cursor={false}
          lines={[
            { prompt: "$", text: "curl https://api.corevalley.ai/v1/chat/completions \\" },
            { out: '    -H "Authorization: Bearer $CV_API_KEY" \\' },
            { out: '    -H "Content-Type: application/json" \\' },
            { out: '    -d \'{"model":"llama-3.3-70b-instruct",' },
            { out: '         "messages":[{"role":"user","content":"नमस्ते"}]}\'' },
            { comment: "openai-compatible · served from np-ktm-1" },
          ]}
        />
      </section>
    </>
  );
}
