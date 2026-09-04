/**
 * The NextAuth.js catch-all handler.
 *
 * Serves /api/auth/signin, /signout, /callback/keycloak, /session, /csrf and
 * /providers.
 *
 * The `.node.ts` suffix is deliberate: `pageExtensions` in next.config.ts only
 * includes it for server builds, so the static GitHub Pages export - which
 * cannot host a dynamic route handler - skips this file instead of failing
 * the build.
 */
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
