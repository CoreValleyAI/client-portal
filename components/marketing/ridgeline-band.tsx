/**
 * The dot-matrix Himalayan ridgeline — the brand's signature graphic device.
 *
 * Served as <img> rather than inline SVG on purpose: the file holds 5,439
 * <circle> elements. Inlining would put all of them in the main document's
 * style/layout/paint trees and ~273 KB of uncompressed markup into the RSC
 * payload on every render. As an image the browser rasterises it in an
 * isolated document, and it caches independently (23 KB gzip).
 *
 * object-cover crops; it never distorts. The brandbook forbids stretching the
 * aspect ratio, so `background-size: 100% 100%` and explicit width+height are
 * both off the table.
 */
export function RidgelineBand({
  height = 180,
  opacity = 0.5,
  className,
}: {
  height?: number;
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden ${className ?? ""}`}
      style={{ height }}
    >
      <img
        src="/brand/ridgeline.v1.svg"
        alt=""
        width={1280}
        height={360}
        loading="lazy"
        decoding="async"
        style={{ opacity }}
        className="absolute inset-x-0 bottom-0 h-full w-full object-cover object-bottom"
      />
    </div>
  );
}
