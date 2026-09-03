"use client";

/**
 * Pricing tables with working NPR/USD and hourly/monthly toggles.
 *
 * Client component: the toggles are real state and every figure recomputes
 * from lib/catalog. Nothing here hardcodes a price.
 */
import * as React from "react";
import { Badge, Card, Icon, Switch, Tabs } from "@/components/ui";
import {
  CATALOG,
  DEDICATED_MONTHLY,
  GPU_HOURLY,
  JUPYTER_RATES,
  STORAGE_RATES,
  TERM_DISCOUNT_PERCENT,
  TOKEN_RATES,
  profileById,
  skuById,
} from "@/lib/catalog";
import { USD_DISPLAY, formatMoney, type Currency } from "@/lib/money";
import { cn } from "@/lib/cn";

type Term = keyof typeof TERM_DISCOUNT_PERCENT;

const ISOLATION_COPY: Record<string, { label: string; tone: "hydro" | "info" | "neutral"; note: string }> = {
  exclusive: {
    label: "exclusive",
    tone: "hydro",
    note: "A whole card. Full bandwidth, no neighbours.",
  },
  mig: {
    label: "mig",
    tone: "info",
    note: "Hardware-partitioned. Tenants are fault-isolated.",
  },
  hami: {
    label: "hami",
    tone: "neutral",
    note: "Software-sliced on a shared card. Not fault-isolated.",
  },
};

export function PlaceholderBanner() {
  if (!CATALOG.meta.pricingIsPlaceholder) return null;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/8 px-5 py-4">
      <Icon name="warning" size={18} weight="fill" className="mt-px text-warning" />
      <div>
        <p className="font-body text-sm font-semibold text-warning">
          Indicative pricing — not a quote
        </p>
        <p className="mt-1 font-body text-[13.5px] font-light leading-relaxed text-ink-300">
          {CATALOG.meta.notice} Contact sales for rates that apply to your
          workload and commitment.
        </p>
      </div>
    </div>
  );
}

function CurrencyToggle({
  currency,
  onChange,
}: {
  currency: Currency;
  onChange: (c: Currency) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "font-mono text-[13px]",
          currency === "NPR" ? "text-hydro" : "text-fg-muted",
        )}
      >
        NPR
      </span>
      <Switch
        checked={currency === "USD"}
        onChange={(on) => onChange(on ? "USD" : "NPR")}
        label="Show prices in USD"
        size="sm"
      />
      <span
        className={cn(
          "font-mono text-[13px]",
          currency === "USD" ? "text-hydro" : "text-fg-muted",
        )}
      >
        USD
      </span>
    </div>
  );
}

