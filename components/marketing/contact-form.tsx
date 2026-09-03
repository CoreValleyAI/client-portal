"use client";

/**
 * Sales enquiry form.
 *
 * Posts to the FormSubmit relay the previous site already used, so no backend
 * is required. On success the form resets and shows a confirmation; if the
 * fetch fails it falls back to a native POST rather than losing the message.
 */
import * as React from "react";
import { Button, Card, Icon, Input } from "@/components/ui";

const INBOX = "info@corevalley.ai";
const ENDPOINT = `https://formsubmit.co/ajax/${INBOX}`;

const INTERESTS = [
  { value: "gpu-pods", label: "GPU Pods (training / fine-tuning)" },
  { value: "jupyterhub", label: "JupyterHub (research / teaching)" },
  { value: "model-endpoints", label: "Model API Endpoints (inference)" },
  { value: "dedicated", label: "Dedicated / Bare Metal" },
  { value: "academic", label: "Academic / university programme" },
  { value: "other", label: "Just exploring" },
];

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = React.useState<Status>("idle");
  const formRef = React.useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;

    setStatus("sending");
    const body = new FormData(form);

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body,
      });
      const data: { success?: string | boolean; message?: string } = await res
        .json()
        .catch(() => ({}));
      if (!res.ok || data.success === false || data.success === "false") {
        throw new Error(data.message ?? "send failed");
      }
      form.reset();
      setStatus("sent");
    } catch {
      // Relay rejected the AJAX call — fall back to a native POST so the
      // message is still delivered rather than silently dropped.
      form.method = "POST";
      form.action = `https://formsubmit.co/${INBOX}`;
      form.submit();
    }
  }

  if (status === "sent") {
    return (
      <Card padding={32}>
        <Icon name="check-circle" size={28} weight="duotone" className="text-hydro" />
        <h2 className="mt-4 font-body text-xl font-bold tracking-tight text-ink-100">
          Message sent.
        </h2>
        <p className="mt-2 font-body text-sm font-light leading-relaxed text-ink-400">
          We will get back to you during Nepal business hours, usually within
          one working day.
        </p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => setStatus("idle")}
        >
          Send another
        </Button>
      </Card>
    );
  }

  return (
    <Card padding={32}>
      <h2 className="font-body text-xl font-bold tracking-tight text-ink-100">
        Talk to sales
      </h2>
      <p className="mt-2 font-body text-[13.5px] font-light leading-relaxed text-ink-400">
        Tell us the shape of the workload and we will come back with a tier and
        clear NPR pricing.
      </p>

      <form ref={formRef} onSubmit={onSubmit} className="mt-6 space-y-4">
        <input type="hidden" name="_subject" value="CoreValley — new sales enquiry" />
        <input type="hidden" name="_template" value="table" />
        <input type="hidden" name="_captcha" value="false" />
        {/* Honeypot: bots fill it, humans never see it. */}
        <input
          type="text"
          name="_honey"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="cv-label mb-2 block">
              Full name *
            </label>
            <Input id="name" name="name" required placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="email" className="cv-label mb-2 block">
              Work email *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@organisation.com.np"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="organisation" className="cv-label mb-2 block">
              Organisation
            </label>
            <Input
              id="organisation"
              name="organisation"
              placeholder="University / company / startup"
            />
          </div>
          <div>
            <label htmlFor="interest" className="cv-label mb-2 block">
              Primary interest
            </label>
            <select
              id="interest"
              name="interest"
              defaultValue="gpu-pods"
              className="h-10 w-full rounded-md border border-line bg-surface-input px-3 font-body text-[14px] text-ink-100 outline-none transition-[border-color,box-shadow] duration-fast focus:border-hydro focus:shadow-[0_0_0_3px_rgba(74,222,128,0.12)]"
            >
              {INTERESTS.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="gpu_hours" className="cv-label mb-2 block">
            Expected GPU hours per month
          </label>
          <Input
            id="gpu_hours"
            name="gpu_hours"
            mono
            placeholder="e.g. 400, or not sure yet"
          />
        </div>

        <div>
          <label htmlFor="message" className="cv-label mb-2 block">
            Tell us about the workload *
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            placeholder="Models, dataset size, timeline, data-residency requirements..."
            className="w-full resize-y rounded-md border border-line bg-surface-input px-3 py-2.5 font-body text-[14px] font-light leading-relaxed text-ink-100 outline-none transition-[border-color,box-shadow] duration-fast placeholder:text-ink-600 focus:border-hydro focus:shadow-[0_0_0_3px_rgba(74,222,128,0.12)]"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={status === "sending"}
          iconRight={<Icon name="arrow-right" size={16} />}
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </Button>

        <p className="text-center font-body text-xs font-light text-fg-muted">
          Or email{" "}
          <a href={`mailto:${INBOX}`} className="text-hydro hover:underline">
            {INBOX}
          </a>{" "}
          directly.
        </p>
      </form>
    </Card>
  );
}
