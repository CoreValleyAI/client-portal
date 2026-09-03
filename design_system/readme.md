# Corevalley — Design System

> **corevalley_** · Hydro-powered AI compute infrastructure

Green-energy GPU & AI compute infrastructure, built on Himalayan hydropower.
This design system encodes the visual and verbal identity defined in
**Corevalley Brand Guidelines v1.0** (Confidential) into reusable tokens,
components, and UI kits.

---

## Brand at a glance

**Compute that runs on rivers, not coal.** Corevalley delivers GPU compute
powered by Nepal's hydroelectricity — near-zero carbon, low cost, and
positioned at the edge of the world's fastest-growing AI markets.

| Metric | Value |
|---|---|
| Hydro power cost | ~$0.04 / kWh |
| Carbon per compute | ~0 g |
| Latency to Mumbai | ~40 ms |

- **What we are:** GPU-as-a-Service and AI compute infrastructure. A platform, not a storefront.
- **Where we sit:** Primary market India; Southeast Asia as a natural adjacency.
- **Best fit:** Training, fine-tuning, batch & async pipelines — where green energy and cost win.
- **The edge:** Structural ESG advantage against fossil-powered regional grids.

### Positioning story
The AI buildout is colliding with a power problem. Most compute runs on
fossil-heavy grids at rising cost. Corevalley starts from the opposite
premise: abundant, cheap, clean hydroelectric energy in the Himalayas, wired
directly into the AI economies of South Asia.

---

## Sources

This system was authored from materials provided by the brand owner. Keep them
on file; do not assume the reader has access.

- `uploads/Corevalley Brandbook.pdf` — Brand Guidelines v1.0 (15 pages, confidential). Primary source for all colors, type, voice, and logo rules below.
- `uploads/WhatsApp Image 2026-06-21 at 15.03.11.jpeg` — glowing cloud/CV mark on black (legacy raster, kept at `assets/logo-mark-glow.jpeg`). Superseded by the official vector logo set in `assets/logo/` supplied by the brand owner.

No codebase, Figma file, or live product URLs were provided. UI kits in this
system are **plausible, on-brand recreations** extrapolated from the brand
guidelines (a CLI/console surface and a marketing site), not copies of an
existing product. Replace them with real product views if/when a codebase or
Figma is shared.

---

## Content fundamentals

**Voice:** we speak like infrastructure engineers, not marketers. Direct,
technical, confident. We make claims we can defend and we don't oversell.

- **We are:** precise · grounded · technical · honest about constraints.
- **We are not:** hypey · vague · buzzword-driven · corporate-generic.

**Casing & person.** Product/CLI surfaces are **lowercase monospace**
(`np-ktm-1`, `--gpu h200`, prompt glyphs `>` / `$`). The logo wordmark is also
lowercase — set as the official `corevalley` vector lockup, never retyped.
Marketing headlines use sentence case in Manrope. We write to the builder as
"you"; we speak as "we" sparingly and only with substance. Numbers are concrete
and unit-tagged (`~40ms`, `~$0.04/kWh`, `~0g`).

**Say / Not.**
- ✅ "~40ms to Mumbai. Built for training and async workloads."
- ❌ "Blazing-fast, world-class AI for every workload imaginable."

**Emoji:** none. The brand's only "icon language" is the terminal — prompt
glyphs (`>`, `$`), flags (`--region`), and the block cursor. Keep copy spare;
let the data carry the weight. Eyebrow labels are uppercase mono with wide
tracking (`COLOR USAGE`, `AT A GLANCE`).

---

## Visual foundations

**Overall vibe.** Dark-mode-first, terminal-native, disciplined. The brand
renders itself in the language of the people who use it — a live terminal
prompt. Carbon grounds everything; Hydro green is energy and action, used as a
**signal, not a wash**.

