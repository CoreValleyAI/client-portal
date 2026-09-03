# Console UI Kit — Corevalley GPU console

An interactive recreation of the Corevalley GPU/AI compute console. It is a
high-fidelity **brand recreation** extrapolated from Brand Guidelines v1.0 — no
production codebase or Figma was provided, so treat it as a faithful on-brand
mock, not a copy of a shipped product.

## Run
Open `index.html`. Requires the compiled `_ds_bundle.js` at the project root
(generated automatically by the design-system compiler).

## Flow
1. **Login** — terminal-styled access card over the ridgeline; "Continue" or the SSH button enters the console.
2. **Overview** — stat row, a live deploy terminal, and the regions panel.
3. **Instances** — filterable table with status, utilization meters, uptime and cost.
4. **Deploy** — a right slide-over (region → GPU → count → spot) with a live command preview and price estimate.

Sidebar nav also exposes storage/regions/usage/settings as placeholder surfaces.

## Files
- `index.html` — entry + script wiring (also a `@dsCard` + `@startingPoint`).
- `data.js` — fake regions / GPUs / instances (`window.CV_DATA`).
- `parts.jsx` — `Wordmark`, `StatusPill`, `UtilBar` (`window.CVKit`).
- `LoginScreen.jsx`, `Shell.jsx` (sidebar + header), `Views.jsx` (overview + instances), `DeployPanel.jsx`, `App.jsx` (orchestrator).

All screens compose primitives from `window.CorevalleyDesignSystem_9d3a1a`
(Button, Card, Badge, Tag, Input, Switch, Terminal, StatBlock, Icon, …).
