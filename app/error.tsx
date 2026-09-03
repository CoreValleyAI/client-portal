"use client";

import { Button } from "@/components/ui";
import { Logo } from "@/components/layout/logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo mark="combinedmark" height={36} />
      <p className="cv-label mt-10">Error</p>
      <h1 className="mt-3 font-body text-3xl font-extrabold tracking-tight text-ink-100">
        Something broke.
      </h1>
      <p className="mt-3 max-w-sm font-body font-light leading-relaxed text-ink-400">
        The page failed to render. Try again, and if it keeps happening let us
        know at info@corevalley.ai.
      </p>
      {error.digest ? (
        <p className="mt-4 font-mono text-[11px] text-ink-600">
          digest {error.digest}
        </p>
      ) : null}
      <Button variant="primary" className="mt-8" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
