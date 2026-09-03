import { RidgelineBand } from "./ridgeline-band";

/** Shared hero for interior marketing pages. */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line-subtle">
      <RidgelineBand height={200} opacity={0.18} />
      <div className="relative mx-auto max-w-page-xl px-5 pt-16 pb-14 md:px-10">
        <p className="cv-label">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-body text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink-100">
          {title}
        </h1>
        {lead ? (
          <p className="mt-5 max-w-2xl font-body text-md font-light leading-relaxed text-ink-300">
            {lead}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}

/** Section wrapper with the standard rhythm and optional heading block. */
export function Section({
  eyebrow,
  title,
  lead,
  alt = false,
  children,
}: {
  eyebrow?: string;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  alt?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`border-t border-line-subtle py-20 ${alt ? "bg-carbon-800/40" : ""}`}
    >
      <div className="mx-auto max-w-page-xl px-5 md:px-10">
        {eyebrow ? <p className="cv-label">{eyebrow}</p> : null}
        {title ? (
          <h2 className="mt-3 max-w-2xl font-body text-[clamp(1.6rem,3.2vw,2.2rem)] font-bold leading-tight tracking-[-0.025em] text-ink-100">
            {title}
          </h2>
        ) : null}
        {lead ? (
          <p className="mt-4 max-w-2xl font-body font-light leading-relaxed text-ink-400">
            {lead}
          </p>
        ) : null}
        <div className={eyebrow || title || lead ? "mt-10" : ""}>{children}</div>
      </div>
    </section>
  );
}
