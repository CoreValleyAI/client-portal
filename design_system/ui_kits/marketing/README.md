# Marketing UI Kit — corevalley.ai landing page

A single-scroll marketing site for Corevalley. High-fidelity **brand
recreation** built from Brand Guidelines v1.0 (no production site/Figma was
provided) — on-brand and representative, not a copy of a shipped page.

## Run
Open `index.html`. Requires the compiled `_ds_bundle.js` at the project root.

## Sections
- **Nav** — sticky, blurred carbon bar with the corevalley logo lockup (gradient mark + green wordmark).
- **Hero** — "Compute that runs on rivers, not coal," a live deploy terminal, and the brand's four hero stats over the ridgeline.
- **Pillars** — four value cards (carbon, cost, edge latency, heavy jobs).
- **Regions** — the three Himalayan hydro regions with latency + price.
- **CTA** + **Footer** — ridgeline-backed call to action and link columns.

## Files
- `index.html` — entry + wiring (also a `@dsCard` + `@startingPoint`).
- `Hero.jsx` — `Nav`, `Hero`, `Wordmark` (`window.CVM`).
- `Sections.jsx` — `Pillars`, `Regions`, `CTA`, `Footer`.
- Region data is reused from `../console/data.js` (`window.CV_DATA`).

Composes primitives from `window.CorevalleyDesignSystem_9d3a1a`.
