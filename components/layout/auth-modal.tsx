"use client";

/**
 * Sign in / Sign up dialog.
 *
 * Rendered with the native <dialog> element so focus trapping, Escape and
 * inertness come from the platform rather than a hand-rolled implementation.
 * The scrim is styled through ::backdrop.
 *
 * Credentials are never collected here. In Keycloak mode the button hands off
 * to the identity provider, which owns login, registration, password reset and
 * MFA; "Create an account" jumps straight to Keycloak's registration screen.
 * In mock mode the same button signs in through the local mock provider, so
 * the console is usable without a running Keycloak.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button, Icon } from "@/components/ui";
import { useAuthMode } from "./auth-provider";
import { LogoLockup } from "./logo";

export type AuthMode = "signin" | "signup";

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
  const { keycloak, staticDemo, providerId, registerProviderId } =
    useAuthMode();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const copy = COPY(keycloak, staticDemo)[mode];

  React.useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const code = readParam("error");
    setError(code ? (ERRORS[code] ?? ERRORS["Default"]!) : null);
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    /* middleware.ts appends ?callbackUrl= when it bounces an unauthenticated
       request off /portal; honour it so the user resumes where they were.
       Read at submit time from location rather than useSearchParams() so the
       modal does not force its statically rendered host page into a Suspense
       boundary. */
    const callbackPath = safePath(readParam("callbackUrl")) ?? "/portal";

    /* The static export has no auth endpoints; the demo session is already
       seeded, so "sign in" is just navigation. */
    if (staticDemo) {
      router.push(callbackPath);
      return;
    }

    try {
      /* "Sign up" uses the provider entry whose authorization URL is
         Keycloak's /registrations endpoint (see lib/auth.ts). In mock mode
         both ids collapse onto the same local provider. */
      await signIn(mode === "signup" ? registerProviderId : providerId, {
        /* Absolute on purpose: Auth.js's /api/auth/signin endpoint silently
           discards a relative callbackUrl, which would land every sign-in on
           "/" instead of the page the user asked for. */
        callbackUrl: new URL(callbackPath, window.location.origin).href,
      });
    } catch {
      setSubmitting(false);
      setError("Could not reach the identity provider. Please try again.");
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
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

        {error ? (
          <p
            role="alert"
            className="mt-5 rounded-md border border-solar/40 bg-solar/10 px-3 py-2.5 font-body text-[12.5px] font-light text-solar"
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={submitting}
          className="mt-6"
          iconLeft={<Icon name="lock" size={15} />}
          iconRight={<Icon name="arrow-right" size={16} />}
        >
          {submitting ? "Redirecting…" : copy.cta}
        </Button>

        <p className="mt-4 text-center font-mono text-[10.5px] tracking-label uppercase text-ink-600">
          {keycloak
            ? "single sign-on · corevalley identity"
            : staticDemo
              ? "static preview · sample data"
              : "mock mode · no identity provider configured"}
        </p>

        <p className="mt-5 text-center font-body text-[13px] font-light text-ink-400">
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

/* -------------------------------------------------------------------------- */

/** Reads a query parameter from the live URL. Client-only by construction. */
function readParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

/** Accepts only same-site paths. `?callbackUrl=` is attacker-controllable, and
 *  "//evil.com" is a protocol-relative URL, not a path. */
function safePath(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

const COPY = (keycloak: boolean, staticDemo: boolean) =>
  ({
    signin: {
      eyebrow: "Console access",
      title: "Sign in to CoreValley",
      body: staticDemo
        ? "This is a static preview of the CoreValley console. Continue to explore it with sample data."
        : keycloak
          ? "You will be redirected to the CoreValley identity provider to enter your credentials."
          : "Keycloak is not configured, so the console signs in with a seeded development account.",
      cta: keycloak ? "Continue with SSO" : "Enter the console",
      alt: "New to CoreValley?",
      altAction: "Create an account",
    },
    signup: {
      eyebrow: "Request access",
      title: "Create your account",
      body: staticDemo
        ? "Account creation needs the hosted console. Continue to explore the preview with sample data."
        : keycloak
          ? "Registration, password reset and multi-factor enrolment are handled by the CoreValley identity provider."
          : "Keycloak is not configured. Start it with `docker compose up -d` to register a real account.",
      cta: keycloak ? "Register with SSO" : "Enter the console",
      alt: "Already have an account?",
      altAction: "Sign in",
    },
  }) as const;

/** Auth.js error codes that can land back on `/?error=…`. */
const ERRORS: Record<string, string> = {
  Configuration:
    "The identity provider is misconfigured. Check KEYCLOAK_ISSUER and the client secret.",
  AccessDenied: "That account is not permitted to access this console.",
  Verification: "The sign-in link has expired. Please try again.",
  OAuthCallbackError:
    "The identity provider rejected the callback. Check the client's redirect URIs.",
  Default: "Sign-in failed. Please try again.",
};