export function PricingTables() {
  const [currency, setCurrency] = React.useState<Currency>("NPR");
  const [monthly, setMonthly] = React.useState(false);
  const [term, setTerm] = React.useState<Term>("reserved-12mo");
  const [tab, setTab] = React.useState("compute");

  const price = (paisa: number) => formatMoney(paisa, currency);
  /** 730 h is the billing month used throughout the catalogue. */
  const perUnit = (paisaPerHour: number) =>
    monthly ? price(paisaPerHour * 730) : price(paisaPerHour);
  const unitSuffix = monthly ? "/mo" : "/hr";

  return (
    <div>
      <PlaceholderBanner />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-5">
        <Tabs
          aria-label="Pricing category"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "compute", label: "gpu compute" },
            { id: "tokens", label: "model endpoints" },
            { id: "dedicated", label: "dedicated" },
            { id: "storage", label: "storage" },
          ]}
        />
        <div className="flex flex-wrap items-center gap-6">
          {tab === "compute" ? (
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "font-mono text-[13px]",
                  !monthly ? "text-hydro" : "text-fg-muted",
                )}
              >
                hourly
              </span>
              <Switch
                checked={monthly}
                onChange={setMonthly}
                label="Show monthly equivalent"
                size="sm"
              />
              <span
                className={cn(
                  "font-mono text-[13px]",
                  monthly ? "text-hydro" : "text-fg-muted",
                )}
              >
                monthly
              </span>
            </div>
          ) : null}
          <CurrencyToggle currency={currency} onChange={setCurrency} />
        </div>
      </div>

      {currency === "USD" ? (
        <p className="mt-4 font-body text-xs font-light text-fg-muted">
          {USD_DISPLAY.disclaimer} Rate as of {USD_DISPLAY.rateAsOf}:{" "}
          {USD_DISPLAY.nprPerUsd} NPR/USD.
        </p>
      ) : null}

      {/* ── GPU compute ─────────────────────────────────────── */}
      {tab === "compute" ? (
        <div className="mt-8">
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[52rem] border-collapse">
              <thead>
                <tr className="bg-carbon-800/60">
                  {["Configuration", "Isolation", "GPU memory", "Compute", "vCPU", `Price${unitSuffix}`].map(
                    (h) => (
                      <th
                        key={h}
                        className={cn(
                          "cv-label px-4 py-3 text-[10px]",
                          h.startsWith("Price") ? "text-right" : "text-left",
                        )}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {GPU_HOURLY.map((rate) => {
                  const profile = profileById(rate.profileId);
                  const sku = skuById(profile.skuId);
                  const iso = ISOLATION_COPY[profile.isolation]!;
                  return (
                    <tr key={rate.profileId} className="border-t border-line-subtle">
                      <td className="px-4 py-3.5">
                        <div className="font-mono text-[13px] text-ink-100">
                          {sku.shortName} · {profile.label}
                        </div>
                        <div className="mt-0.5 font-body text-[12px] font-light text-ink-500">
                          {sku.name}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={iso.tone}>{iso.label}</Badge>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[13px] text-ink-300">
                        {profile.gpuMemoryGb} GB
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[13px] text-ink-400">
                        {profile.computePercent}%
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[13px] text-ink-400">
                        {profile.vcpus}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-[13px] text-hydro">
                        {perUnit(rate.paisaPerHour)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {Object.entries(ISOLATION_COPY).map(([key, v]) => (
              <Card key={key} surface="solid" padding={16}>
                <Badge tone={v.tone}>{v.label}</Badge>
                <p className="mt-2.5 font-body text-[12.5px] font-light leading-relaxed text-ink-400">
                  {v.note}
                </p>
              </Card>
            ))}
          </div>

          <p className="mt-4 font-body text-xs font-light text-fg-muted">
            Metered per second with a {GPU_HOURLY[0]!.minimumBillableSeconds}-second
            minimum. Monthly figures assume 730 hours of continuous use.
          </p>

          <h3 className="mt-10 font-body text-lg font-bold tracking-tight text-ink-100">
            JupyterHub
          </h3>
          <div className="mt-4 overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[34rem] border-collapse">
              <thead>
                <tr className="bg-carbon-800/60">
                  {["Profile", "GPU", `Per user${unitSuffix}`].map((h, i) => (
                    <th
                      key={h}
                      className={cn(
                        "cv-label px-4 py-3 text-[10px]",
                        i === 2 ? "text-right" : "text-left",
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {JUPYTER_RATES.map((r) => (
                  <tr key={r.spawnerProfileId} className="border-t border-line-subtle">
                    <td className="px-4 py-3.5 font-mono text-[13px] text-ink-100">
                      {r.displayName}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[13px] text-ink-400">
                      {r.profileId === "jhub-cpu"
                        ? "—"
                        : `${profileById(r.profileId).gpuMemoryGb} GB`}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[13px] text-hydro">
                      {perUnit(r.paisaPerHour)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* ── Model endpoints ─────────────────────────────────── */}
      {tab === "tokens" ? (
        <div className="mt-8">
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[42rem] border-collapse">
              <thead>
                <tr className="bg-carbon-800/60">
                  {["Model", "Input / 1M tok", "Cached input / 1M", "Output / 1M tok"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={cn(
                          "cv-label px-4 py-3 text-[10px]",
                          i === 0 ? "text-left" : "text-right",
                        )}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {TOKEN_RATES.map((r) => (
                  <tr key={r.endpointId} className="border-t border-line-subtle">
                    <td className="px-4 py-3.5 font-mono text-[13px] text-ink-100">
                      {r.endpointId}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[13px] text-ink-300">
                      {price(r.inputPaisaPerMillion)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[13px] text-ink-400">
                      {r.cachedInputPaisaPerMillion === null
                        ? "—"
                        : price(r.cachedInputPaisaPerMillion)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[13px] text-hydro">
                      {price(r.outputPaisaPerMillion)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 font-body text-xs font-light text-fg-muted">
            Billed per token on actual usage. Cached input applies to repeated
            prompt prefixes. No minimum commitment.
          </p>
        </div>
      ) : null}

      {/* ── Dedicated ───────────────────────────────────────── */}
      {tab === "dedicated" ? (
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="cv-label mr-2">Term</span>
            {(Object.keys(TERM_DISCOUNT_PERCENT) as Term[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTerm(t)}
                aria-pressed={term === t}
                className={cn(
                  "cursor-pointer rounded-sm border px-3 py-1.5 font-mono text-xs transition-colors duration-fast",
                  term === t
                    ? "border-hydro bg-hydro/10 text-hydro"
                    : "border-line bg-carbon-600 text-ink-300 hover:bg-carbon-500",
                )}
              >
                {t.replace("reserved-", "").replace("on-demand-monthly", "monthly")}
                {TERM_DISCOUNT_PERCENT[t] > 0 ? (
                  <span className="ml-1.5 text-ink-500">
                    -{TERM_DISCOUNT_PERCENT[t]}%
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {DEDICATED_MONTHLY.map((node) => {
              const discount = TERM_DISCOUNT_PERCENT[term];
              const effective = Math.round(
                node.paisaPerMonth * (1 - discount / 100),
              );
              return (
                <Card key={node.id} padding={24} accent={term === "reserved-36mo"}>
                  <h3 className="font-mono text-[15px] text-ink-100">
                    {node.label}
                  </h3>
                  <p className="mt-1 font-body text-[12.5px] font-light text-ink-500">
                    {skuById(node.skuId).name} · {node.gpuCount} GPUs
                  </p>
                  <div className="mt-5">
                    <div className="font-mono text-2xl text-hydro">
                      {price(effective)}
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-fg-muted">
                      per month
                      {discount > 0 ? (
                        <span className="ml-2 line-through opacity-60">
                          {price(node.paisaPerMonth)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-4 border-t border-line-subtle pt-4 font-body text-[12.5px] font-light text-ink-400">
                    {node.form === "bare-metal"
                      ? "Bare metal with IPMI access and the full NVLink fabric."
                      : "KVM virtual machine with snapshots and fast rebuilds."}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* ── Storage ─────────────────────────────────────────── */}
      {tab === "storage" ? (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {Object.values(STORAGE_RATES).map((s) => (
            <Card key={s.id} padding={24}>
              <h3 className="font-mono text-[15px] text-ink-100">{s.label}</h3>
              <div className="mt-4 font-mono text-2xl text-hydro">
                {price(s.paisaPerGbMonth)}
              </div>
              <div className="mt-1 font-mono text-[11px] text-fg-muted">
                per GB-month
              </div>
              <p className="mt-4 border-t border-line-subtle pt-4 font-body text-[12.5px] font-light leading-relaxed text-ink-400">
                {s.description}
              </p>
            </Card>
          ))}
          <Card padding={24}>
            <h3 className="font-mono text-[15px] text-ink-100">egress</h3>
            <div className="mt-4 font-mono text-2xl text-hydro">
              {price(CATALOG.egress.paisaPerGb)}
            </div>
            <div className="mt-1 font-mono text-[11px] text-fg-muted">per GB</div>
            <p className="mt-4 border-t border-line-subtle pt-4 font-body text-[12.5px] font-light leading-relaxed text-ink-400">
              First {CATALOG.egress.freeGbPerMonth} GB each month is free.
              Ingress and intra-region traffic are always free.
            </p>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
