"use client";

/**
 * Sign in / Sign up dialogs.
 *
 * Rendered with the native <dialog> element so focus trapping, Escape and
 * inertness come from the platform rather than a hand-rolled implementation.
 * The scrim is styled through ::backdrop.
 *
 * Submitting sets a demo session cookie and routes to /portal. There is no
 * real authentication here — the portal runs on the mock data layer.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Icon, Input } from "@/components/ui";
import { LogoLockup } from "./logo";

export type AuthMode = "signin" | "signup";

const COPY = {
  signin: {
    eyebrow: "Console access",
    title: "Sign in to CoreValley",
    body: "Use your work email and we will match you to an organisation.",
    cta: "Continue",
    alt: "New to CoreValley?",
    altAction: "Create an account",
  },
  signup: {
    eyebrow: "Request access",
    title: "Create your account",
    body: "GPU capacity in Kathmandu, billed in NPR. We will confirm your organisation before provisioning.",
    cta: "Create account",
    alt: "Already have an account?",
    altAction: "Sign in",
  },
} as const;

export function AuthModal({
  mode,
  open,
  onClose,
  onSwitchMode,
}: {
  mode: AuthMode;
  open: boolean;
  onClose: () => void;
  onSwitchMode: (m: AuthMode) => void;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const copy = COPY[mode];

  React.useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    if (email === "kaustuv@corevalley.ai" && password === "kaustuv123") {
      document.cookie = "cv_demo_session=1; path=/; max-age=86400; SameSite=Lax";
      router.push("/portal");
    } else {
      setSubmitting(false);
      alert("Invalid credentials. Please try again.");
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="auth-title"
      className="glass-modal m-auto w-[min(26rem,calc(100vw-2rem))] rounded-lg p-0 text-fg backdrop:bg-carbon-900/70 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={submit} className="p-7">
        <LogoLockup size={19} />

        <p className="cv-label mt-6 mb-1.5">{copy.eyebrow}</p>
        <h2
          id="auth-title"
          className="font-body text-[22px] font-bold tracking-tight text-ink-100"
        >
          {copy.title}
        </h2>
        <p className="mt-2 font-body text-[13.5px] font-light leading-relaxed text-ink-400">
          {copy.body}
        </p>

        <div className="mt-6 space-y-4">
          {mode === "signup" ? (
            <div>
              <label htmlFor="auth-org" className="cv-label mb-2 block">
                Organisation
              </label>
              <Input
                id="auth-org"
                name="organisation"
                required
                placeholder="Himal Analytics"
                prefix={<Icon name="building" size={15} />}
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="auth-email" className="cv-label mb-2 block">
              Work email
            </label>
            <Input
              id="auth-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com.np"
              prefix={<Icon name="user" size={15} />}
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="cv-label mb-2 block">
              Password
            </label>
            <Input
              id="auth-password"
              name="password"
              type="password"
              required
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder="••••••••••••"
              prefix={<Icon name="lock" size={15} />}
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={submitting}
          className="mt-6"
          iconRight={<Icon name="arrow-right" size={16} />}
        >
          {submitting ? "Signing in…" : copy.cta}
        </Button>

        <div className="my-5 flex items-center gap-2.5">
          <span className="h-px flex-1 bg-[var(--border-subtle)]" />
          <span className="font-mono text-[10px] tracking-[0.1em] text-ink-600">
            OR
          </span>
          <span className="h-px flex-1 bg-[var(--border-subtle)]" />
        </div>

        <Button
          type="submit"
          variant="secondary"
          mono
          fullWidth
          iconLeft={<Icon name="terminal" size={15} />}
        >
          continue with sso
        </Button>

        <p className="mt-6 text-center font-body text-[13px] font-light text-ink-400">
          {copy.alt}{" "}
          <button
            type="button"
            onClick={() => onSwitchMode(mode === "signin" ? "signup" : "signin")}
            className="cursor-pointer text-hydro underline-offset-4 hover:underline"
          >
            {copy.altAction}
          </button>
        </p>
      </form>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 cursor-pointer rounded-md p-1.5 text-ink-500 hover:bg-carbon-600 hover:text-ink-200"
      >
        <Icon name="x" size={16} />
      </button>
    </dialog>
  );
}
