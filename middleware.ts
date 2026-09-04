/**
 * Route protection for the console.
 *
 * /portal/* requires a NextAuth session in both modes. An unauthenticated
 * request is bounced to the marketing home page with ?signin=1, which opens
 * the auth modal; `callbackUrl` carries the originally requested page so the
 * user lands where they were headed after Keycloak (or the mock provider)
 * completes.
 *
 * Everything else - marketing pages, /api/auth/*, static assets - is public.
 */
import { auth } from "@/lib/auth";

export default auth((req) => {
  if (req.auth) return;

  const { pathname, search, origin } = req.nextUrl;

  const signInUrl = new URL("/", origin);
  signInUrl.searchParams.set("signin", "1");
  signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
  return Response.redirect(signInUrl);
});

export const config = {
  /* Only the console is gated. Listing it explicitly (rather than a negated
     catch-all) keeps the auth handler itself and every marketing route off
     the middleware path entirely. */
  matcher: ["/portal/:path*"],
};