**Color.** A five-token core palette: Hydro `#4ADE80` (primary/accent/action),
Hydro Dark `#16A34A` (hover/secondary), Carbon `#05080D` (ground), Ink
`#E8ECEF` (primary text), Mute `#6B7280` (secondary text). Carbon dominates most
surface area. Green is reserved for the prompt, cursor, links, key actions, and
single hero figures. Green handles hover/pressed via Hydro Dark. **Never** large
green fills behind body copy. Derived scales (`--hydro-100..900`,
`--carbon-400..900`, `--ink-100..700`) extend these for elevation and state but
stay inside the same hue discipline.

**Type.** Two families. **JetBrains Mono** (400/500/700) is the brand voice —
code, data, labels, technical detail. **Manrope** (300–800) handles marketing
headlines and body.
Headlines set **tight** (line-height ~1.05, slightly negative tracking). Body
stays **light-weight and generously spaced** — Manrope 300 at 1.6 line-height
for long technical passages on dark ground. Eyebrow labels: mono 500, uppercase,
`0.14em` tracking.

**Backgrounds.** Carbon is the default ground — near-black with a faint blue
cast (`#05080D`), not pure `#000`. The signature backdrop device is the
**dot-matrix ridgeline** (`assets/ridgeline.svg`): a Himalayan silhouette built
from a pixel grid of Hydro-green dots that fade with depth. Use it as a footer
band, section break, or full-bleed low-opacity backdrop. It is **monochrome by
design** — never stretch the aspect ratio or recolor it. No photographic
gradients, no purple/blue hero washes.

**Elevation & surfaces.** Cards are raised Carbon (`--surface-card #0B0F17`) over
the base ground, separated by hairline borders (`rgba(232,236,239,0.07–0.20)`)
rather than heavy shadows. Shadows, when used, are **deep and low-spread**
(black, high alpha) — they sit on carbon, not on white. The only glow in the
system is **Hydro green** (`--glow-hydro-*`), reserved for the cursor, focus
rings, and hero accents.

**Corners.** Tight and technical — `--radius-sm 4px` / `--radius-md 6px` for most
controls and cards; pills (`--radius-pill`) only for tags/status chips. Nothing
is heavily rounded; the feel is infrastructure, not consumer-soft.

**Borders.** Hairline, low-contrast Ink at low alpha. A Hydro border
(`--border-hydro`) marks the active/selected/focused state. Border-width is 1px
(1.5px for emphasis).

**Motion.** Measured and mechanical — no bounce. Standard easing
`cubic-bezier(0.2,0,0.2,1)`, durations 120–360ms. Hover = color shift
(green → Hydro Dark) and/or subtle surface lift; press = darker still + tiny
inset, never a scale-bounce. The one signature animation is the **block cursor
blink** at ~1s intervals. Respect `prefers-reduced-motion`.

**Transparency & blur.** Sparingly. Popovers/dialogs use a raised Carbon surface
with a strong scrim behind; optional light backdrop-blur on overlays. No
frosted-glass everywhere.

**Imagery color vibe.** Cool, dark, high-contrast — carbon blacks, Hydro-green
highlights, occasional cyan/teal data accents. Avoid warm tones, avoid grain,
avoid stock-photo gradients.

---

## Iconography

Corevalley has **no decorative icon set** in its brand guidelines — its icon
language is the **terminal**: prompt glyphs (`>`, `$`), CLI flags (`--region`,
`--gpu`), the trailing underscore, and the solid block cursor. Lean on these
first.

