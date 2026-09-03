---
name: corevalley-design
description: Use this skill to generate well-branded interfaces and assets for Corevalley, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Corevalley in one breath
Hydro-powered GPU & AI compute infrastructure ("compute that runs on rivers, not coal"). Dark-mode-first, terminal-native, disciplined. Voice = infrastructure engineers, not marketers: precise, technical, honest about constraints. Never hypey. Always lowercase mono for the wordmark and CLI surfaces.

## Non-negotiables
- **Ground is Carbon `#05080D`.** Green (`Hydro #4ADE80`) is a SIGNAL, not a wash — prompt, cursor, links, key actions, one hero figure per cluster. Never large green fills behind body copy.
- **Type:** JetBrains Mono (logo/code/data/labels, weight 500, lowercase) + Manrope (headlines tight, body 300 @ 1.6). Both load from Google Fonts via `styles.css`.
- **Logo:** official vector set in `assets/logo/` (combinedmark / brandmark / wordmark, color + `-white` + `-green`). On Carbon use the **green** variant (Hydro wordmark + gradient mark) as default, white as the mono alternative; two-tone `corevalley` (Slate core + Hydro valley) is for light grounds; the gradient cloud / CV brandmark works on both. The terminal `> corevalley_` is a CLI motif, not the logo.
- **Signature graphic:** the dot-matrix ridgeline (`assets/ridgeline.svg`) — monochrome green, never stretched or recolored. Footer band / section break / low-opacity backdrop.
- **Corners tight (4–6px), borders hairline, shadows deep on carbon, the only glow is Hydro green, motion mechanical (no bounce).**
- **No emoji.** Icon language is the terminal (`>`, `$`, `--flags`); functional glyphs use the curated Lucide subset in the `Icon` component.

## What's here
- `styles.css` — link this; it `@import`s all tokens + fonts.
- `tokens/` — colors, typography, spacing, base.
- `assets/` — `logo/` (official vector logo set), `ridgeline.svg`, legacy `logo-mark-glow.jpeg`.
- `guidelines/` — foundation specimen cards (Type, Colors, Spacing, Brand).
- `components/` — React primitives (actions, forms, display, terminal). Runtime namespace `window.CorevalleyDesignSystem_9d3a1a` once `_ds_bundle.js` is loaded; each has a `.prompt.md` with usage.
- `ui_kits/` — `console/` (GPU dashboard) and `marketing/` (landing page) full recreations.
- `readme.md` — the full design guide (content + visual foundations, iconography, manifest).

## Using components in an HTML artifact
Link `styles.css`, load React 18 + Babel + `_ds_bundle.js`, then:
```js
const { Button, Card, Terminal, StatBlock, Icon } = window.CorevalleyDesignSystem_9d3a1a;
```
See any `ui_kits/*/index.html` for the full script wiring.
