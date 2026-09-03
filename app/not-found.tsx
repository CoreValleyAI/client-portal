import Link from "next/link";
import { Button } from "@/components/ui";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo mark="combinedmark" height={36} />
      <p className="cv-label mt-10">404</p>
      <h1 className="mt-3 font-body text-3xl font-extrabold tracking-tight text-ink-100">
        Nothing here.
      </h1>
      <p className="mt-3 max-w-sm font-body font-light leading-relaxed text-ink-400">
        That page does not exist. It may have moved, or the link may be wrong.
      </p>
      <Link href="/" className="mt-8">
        <Button variant="primary">Back to home</Button>
      </Link>
    </main>
  );
}