Where functional UI genuinely needs glyphs (nav, status, controls), this system
uses **[Lucide](https://lucide.dev)** — a thin, even-stroke, geometric line set
that matches the technical, monospace-adjacent feel. Lucide is linked from CDN
(`https://unpkg.com/lucide@latest`) in UI kits and component cards. Render icons
in Ink for default, Hydro for active/accent, Mute for inert — stroke width
1.5–2px to sit beside JetBrains Mono. This is a **substitution** (the brandbook
specifies no icon font); flag it if the brand later standardizes on a different
set.

- **SVG, not PNG/emoji** for UI glyphs. Emoji are never used.
- The **logo** is the official vector set in `assets/logo/` — `cv-combinedmark`
  (primary lockup), `cv-brandmark` (cloud / CV monogram), and `cv-wordmark`
  (`corevalley`), each as color SVG + `-white` + `-green` SVG (raster fallbacks
  alongside). On Carbon use the **green** variants (Hydro wordmark + gradient
  mark) as the default; white is the mono alternative; the two-tone (Slate `core`
  + Hydro `valley`) version is for light grounds; the gradient brandmark works on
  both. The legacy terminal treatment `> corevalley_` remains in the UI kits as a CLI
  motif, not the logo.
- The **ridgeline** (`assets/ridgeline.svg`) is a graphic device, not an icon —
  don't shrink it into a button.

---

## Index / manifest

Root files:
- `styles.css` — global entry point (import manifest only). Consumers link this.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `base.css`.
- `assets/logo/` — official vector logo set (combinedmark / brandmark / wordmark; color + `-white` + `-green`). `assets/` also has `ridgeline.svg` and the legacy `logo-mark-glow.jpeg`.
- `guidelines/` — foundation specimen cards (Type, Colors, Spacing, Brand).
- `components/core/` — reusable React primitives (see below).
- `ui_kits/` — full-screen product recreations.
- `SKILL.md` — Agent-Skill manifest for downloadable use.

**Components** (`components/core/`): Button, IconButton, Input, Badge, Tag,
Card, StatBlock, Terminal, Switch, Tabs. Namespace at runtime:
`window.CorevalleyDesignSystem_9d3a1a`.

**UI kits** (`ui_kits/`): `console/` (the GPU console / CLI dashboard — login →
overview → instances table → deploy slide-over) and `marketing/` (the
corevalley.ai landing page — hero, pillars, regions, CTA). Each has its own
`README.md`. Both are high-fidelity **brand recreations** (no production
codebase or Figma was supplied); swap in real product views when available.

---

## Caveats

- **No codebase / Figma / live URLs** were provided — only the brandbook PDF and the logo image. UI kits are plausible on-brand recreations, not copies of a shipped product.
- **Fonts load from the Google Fonts CDN** (`tokens/fonts.css`). JetBrains Mono and Manrope are the genuine brand faces — not substitutes — but the design-system compiler can't register remote `@font-face`, so it reports "0 fonts." To self-host, drop woff2 files in `assets/fonts/` and replace the `@import`.
- **Iconography uses a curated [Lucide](https://lucide.dev) subset** (in the `Icon` component) — the brandbook specifies no icon set, so this is a documented substitution.
- The **ridgeline** (`assets/ridgeline.svg`) is generated to match the brandbook's described dot-matrix device, since no vector asset was supplied.
- The **logo** is now the official vector set (`assets/logo/`). The supplied SVGs shipped with empty `<defs>` (fill classes undefined → black); fills are baked onto the groups via inherited `fill` attributes (Slate `#616161` core, Hydro `#2BDA75` valley, Mint→Emerald `#6BF4A6`→`#1DCC6F` mark gradient).

---

## Using the tokens

Link `styles.css` and reference custom properties:

```css
.cta {
  background: var(--action);
  color: var(--text-on-hydro);
  font-family: var(--font-mono);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-5);
}
.cta:hover { background: var(--action-hover); }
```

## Using this system in other projects

There are two ways to build on Corevalley elsewhere:

1. **Link it directly.** Pull in `styles.css` (tokens + fonts) and load
   `_ds_bundle.js` to get the React components via
   `window.CorevalleyDesignSystem_9d3a1a`. See any `ui_kits/*/index.html`.
2. **Start from a template.** When another project *binds* this design system,
   the template picker offers ready-made, on-brand starting pages. Templates
   live in `templates/<slug>/` (entry `…/<Slug>.dc.html`):
   - **Landing Page** (`templates/landing-page/`) — marketing hero, stats, pillars, CTA.
   - **Console Dashboard** (`templates/console-dashboard/`) — sidebar, header, stat cards, instances table.

   Each loads the system through its sibling `ds-base.js` (one line points at
   the bound DS folder) and is fully click-to-edit.
