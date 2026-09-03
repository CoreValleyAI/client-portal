"use client";

/**
 * Pointer-tracked glow for a group of cards.
 *
 * One listener on the container rather than one per card, and it writes CSS
 * custom properties instead of React state — so a mousemove never triggers a
 * render. Each child carrying `.cv-spotlight` gets `--mx`/`--my` in its own
 * local coordinates, which the utility in globals.css turns into a soft Hydro
 * bloom that follows the cursor across the card.
 *
 * Coarse pointers and prefers-reduced-motion get nothing: there is no cursor
 * to follow, and the cards render exactly as they would without this wrapper.
 */
import * as React from "react";

export function SpotlightGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let lastEvent: PointerEvent | null = null;

    const apply = () => {
      frame = 0;
      const e = lastEvent;
      if (!e) return;
      // Re-query each frame: the grid reflows at breakpoints, and caching the
      // rects would leave the glow lagging behind after a resize.
      const cards = el.querySelectorAll<HTMLElement>(".cv-spotlight");
      for (const card of cards) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
    };

    const onMove = (e: PointerEvent) => {
      lastEvent = e;
      // Coalesce to one write per frame.
      if (!frame) frame = requestAnimationFrame(apply);
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      el.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
