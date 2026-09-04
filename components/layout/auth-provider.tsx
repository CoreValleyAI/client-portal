"use client";

/**
 * Client-side auth context for the whole app.
 *
 * Wraps NextAuth's <SessionProvider> so `useSession()` works anywhere, and
 * carries the server's auth mode down to the client. The mode is a server
 * fact (it depends on KEYCLOAK_ISSUER, which is not a NEXT_PUBLIC_ variable),
 * so it is passed as a prop from the root layout instead of being read from
 * the environment twice and drifting.
 *
 * Three shapes:
 *   keycloak     - real OIDC, session fetched from /api/auth/session
 *   mock         - local Credentials provider, still a real server session
 *   static demo  - the GitHub Pages export. There is no server at all, so a
 *                  session object is baked in and the fetch is disabled;
 *                  without it every useSession() call would hang on a 404.
 */
import * as React from "react";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

const AuthModeContext = React.createContext<{
  /** True when sign-in is delegated to Keycloak; false in mock mode. */
  keycloak: boolean;
  /** True in the static export, where no auth endpoints exist. */
  staticDemo: boolean;
  /** The NextAuth provider id to pass to signIn() for an existing account. */
  providerId: string;
  /** The provider id that lands on the identity provider's Register screen. */
  registerProviderId: string;
}>({
  keycloak: false,
  staticDemo: false,
  providerId: "mock",
  registerProviderId: "mock",
});

export function useAuthMode() {
  return React.useContext(AuthModeContext);
}

export function AuthProvider({
  keycloak,
  staticDemo,
  providerId,
  registerProviderId,
  demoSession,
  children,
}: {
  keycloak: boolean;
  staticDemo: boolean;
  providerId: string;
  registerProviderId: string;
  demoSession: Session;
  children: React.ReactNode;
}) {
  const mode = React.useMemo(
    () => ({ keycloak, staticDemo, providerId, registerProviderId }),
    [keycloak, staticDemo, providerId, registerProviderId],
  );

  return (
    <AuthModeContext.Provider value={mode}>
      {/* Passing `session` seeds the provider and suppresses the initial
          fetch, which is exactly what the endpoint-less static export needs.
          refetchOnWindowFocus keeps a live console tab left open overnight
          from showing a stale identity after the session expires. */}
      <SessionProvider
        session={staticDemo ? demoSession : undefined}
        refetchOnWindowFocus={!staticDemo}
        refetchInterval={0}
      >
        {children}
      </SessionProvider>
    </AuthModeContext.Provider>
  );
}
