<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/brand/cv-combinedmark-green.svg">
  <img src="public/brand/cv-combinedmark.svg" alt="CoreValley" width="220">
</picture>

### Nepal's Sovereign AI Cloud

**Build, fine-tune and deploy AI without leaving Nepal.**

Marketing site and customer portal for CoreValley — NVIDIA H100 and H200
infrastructure hosted in Kathmandu, billed in NPR, with full in-country data
residency.

<br>

![Next.js](https://img.shields.io/badge/Next.js-15.5-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-087EA4?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)

</div>

---

## ⚠️ Not production-ready yet

Three things must be resolved before this is published:

| Blocker | Where | Detail |
|---|---|---|
| **Placeholder pricing** | `lib/catalog.ts` | All 24 NPR rates were invented for UI development. None has commercial approval. |
| **No authentication** | `components/layout/auth-modal.tsx` | The sign-in modal sets a cookie and redirects. There is no auth. |
| **Mock data only** | `lib/api/mock.ts` | The portal runs on an in-memory mock. No backend is wired. |

Placeholder pricing is enforced in three layers so it cannot ship by accident:
every rate is wrapped in `p(paisa, why)`, every rate object carries
`placeholder: true` into the rendered data, and `CATALOG.meta.pricingIsPlaceholder`
drives a visible badge on `/pricing`, `/portal/billing`, `/portal/models` and the
pod launch wizard.

```bash
grep -c "p(NPR" lib/catalog.ts   # rates still awaiting approval
```

To go live: replace the numbers, set `pricingIsPlaceholder` to `false`, and fill
in `meta.reviewedAt`.

---

## Quick start

Requires **Node 20.9+**.

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run generate:basemap` | Regenerate the map data in `lib/mesh-basemap.ts` |
| `npm run keycloak:up` | Start Keycloak + Postgres and import the `corevalley` realm |
| `npm run keycloak:down` | Stop them (data is kept) |
| `npm run keycloak:reset` | Drop the volume and re-import the realm from scratch |
| `npm run keycloak:logs` | Tail the Keycloak container |

> **Never run `npm run build` while a dev or production server is running.**
> Both write to `.next`, and the result is a split-brain build that fails at
> runtime with `Cannot find module './NNN.js'`. If you hit it:
> `rm -rf .next && npm run build`.

---

## Authentication

Real OIDC through **Keycloak**, wired up with **NextAuth.js v5 (Auth.js)**.
Keycloak owns login, registration, password reset and MFA; the app only
consumes tokens.

> **Full implementation guide: [`KeyCloak_Readme.md`](KeyCloak_Readme.md)** —
> architecture, realm reference, claim mapping, token lifecycle, operations
> runbook, troubleshooting and the production checklist. The summary below is
> just enough to get running.

### Beta testing against a local Keycloak

```bash
npm run keycloak:up               # Keycloak 25 + Postgres, realm auto-imported
cp .env.example .env.local        # already points at the local realm
npm run dev
```

| | |
|---|---|
| Admin console | <http://localhost:8080> — `admin` / `admin` |
| Realm | `corevalley` (imported from `keycloak/corevalley-realm.json`) |
| Client | `corevalley-portal`, confidential, secret `corevalley-portal-dev-secret` |
| Test user | `kaustuv@corevalley.ai` / `kaustuv123` — realm role `admin` |
| Test user | `beta@corevalley.ai` / `beta123` — realm role `member` |

The realm ships with self-registration and password reset enabled, so the
"Create an account" button lands directly on Keycloak's Register screen.

### Three modes, one session shape

`lib/auth.ts` picks a mode from the environment. Every consumer —
`middleware.ts`, server components, `useSession()` — sees the same
`session.user` (`id`, `name`, `email`, `image`, `role`, `org`) regardless.

| Mode | Trigger | Sign-in |
|---|---|---|
| **keycloak** | `KEYCLOAK_ISSUER` set | Real OIDC authorization-code flow |
| **mock** | `KEYCLOAK_ISSUER` unset | Local Credentials provider returning a seeded user — lets you work on the console with nothing else running |
| **static demo** | `NEXT_STATIC_EXPORT=true` | No server exists, so a session object is baked into `<SessionProvider>` at build time |

`role` comes from Keycloak's `realm_access.roles` (`admin` if present, else
`member`); `org` comes from a custom `org` user attribute, falling back to the
email domain. Both are exposed through protocol mappers declared in the realm
export, and typed by module augmentation in `types/next-auth.d.ts`.

### Files

| Path | Role |
|---|---|
| `docker-compose.yml` | Keycloak 25 + Postgres 16, `start-dev --import-realm` |
| `keycloak/corevalley-realm.json` | Realm, client, protocol mappers, roles, seeded users |
| `lib/auth.ts` | Provider selection, token → user mapping, refresh, RP-initiated logout |
| `app/api/auth/[...nextauth]/route.node.ts` | The Auth.js handler |
| `middleware.ts` | Gates `/portal/*`, redirects to `/?signin=1&callbackUrl=…` |
| `components/layout/auth-provider.tsx` | `<SessionProvider>` + the server's auth mode as context |
| `components/layout/auth-modal.tsx` | Hands off to the IdP — collects no credentials |
| `types/next-auth.d.ts` | `role` / `org` module augmentation |

<details>
<summary><b>Why the auth route is named <code>route.node.ts</code></b></summary>

<br>

The marketing site deploys to GitHub Pages as a static export, and
`output: "export"` refuses to build a dynamic route handler. `pageExtensions`
in `next.config.ts` only includes `node.ts` for server builds, so the static
build simply does not see the file — no stub handler, no conditional
`export const dynamic`, and the server build is unaffected.

Static export also drops middleware, which is why that build falls back to the
baked-in demo session rather than pretending to gate anything.

</details>

<details>
<summary><b>Access-token refresh and federated logout</b></summary>

<br>

Keycloak access tokens live 15 minutes; the NextAuth session lives 8 hours. The
`jwt` callback refreshes silently 30 seconds before expiry and marks
`session.error = "RefreshAccessTokenError"` if the refresh token is gone.

`signOut()` alone would clear only the app cookie — the Keycloak SSO cookie
would survive and the next sign-in would succeed with no prompt. The `signOut`
event therefore calls Keycloak's `end_session_endpoint` with the stored
`id_token_hint`.

</details>

---

## What's in it

**24 routes.** Public pages are statically prerendered; the portal is
`force-dynamic` and never prerendered.

### Marketing

| Route | Page |
|---|---|
| `/` | Homepage — animated hero, latency mesh, platform, fleet, architecture |
| `/products` · `/products/[slug]` | Overview plus GPU Pods, JupyterHub, Model Endpoints, Dedicated |
| `/use-cases` | Nepali-language LLMs, banking, healthcare, government, research, startups |
| `/company` | Mission, principles, audiences, contact |
| `/pricing` | Live NPR/USD and hourly/monthly toggles, comparison table, FAQ |
| `/docs` · `/docs/[...slug]` | Quickstart, CLI reference, API reference |
| `/contact` | Sales enquiry form (posts to FormSubmit — no backend needed) |

### Portal

Overview · Pods (list, launch wizard, live detail) · JupyterHub · Model
endpoints · API keys · Dedicated nodes · vClusters · Network policy · Usage ·
Billing · Audit log · Security · Settings

---

## Tech stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript 5.9** (strict, with `noUncheckedIndexedAccess`)
- **Tailwind CSS v4** bridged onto the existing design-system CSS tokens
- **CVA** for component variants, **Phosphor Icons** for glyphs
- No CSS-in-JS, no animation library — canvas and CSS only

Deploys anywhere Next.js runs. `output` is unset, so `npm run build && npm start`
works as-is behind any reverse proxy.

---

## Project structure

```
app/
  (marketing)/      public pages — statically prerendered
  (portal)/         authenticated console — force-dynamic
components/
  ui/               11 design-system primitives (9 server, 2 client)
  layout/           header, footer, portal shell, logo, auth modal
  marketing/        hero canvas, latency mesh, pricing tables, spotlight
  portal/           status pills, meters, launch wizard, charts
lib/
  catalog.ts        ⚠ placeholder NPR rates — the single edit point
  money.ts          integer-paisa arithmetic and NPR/USD formatting
  api/              client interface, mock and HTTP implementations
  mesh-basemap.ts   generated map data — do not edit by hand
design_system/      read-only source of truth (also a Claude skill folder)
reference/          the previous static site, archived
scripts/            build-time generators
```

`design_system/` must stay where it is — it carries `SKILL.md` frontmatter and
moving it breaks skill discovery. Nothing under `app/` or `components/` imports
from it directly; an ESLint rule enforces that boundary.

---

## Design system integration

`app/globals.css` is the load-bearing file. The design-system token files remain
the single source of truth — **no value is ever restated**. Tailwind is imported
first, then the tokens are imported into `@layer theme` *after* it, so same-named
tokens win by source order: `rounded-md` becomes 6px and `text-sm` becomes 13px
for free.

<details>
<summary><b>Five rules that break silently if changed</b></summary>

<br>

1. **`base.css` is imported into `layer(base)`, never unlayered.** Unlayered CSS
   beats every cascade layer, so an unlayered `body { background }` would defeat
   `bg-carbon-800` on the body.
2. **`--container-*: initial` deletes Tailwind's container namespace.** The design
   system's 640/960/1200/1400px would otherwise redefine `max-w-sm..xl` and make
   the scale non-monotonic. Page widths are `max-w-page-*`.
3. **Token files are never placed inside `@theme`.** `--text-primary` is a
   *colour* sharing Tailwind's font-size namespace; registering it would generate
   `.text-primary { font-size: <a colour> }`.
4. **Semantic aliases are renamed on the bridge:** `fg-*` for text roles (not
   `text-*`, which would yield `text-text-muted`) and `line-*` for hairlines.
5. **`tokens/fonts.css` is not imported.** `next/font` self-hosts both faces;
   importing the CDN copy too would double-download and reintroduce layout shift.

</details>

<details>
<summary><b>Deliberate deviations from the design system</b></summary>

<br>

| Deviation | Why |
|---|---|
| **Glassmorphism** replaces "transparency and blur, sparingly" | Explicit client direction. Ground, accent, motion, corners and the no-emoji rule are unchanged. Four sanctioned recipes exist as `@utility` (`glass-card`, `glass-nav`, `glass-modal`, `glass-panel`), each with a solid fallback under `@supports not (backdrop-filter)`. |
| **Phosphor Icons** replaces the hand-rolled 30-glyph Lucide subset | The subset had no glyphs for API keys, invoices, certificates, clusters or charts. Wrapped behind a closed `IconName` union, so swapping libraries is a one-file change. |
| **CVA + Tailwind** replaces the primitives' inline styles | The originals drove hover and press through `useState`, forcing `"use client"` on 7 of 11 components, dragging icon path data into the client bundle, and breaking hover for keyboard users while latching it on touch. Moving state to CSS inverts the ratio to **9 server, 2 client**. |

**Design-system values carried over verbatim.** These are off-scale in the design
system itself and were preserved for fidelity rather than silently "fixed" —
worth raising with the designer:

- `Button` size `md` is `14px`; the type scale has 13 and 15, not 14.
- `Terminal` body text is `13.5px`, also off-scale.
- `Terminal` window dots are `#2A2F38`, which has no token.
- `Button` hover glow is `rgba(74,222,128,0.30)` while `--glow-hydro-md` is `0.40`.

</details>

---

## Data layer

`lib/api/client.ts` defines `CoreValleyClient` — 71 methods covering every portal
screen. Two implementations satisfy it:

- **`mock.ts`** — in-memory, seeded by a deterministic PRNG so server and client
  render identically. Pod launches run real status transitions
  (`queued → provisioning → pulling-image → running`), and **invoices are computed
  from usage events**, so billing always reconciles with the usage screens.
- **`http.ts`** — every method throws `NotImplementedError`. Written *before* the
  mock, to prove the interface is implementable over plain REST.

Both assert `satisfies CoreValleyClient`, so signature drift is a compile error.

```bash
NEXT_PUBLIC_API_MODE=http npm run build   # compiles against the real-backend stub
```

`subscribe*` methods return an `Unsubscribe` rather than exposing an
`EventSource`: the mock uses `setInterval`, a real backend will use SSE, and no
screen changes either way.

**Money is integer paisa everywhere** (`lib/money.ts`). Per-second GPU metering
aggregated over a month is millions of additions, and float drift there is
measured in rupees. Formatting happens only at the render edge. USD is indicative
display only, with a `rateAsOf` date and a disclaimer wherever shown.

<details>
<summary><b>MIG vs HAMi — modelled as different products</b></summary>

<br>

- **MIG** partitions the GPU in hardware. Tenants are fault-isolated.
- **HAMi** slices in software by memory and compute share on a card you may be
  sharing. Denser and cheaper — and priced *below* the comparable MIG tier
  because there is no fault isolation.

The UI labels the difference rather than hiding it. Conflating them is the most
likely modelling error to introduce here.

</details>

---

## Notable implementation details

<details>
<summary><b>Hero canvas — layered snow-capped range</b></summary>

<br>

`components/marketing/hero-canvas.tsx`. Built the way a landscape painter would:
a lit horizon band, then three layers in aerial perspective — hazy blue-grey at
the back, near-black at the front — each a solid gradient-filled mass, lighter at
the ridge and darker at the base. Snow is a bright wash clipped to each silhouette
from the summits down to the snowline, so every cap takes the shape of its own
peak.

Skylines come from **placed peaks** (4 major at the back, 3 mid, 2 front, each
with jittered width, height, sharpness and asymmetric skew) rather than octaves of
noise. An earlier noise-based version produced a dense sawtooth that read as
jagged lines; the fills were also the same colour as the sky, so only the strokes
rendered. Both are documented in the file header.

Pointer parallax by depth, particle repulsion, and a Hydro bloom that follows the
cursor — all disabled for coarse pointers and `prefers-reduced-motion`, which
renders one static frame and never starts the loop.

</details>

<details>
<summary><b>Sovereign latency mesh — real regional basemap</b></summary>

<br>

`components/marketing/sovereign-mesh.tsx`. Country outlines come from Natural
Earth via `world-atlas`, clipped to a South Asia window and projected into a 0–1
unit box at build time:

```bash
npm run generate:basemap    # rewrites lib/mesh-basemap.ts
```

`lib/mesh-basemap.ts` is **generated and committed — do not edit it by hand**.
`world-atlas` and `topojson-client` are devDependencies only; nothing geo ships to
the browser, just 67 path strings (~8 KB gzipped) and the projection function.

Cities are plotted at their **real coordinates** through the same `projectToUnit`
the paths were generated with — that is what keeps a marker on the right piece of
coastline. An earlier version placed nodes on a radial latency scale, which
stacked four regional tiers between 22% and 38% of the radius while US-East sat
alone at 100%. Radius now carries no meaning; the metric lives in the label, the
particle speed and the curve opacity.

Label collisions are handled by per-city anchors in `lib/mesh-nodes.ts` — Kolkata
and Dhaka are only ~25 px apart at desktop size. If you add a city, check its
spacing before trusting the default.

</details>

<details>
<summary><b>Ridgeline asset — 5,439 circles</b></summary>

<br>

`public/brand/ridgeline.v1.svg` holds 5,439 `<circle>` elements. It is served as
an `<img>` or a CSS background, **never inlined** — inlining would put all 5,439
nodes in the main DOM and ~273 KB of uncompressed markup into the RSC payload on
every render. It is 23 KB gzipped on the wire and carries an immutable cache
header. Use `object-cover`, never `100% 100%`: the brandbook forbids stretching
the aspect ratio.

</details>

---

## Verification

```bash
npm run typecheck && npm run lint && npm run build
NEXT_PUBLIC_API_MODE=http npx next build   # proves the interface swap compiles
```

The build output is itself a check: every `(marketing)` route must be `○ (Static)`
and every `/portal` route must be `ƒ (Dynamic)`. A portal route appearing as
static means one account's data is being baked into the HTML.

Additional checks worth running before a release:

- No emoji anywhere (`app/`, `components/`, `lib/`) — a brandbook rule.
- No raw hex outside `design_system/` and `lib/catalog.ts`.
- Disable `backdrop-filter` in DevTools — every glass panel must fall back to
  solid carbon and stay readable.
- Enable OS reduce-motion — the hero must render a static frame and start no
  animation loop.

---

## Credits

| Asset | Source | Licence |
|---|---|---|
| Country outlines | [Natural Earth](https://www.naturalearthdata.com/) via [world-atlas](https://github.com/topojson/world-atlas) | Public domain |
| Icons | [Phosphor Icons](https://phosphoricons.com/) | MIT |
| Manrope · JetBrains Mono | Google Fonts, self-hosted via `next/font` | SIL Open Font License 1.1 |
| Brand marks, ridgeline, design tokens | CoreValley Brand Guidelines v1.0 | Proprietary — see `design_system/` |

Brand assets in `assets/`, `public/brand/` and `design_system/` are proprietary to
CoreValley and are not covered by any open-source licence.

---

<div align="center">
<sub><b>CoreValley AI</b> · Kathmandu, Nepal · <a href="mailto:info@corevalley.ai">info@corevalley.ai</a></sub>
</div>
