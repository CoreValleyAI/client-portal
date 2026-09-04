/**
 * The official vector logo set. Never retype the wordmark as live text — the
 * brandbook forbids it, and the two-tone split is part of the mark.
 *
 * On Carbon the green variants are the default; white is the mono alternative.
 * Intrinsic ratios are preserved: only height is set, width follows.
 */
import { cn } from "@/lib/cn";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const MARKS = {
  brandmark: { src: `${BASE}/brand/cv-brandmark.svg`, w: 40, h: 40 },
  "brandmark-white": { src: `${BASE}/brand/cv-brandmark-white.svg`, w: 40, h: 40 },
  wordmark: { src: `${BASE}/brand/cv-wordmark-green.svg`, w: 168, h: 24 },
  "wordmark-white": { src: `${BASE}/brand/cv-wordmark-white.svg`, w: 168, h: 24 },
  combinedmark: { src: `${BASE}/brand/cv-combinedmark-green.svg`, w: 220, h: 40 },
  "combinedmark-white": { src: `${BASE}/brand/cv-combinedmark-white.svg`, w: 220, h: 40 },
} as const;

export interface LogoProps {
  mark?: keyof typeof MARKS;
  height?: number;
  priority?: boolean;
  className?: string;
}

export function Logo({
  mark = "combinedmark",
  height = 28,
  priority = false,
  className,
}: LogoProps) {
  const m = MARKS[mark];
  return (
    <img
      src={m.src}
      alt="CoreValley"
      width={Math.round((m.w / m.h) * height)}
      height={height}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={className}
    />
  );
}

/**
 * The horizontal lockup used in navigation: gradient brandmark plus the green
 * wordmark, matching the design system's ui_kits treatment.
 */
export function LogoLockup({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center", className)}
      style={{ gap: Math.round(size * 0.45) }}
    >
      <Logo mark="brandmark" height={Math.round(size * 1.45)} priority />
      <Logo mark="wordmark" height={Math.round(size * 0.92)} priority />
    </span>
  );
}
