# Keycloak Authentication — Implementation Guide

Real OIDC authentication for the CoreValley console, built on **Keycloak 25** and
**NextAuth.js v5 (Auth.js)**.

Keycloak owns identity — login, self-registration, password reset, MFA, brute-force
lockout. The Next.js app never sees a password; it consumes tokens and maps them onto
a `CoreValleyUser`.

---

## Contents

1. [Quick start](#1-quick-start)
2. [How it works](#2-how-it-works)
3. [The three modes](#3-the-three-modes)
4. [File reference](#4-file-reference)
5. [Environment variables](#5-environment-variables)
6. [The Keycloak realm](#6-the-keycloak-realm)
7. [Session shape and types](#7-session-shape-and-types)
8. [Route protection](#8-route-protection)
9. [UI integration](#9-ui-integration)
10. [Token lifecycle](#10-token-lifecycle)
11. [Static export interaction](#11-static-export-interaction)
12. [Operations runbook](#12-operations-runbook)
13. [Verification](#13-verification)
14. [Troubleshooting](#14-troubleshooting)
15. [Design decisions](#15-design-decisions)
16. [Production checklist](#16-production-checklist)

---

## 1. Quick start

Requires Docker and Node 20.9+.

```bash
npm install
npm run keycloak:up          # Keycloak + Postgres, realm imported automatically
cp .env.example .env.local   # already points at the local realm
npm run dev                  # http://localhost:3000
```

Then open <http://localhost:3000>, click **Sign In**, and you land on Keycloak.

| | |
|---|---|
| App | <http://localhost:3000> |
| Keycloak admin console | <http://localhost:8080> — `admin` / `admin` |
| Realm | `corevalley` |
| Client | `corevalley-portal` (confidential) |
| Client secret | `corevalley-portal-dev-secret` |
| Test user (admin) | `kaustuv@corevalley.ai` / `kaustuv123` |
| Test user (member) | `beta@corevalley.ai` / `beta123` |

`AUTH_SECRET` in `.env.example` is a placeholder. Generate a real one:

```bash
npx auth secret          # or: openssl rand -base64 32
```

> **Do not run `npm run build` while `npm run dev` is running.** Both write to
> `.next`. If you see `ENOENT: … .next/server/app/api/auth/[...nextauth]/route.js`,
> that is what happened — `rm -rf .next` and restart.

To skip Docker entirely, delete `.env.local` and run `npm run dev`. The console
falls back to [mock mode](#3-the-three-modes).

---

## 2. How it works

Standard OIDC authorization-code flow with PKCE. NextAuth is the OIDC *client*;
Keycloak is the *provider*.

```mermaid
sequenceDiagram
    actor U as User
    participant B as Browser
    participant N as Next.js
    participant K as Keycloak

    U->>B: visit /portal
    B->>N: GET /portal
    N->>N: middleware.ts — no session
    N-->>B: 302 /?signin=1&callbackUrl=/portal
    B->>B: site-header opens AuthModal
    U->>B: click "Continue with SSO"
    B->>N: POST /api/auth/signin/keycloak
    N-->>B: 302 to Keycloak /auth (+ PKCE challenge)
    B->>K: authorization request
    K-->>U: login form
    U->>K: credentials
    K-->>B: 302 /api/auth/callback/keycloak?code=…
    B->>N: callback with code
    N->>K: POST /token (code + verifier + client secret)
    K-->>N: id_token, access_token, refresh_token
    N->>N: jwt callback — map claims to role/org
    N-->>B: Set-Cookie authjs.session-token; 302 /portal
    B->>N: GET /portal (authenticated)
    N-->>B: console renders with real identity
```

Claims flow through three stages:

```
Keycloak ID token / userinfo        lib/auth.ts jwt()          lib/auth.ts session()
────────────────────────────        ────────────────────       ─────────────────────
sub                             →   token.sub              →   session.user.id
name / preferred_username       →   token.name             →   session.user.name
email                           →   token.email            →   session.user.email
picture                         →   token.picture          →   session.user.image
realm_access.roles              →   token.role             →   session.user.role
org                             →   token.org              →   session.user.org
access_token / refresh_token    →   token.accessToken …    →   session.accessToken
```

---

## 3. The three modes

`lib/auth.ts` picks a mode at import time. **Every mode produces the same
`session.user` shape**, so `middleware.ts`, server components and `useSession()`
never branch on which one is active.

| Mode | Trigger | Providers registered | Sign-in behaviour |
|---|---|---|---|
| **keycloak** | `KEYCLOAK_ISSUER` set | `keycloak`, `keycloak-register` | Real authorization-code flow with PKCE |
| **mock** | `KEYCLOAK_ISSUER` unset | `mock` (Credentials) | Returns `MOCK_USER` with no verification |
| **static demo** | `NEXT_STATIC_EXPORT=true` at build | none (no server exists) | `MOCK_SESSION` is baked into `<SessionProvider>`; the button just navigates |

**Mock mode** exists so the console can be developed with nothing else running. Its
`authorize()` deliberately performs no verification — it is unreachable the moment
`KEYCLOAK_ISSUER` is set, because the provider array is swapped wholesale rather
than appended to.

**Static demo** is the GitHub Pages build. There is no server, so no session can be
fetched; a `Session` object is passed to `<SessionProvider session={…}>`, which
suppresses the initial `/api/auth/session` fetch that would otherwise 404 and leave
every `useSession()` hanging in `loading`.

---

## 4. File reference

### New files

| Path | Purpose |
|---|---|
| `docker-compose.yml` | Keycloak 25 + Postgres 16, `start-dev --import-realm` |
| `keycloak/corevalley-realm.json` | Realm, client, protocol mappers, roles, user profile, seeded users |
| `lib/auth.ts` | Provider selection, claim mapping, token refresh, federated logout |
| `app/api/auth/[...nextauth]/route.node.ts` | The Auth.js request handler |
| `middleware.ts` | Gates `/portal/*` |
| `components/layout/auth-provider.tsx` | `<SessionProvider>` + auth-mode React context |
| `types/next-auth.d.ts` | Module augmentation adding `role` / `org` |
| `.env.example` | Documented environment template |

### Modified files

| Path | Change |
|---|---|
| `app/layout.tsx` | Wraps the tree in `<AuthProvider>`, passing the server-resolved mode |
| `components/layout/auth-modal.tsx` | Collects no credentials; hands off to the IdP |
| `components/layout/site-header.tsx` | Auto-opens the modal on redirect; shows **Console** when signed in |
| `components/layout/portal-shell.tsx` | Real avatar / name / org, plus a sign-out button |
| `next.config.ts` | Conditional `output: "export"`, `pageExtensions`, `NEXT_PUBLIC_STATIC_DEMO` |
| `.github/workflows/deploy.yml` | Sets `NEXT_STATIC_EXPORT=true` for the Pages build |
| `package.json` | `keycloak:up` / `:down` / `:reset` / `:logs` scripts |

### `lib/auth.ts` exports

| Export | Type | Use |
|---|---|---|
| `handlers` | `{ GET, POST }` | Re-exported by the route handler |
| `auth` | function | Server-side session access, and the middleware wrapper |
| `signIn` / `signOut` | function | Server-side (import from `next-auth/react` in client components) |
| `isKeycloakEnabled` | `boolean` | Mode flag — server only |
| `AUTH_PROVIDER_ID` | `string` | Provider id for sign-in (`keycloak` or `mock`) |
| `AUTH_REGISTER_PROVIDER_ID` | `string` | Provider id for sign-up (`keycloak-register` or `mock`) |
| `KEYCLOAK_ISSUER` | `string` | Resolved issuer URL |
| `MOCK_USER` | object | The canned mock-mode user |
| `MOCK_SESSION` | `Session` | `MOCK_USER` shaped as a session, for the static export |
| `authConfig` | `NextAuthConfig` | The raw config, exported for testing |

**Reading the session server-side:**

```ts
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  if (session?.user.role !== "admin") return <Forbidden />;
  return <AdminPanel org={session.user.org} />;
}
```

---

## 5. Environment variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `KEYCLOAK_ISSUER` | to enable Keycloak | — | **Must include the realm**: `http://localhost:8080/realms/corevalley`. Its presence is what selects Keycloak mode. |
| `KEYCLOAK_CLIENT_ID` | no | `corevalley-portal` | |
| `KEYCLOAK_CLIENT_SECRET` | in Keycloak mode | `""` | Client is confidential; a wrong value fails at the token exchange, not at redirect |
| `AUTH_SECRET` | in Keycloak mode | fixed dev value in mock mode | Signs and encrypts the session JWT |
| `NEXTAUTH_URL` | no | inferred | Set when the inferred origin is wrong (proxies, tunnels) |
| `NEXT_STATIC_EXPORT` | no | unset | `true` builds the static Pages bundle |
| `NEXT_PUBLIC_BASE_PATH` | no | `""` | Subpath deployments |

The Auth.js conventional names are accepted as fallbacks: `AUTH_KEYCLOAK_ISSUER`,
`AUTH_KEYCLOAK_ID`, `AUTH_KEYCLOAK_SECRET`, `NEXTAUTH_SECRET`.

`.env.local` is gitignored (`.env*.local`). `.env.example` is committed.

> There is deliberately **no `NEXT_PUBLIC_AUTH_MODE`**. The mode is derived once on
> the server from `KEYCLOAK_ISSUER` and passed to the client as a prop. Two
> variables meaning the same thing eventually disagree.

---

## 6. The Keycloak realm

`keycloak/corevalley-realm.json` is mounted at `/opt/keycloak/data/import` and
imported by `start-dev --import-realm`, using strategy `IGNORE_EXISTING` — it is
imported once, then the database is authoritative. Edits to the JSON require
`npm run keycloak:reset`.

### Realm settings

| Setting | Value | Why |
|---|---|---|
| `registrationAllowed` | `true` | Self-service sign-up for beta testers |
| `registrationEmailAsUsername` | `true` | One identifier, not two |
| `resetPasswordAllowed` | `true` | "Forgot password" without an admin |
| `loginWithEmailAllowed` | `true` | |
| `bruteForceProtected` | `true` | Lockout after repeated failures |
| `sslRequired` | `none` | **Development only** — see the production checklist |
| `accessTokenLifespan` | 900s (15 min) | Short-lived; refreshed silently |
| `ssoSessionIdleTimeout` | 1800s | |

### Client `corevalley-portal`

| Setting | Value |
|---|---|
| Access type | confidential (`publicClient: false`) |
| Standard flow | enabled (authorization code) |
| Direct access grants | enabled — used by the verification script, not by the app |
| PKCE | `S256` enforced |
| Redirect URIs | `http://localhost:3000/api/auth/callback/keycloak`, `http://localhost:3000/*` |
| Web origins | `http://localhost:3000` |
| Post-logout redirect URIs | `http://localhost:3000/*` |

The wildcard covers `/api/auth/callback/keycloak-register` as well. In production,
list both callbacks explicitly and drop the wildcard.

### Protocol mappers

Two custom mappers on the client. Both set `id.token.claim`, `access.token.claim`
**and** `userinfo.token.claim` — Auth.js reads the OIDC profile from the ID token
merged with userinfo, so a mapper that only targets the access token is invisible
to the app.

| Mapper | Type | Claim | Source |
|---|---|---|---|
| `realm roles` | `oidc-usermodel-realm-role-mapper` | `realm_access.roles` (multivalued) | Realm role assignments |
| `organisation` | `oidc-usermodel-attribute-mapper` | `org` | The `org` user attribute |

### Roles

| Role | Meaning |
|---|---|
| `admin` | Full control of the organisation's console |
| `member` | Standard access |

`member` is a composite of `default-roles-corevalley`, so **self-registered users
receive it automatically**. The app is defensive regardless: `roleFromProfile()`
returns `admin` only when `admin` is present in `realm_access.roles`, and `member`
in every other case — including a missing or malformed claim.

### User profile

Keycloak 24+ enables the *declarative user profile*, which rejects attributes it
does not know about. The realm therefore declares `org` explicitly (so it appears
on the registration form and is editable in Account Console) and sets
`unmanagedAttributePolicy: "ENABLED"` so further custom attributes can be added
without another realm edit.

### Seeded users

| Username / email | Password | Realm roles | `org` |
|---|---|---|---|
| `kaustuv@corevalley.ai` | `kaustuv123` | `admin`, `member` | `CoreValley` |
| `beta@corevalley.ai` | `beta123` | `member` | `Himal Analytics` |

---

## 7. Session shape and types

`types/next-auth.d.ts` augments the `next-auth` and `next-auth/jwt` modules. Without
it, `session.user.role` is a type error everywhere.

```ts
session = {
  user: {
    id: string;                    // Keycloak `sub` (a UUID)
    name: string | null;
    email: string;
    image: string | null;
    role: "admin" | "member";
    org: string | null;
  },
  accessToken?: string;            // Keycloak mode only
  error?: "RefreshAccessTokenError";
  expires: string;
}
```

### Claim mapping rules

**`role`** — `admin` if `realm_access.roles` contains `admin`, otherwise `member`.
Fails closed.

**`org`** — the `org` claim (string or first element if multivalued). If absent,
falls back to the **email domain**, so users created before the mapper existed still
resolve to something meaningful. `null` only if there is no email either.

Session strategy is **JWT**, not database. That keeps `middleware.ts` on the Edge
runtime with no per-request database round trip. Session lifetime is 8 hours.

---

## 8. Route protection

`middleware.ts` wraps `auth()` and guards `/portal/:path*`:

```ts
export default auth((req) => {
  if (req.auth) return;
  const { pathname, search, origin } = req.nextUrl;
  const signInUrl = new URL("/", origin);
  signInUrl.searchParams.set("signin", "1");
  signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
  return Response.redirect(signInUrl);
});

export const config = { matcher: ["/portal/:path*"] };
```

Design notes:

- **The matcher lists `/portal` explicitly** rather than using a negated catch-all.
  Marketing routes, `/api/auth/*` and static assets never enter the middleware at
  all, so there is no chance of the auth handler gating itself.
- **`?signin=1`** tells `site-header.tsx` to open the modal, so a redirected user
  gets an explanation rather than a blank home page.
- **`callbackUrl` is a relative path here** and is absolutised in the modal — see
  [§15](#15-design-decisions).
- Auth.js's `authorized` callback exists in the config but the middleware does its
  own check, because `authorized` cannot construct a `callbackUrl` pointing at the
  originally requested page.

Adding another protected area is a one-line change:

```ts
matcher: ["/portal/:path*", "/admin/:path*"]
```

---

## 9. UI integration

### `components/layout/auth-provider.tsx`

A client component holding `<SessionProvider>` plus an `AuthModeContext`. The mode
travels from server to client as props, not environment variables:

```tsx
// app/layout.tsx (server component)
<AuthProvider
  keycloak={isKeycloakEnabled}
  staticDemo={process.env.NEXT_PUBLIC_STATIC_DEMO === "true"}
  providerId={AUTH_PROVIDER_ID}
  registerProviderId={AUTH_REGISTER_PROVIDER_ID}
  demoSession={MOCK_SESSION}
>
```

Consume it with `useAuthMode()`.

### `components/layout/auth-modal.tsx`

**Collects no credentials.** There is no email field, no password field, no
hardcoded comparison. The single button calls `signIn()`:

| Mode | Button action |
|---|---|
| Sign in | `signIn("keycloak", { callbackUrl })` |
| Sign up | `signIn("keycloak-register", { callbackUrl })` → Keycloak's Register screen |
| Mock | `signIn("mock", { callbackUrl })` |
| Static demo | `router.push(callbackPath)` |

It also renders Auth.js error codes arriving on `/?error=` (`Configuration`,
`AccessDenied`, `OAuthCallbackError`, …) as readable messages, and shows a footer
line naming the active mode so nobody mistakes mock for real.

### `components/layout/site-header.tsx`

Opens the modal when the URL carries `?signin=1` or `?error=`, and replaces the
Sign In / Sign Up pair with a **Console** link once `status === "authenticated"`.

### `components/layout/portal-shell.tsx`

The sidebar footer shows the real identity: Keycloak profile picture when the realm
supplies one, two-letter initials otherwise; display name; organisation; and a
sign-out button calling `signOut({ callbackUrl: "/" })`. The topbar avatar links to
settings and carries the email as its tooltip.

---

## 10. Token lifecycle

### Refresh

Keycloak access tokens live 15 minutes; the app session lives 8 hours. The `jwt`
callback refreshes 30 seconds before expiry:

```
token.expiresAt reached?  →  POST {issuer}/protocol/openid-connect/token
                             grant_type=refresh_token
                          →  success: new access/id/refresh token + expiresAt
                          →  failure: token.error = "RefreshAccessTokenError"
```

`session.error` surfaces the failure so a client can force re-authentication:

```tsx
const { data: session } = useSession();
if (session?.error === "RefreshAccessTokenError") signIn("keycloak");
```

### Federated logout

`signOut()` alone clears only the app's cookie. The Keycloak SSO cookie would
survive, and the next sign-in would complete silently with no prompt — which looks
exactly like sign-out being broken.

The `signOut` **event** therefore calls Keycloak's end-session endpoint with the
stored `id_token_hint`. Failures are swallowed: a back-channel problem must not
block the local sign-out.

---

## 11. Static export interaction

The marketing site deploys to GitHub Pages as a static export. `output: "export"`
cannot host a dynamic route handler:

```
Error: export const dynamic = "force-static"/export const revalidate not configured
on route "/api/auth/[...nextauth]" with "output: export"
```

The fix is to make the file invisible to that build:

```ts
// next.config.ts
const staticExport = process.env.NEXT_STATIC_EXPORT === "true";

...(staticExport ? { output: "export" as const } : {}),

pageExtensions: staticExport
  ? ["tsx", "ts", "jsx", "js"]
  : ["node.ts", "tsx", "ts", "jsx", "js"],
```

The handler is named **`route.node.ts`**. Next.js only treats a file as a route when
its extension is in `pageExtensions`; `node.ts` is listed for server builds only. In
the static build the file is not a route, and `route.node.ts` does not match plain
`ts` either (the route name would be `route.node`). No stub handler, no conditional
`export const dynamic`, no duplicated source.

| | Server build (default) | Static build (`NEXT_STATIC_EXPORT=true`) |
|---|---|---|
| Output | `.next` | `out/` |
| `/api/auth/*` | present, dynamic | absent |
| Middleware | enforced | not executed |
| Auth | Keycloak or mock | baked-in demo session |
| Used by | `npm run dev`, hosted deploys | `.github/workflows/deploy.yml` |

---

## 12. Operations runbook

### Container lifecycle

```bash
npm run keycloak:up      # start; imports the realm on first run
npm run keycloak:logs    # tail Keycloak
npm run keycloak:down    # stop, keep data
npm run keycloak:reset   # destroy the volume and re-import the realm
```

Health: Postgres uses `pg_isready`; Keycloak is probed over bash `/dev/tcp` against
the **management port 9000**. Keycloak 25 does not serve `/health/ready` on 8080 —
it 404s there.

### Admin tasks

All at <http://localhost:8080> → realm **corevalley**.

| Task | Where |
|---|---|
| Add a user | Users → Add user → Credentials tab → Role mapping tab |
| Grant admin | Users → *user* → Role mapping → Assign `admin` |
| Set organisation | Users → *user* → Attributes → `org` |
| Require MFA | Authentication → Required actions → Configure OTP |
| Enable email (reset links) | Realm settings → Email |
| Change the client secret | Clients → `corevalley-portal` → Credentials |

Changes made in the console live in Postgres, not in the JSON. To make one
permanent, either export the realm over the console and replace
`keycloak/corevalley-realm.json`, or edit the JSON and `npm run keycloak:reset`.

### Adding a role the app understands

1. Realm roles → Create role.
2. Assign it to users.
3. Extend `CoreValleyRole` in `types/next-auth.d.ts`.
4. Extend `roleFromProfile()` in `lib/auth.ts`.

The mapper needs no change — it already forwards every realm role.

---

## 13. Verification

Everything below was executed against the running stack.

| Check | Result |
|---|---|
| Realm imported | `Realm 'corevalley' imported` in the container log |
| Discovery document | `200` at `/realms/corevalley/.well-known/openid-configuration` |
| ID token claims | `realm_access.roles: [… admin …]`, `org: "CoreValley"` |
| Userinfo claims | same `realm_access` and `org` |
| `/portal` unauthenticated | `302 → /?signin=1&callbackUrl=%2Fportal` |
| Providers (Keycloak mode) | `keycloak`, `keycloak-register` |
| Sign-in redirect | Keycloak `/auth` with `code_challenge_method=S256` |
| Sign-up redirect | Keycloak `/registrations` with PKCE |
| Registration form | renders with `email`, `firstName`, `lastName`, `password`, `org` |
| Full code flow | login form → callback → session → `/portal` `200` |
| Session contents | `role=admin`, `org=CoreValley`, Keycloak `sub` as id |
| `callbackUrl` honoured | lands on `/portal/pods`, not `/` |
| Sign-out | session `null`, `/portal` re-gated |
| Federated logout | re-authorize renders the login form (SSO session gone) |
| Mock mode | only `mock` registered; identical session shape; `/portal` `200` |
| Health checks | `keycloak` and `postgres` both `healthy` |
| `npm run lint` | clean |
| Server build | passes — `/api/auth/[...nextauth]` dynamic, middleware 88 kB |
| Static build | passes — no `/api` in `out/` |

### Re-running the end-to-end flow

Drives the complete authorization-code flow from the shell, no browser required:

```bash
CSRF=$(curl -s -c app.txt http://localhost:3000/api/auth/csrf \
  | node -pe "JSON.parse(require('fs').readFileSync(0)).csrfToken")

KCURL=$(curl -s -b app.txt -c app.txt -o /dev/null -w '%{redirect_url}' \
  -X POST http://localhost:3000/api/auth/signin/keycloak \
  -d "csrfToken=$CSRF" -d 'callbackUrl=http://localhost:3000/portal/pods')

curl -s -c kc.txt "$KCURL" -o login.html
ACTION=$(node -pe "require('fs').readFileSync('login.html','utf8').match(/id=\"kc-form-login\"[^>]*action=\"([^\"]+)\"/)[1].replace(/&amp;/g,'&')")

CB=$(curl -s -b kc.txt -c kc.txt -o /dev/null -w '%{redirect_url}' -X POST "$ACTION" \
  --data-urlencode 'username=kaustuv@corevalley.ai' \
  --data-urlencode 'password=kaustuv123')

curl -s -b app.txt -c app.txt -o /dev/null -w 'lands on: %{redirect_url}\n' "$CB"
curl -s -b app.txt http://localhost:3000/api/auth/session
```

Expected: `lands on: http://localhost:3000/portal/pods`, then a session JSON with
`"role":"admin"` and `"org":"CoreValley"`.

Note the **absolute** `callbackUrl` — see the next section.

---

## 14. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Sign-in always lands on `/` | Relative `callbackUrl` — Auth.js's signin endpoint silently discards it and sets no `authjs.callback-url` cookie | Pass an absolute URL. The modal does this already; replicate it in any new caller |
| `ENOENT … .next/server/app/api/auth/[...nextauth]/route.js` | Static-export `.next` reused by the dev server | `rm -rf .next`, restart |
| `/api/auth/providers` returns the 404 page | Same stale/static `.next`, or `NEXT_STATIC_EXPORT` still set | Unset it, `rm -rf .next` |
| Keycloak container stuck `unhealthy` | Probing `/health/ready` on 8080 | Health lives on port 9000 in KC 25 |
| `invalid_request: Missing parameter: code_challenge_method` | Authorization URL built by hand without PKCE | The client requires `S256`; let Auth.js build the URL |
| `error=OAuthCallbackError` | Redirect URI not registered, or wrong client secret | Compare Clients → `corevalley-portal` → Credentials against `.env.local` |
| `error=Configuration` | `KEYCLOAK_ISSUER` unreachable or missing the realm path | Must end `/realms/corevalley` |
| Signed out, but signing back in needs no password | Federated logout failed | Check the `signOut` event; confirm the realm's post-logout redirect URIs |
| `session.user.role` is a type error | `types/next-auth.d.ts` not picked up | It must be inside `include` in `tsconfig.json` |
| `org` is a domain name, not the organisation | The user has no `org` attribute | Set it in Users → Attributes; the fallback is the email domain |
| Realm edits to the JSON have no effect | Import strategy is `IGNORE_EXISTING` | `npm run keycloak:reset` |
| Portal shows "Account" and no name | `useSession()` returned nothing — usually a missing `<AuthProvider>` | It is mounted in `app/layout.tsx` |

---

## 15. Design decisions

<details>
<summary><b>Relative <code>callbackUrl</code> is silently dropped by Auth.js</b></summary>

<br>

Posting `callbackUrl=/portal/pods` to `/api/auth/signin/keycloak` sets **no**
`authjs.callback-url` cookie, so the callback falls back to the site root — every
sign-in landed on `/`. Posting `callbackUrl=http://localhost:3000/portal/pods` sets
it correctly.

The modal therefore absolutises before calling `signIn()`:

```ts
callbackUrl: new URL(callbackPath, window.location.origin).href
```

Because `?callbackUrl=` is attacker-controllable, `safePath()` first rejects
anything that is not a same-site path — notably `//evil.com`, which is a
protocol-relative URL, not a path.
</details>

<details>
<summary><b>Registration needs its own provider entry</b></summary>

<br>

Keycloak serves registration from `/protocol/openid-connect/registrations`, a
*sibling* of the authorization endpoint — not a parameter on it. (`kc_action` is
for required actions like `UPDATE_PASSWORD`; there is no `kc_action=register`.)

So `keycloak-register` is a second `Keycloak()` entry overriding only
`authorization.url`. OIDC discovery still supplies the token, userinfo and JWKS
endpoints, and the client, realm and callback handling are shared. Only the first
screen the user sees differs.
</details>

<details>
<summary><b>Why mock mode is a Credentials provider</b></summary>

<br>

The earlier approach — an empty `providers: []` with a JWT populated in the `jwt`
callback — cannot work. With no provider there is no sign-in, so no token cookie is
ever issued, so `auth()` returns `null` forever and `/portal` is permanently locked.
The `jwt` callback only runs during sign-in or session refresh; it cannot conjure a
session from nothing.

A Credentials provider gives mock mode a real sign-in that mints a real cookie, so
the two modes exercise identical code paths.
</details>

<details>
<summary><b>One mode flag, derived on the server</b></summary>

<br>

`KEYCLOAK_ISSUER` is server-only, so client components cannot read it. The obvious
workaround is a parallel `NEXT_PUBLIC_AUTH_MODE`, which then has to be kept in sync
by hand and eventually disagrees — producing a UI that offers SSO while the server
has only the mock provider.

Instead the root layout (a server component) reads `isKeycloakEnabled` once and
passes it down through `AuthProvider`. One source of truth, no duplicated variable.
</details>

<details>
<summary><b>Mappers target the ID token and userinfo, not just the access token</b></summary>

<br>

Auth.js builds its OIDC `profile` from the ID token merged with the userinfo
response. A protocol mapper configured only with `access.token.claim` is invisible
to the app, and `role` silently degrades to `member` for everyone. Both custom
mappers set all three claim targets.
</details>

<details>
<summary><b>JWT sessions, not database sessions</b></summary>

<br>

Middleware runs on the Edge runtime. A database session strategy would need an
adapter and a query on every request into `/portal`. JWT sessions keep the check
local to the request; the cost is that revoking a session before its 8-hour expiry
requires the Keycloak side (which federated logout handles).
</details>

---

## 16. Production checklist

Everything below is development-grade and **must** change before this faces real
users.

- [ ] **Secrets** — `corevalley-portal-dev-secret` and `admin`/`admin` are in a
      committed file. Rotate both; inject via a secret manager.
- [ ] **`AUTH_SECRET`** — generate per environment (`npx auth secret`); never reuse.
- [ ] **TLS** — realm `sslRequired` is `none`. Set `external` (or `all`) and serve
      Keycloak over HTTPS.
- [ ] **Run mode** — replace `start-dev` with `start`, and set `KC_HOSTNAME` to the
      real hostname with `KC_HOSTNAME_STRICT=true`.
- [ ] **Redirect URIs** — drop the `http://localhost:3000/*` wildcard; list the two
      callback URLs explicitly.
- [ ] **Postgres** — the compose Postgres is a dev convenience. Use a managed
      instance with backups.
- [ ] **Email** — configure SMTP, then enable `verifyEmail` so password reset and
      verification actually deliver.
- [ ] **MFA** — add OTP as a required action, or a conditional browser flow.
- [ ] **Registration** — `registrationAllowed: true` lets anyone create an account.
      For a closed beta, disable it and invite users, or gate on email domain.
- [ ] **Authorization** — `role` is mapped but not yet enforced beyond
      authentication. Add per-route or per-action checks where `admin` matters.
- [ ] **Mock mode** — verify `KEYCLOAK_ISSUER` is set in every deployed environment.
      Unset, the app signs everyone in as an admin.

---

## Appendix: quick reference

```bash
# Stack
npm run keycloak:up | :down | :reset | :logs
docker compose ps

# App
npm run dev                       # server build, real auth
npm run build && npm start        # production server build
NEXT_STATIC_EXPORT=true npm run build   # static ./out for Pages
npm run lint
npm run typecheck

# Endpoints
http://localhost:3000/api/auth/providers
http://localhost:3000/api/auth/session
http://localhost:3000/api/auth/signin/keycloak
http://localhost:3000/api/auth/callback/keycloak
http://localhost:8080/realms/corevalley/.well-known/openid-configuration
```
