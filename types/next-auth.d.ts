/**
 * Module augmentation for NextAuth.js v5.
 *
 * `role` and `org` are CoreValley concepts mapped out of the Keycloak token
 * (realm_access.roles and the `org` user attribute). Declaring them here is
 * what makes `session.user.role` type-check across server components,
 * middleware and `useSession()`.
 */
import type { DefaultSession } from "next-auth";

export type CoreValleyRole = "admin" | "member";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: CoreValleyRole;
      org: string | null;
    } & DefaultSession["user"];
    /** Present only in Keycloak mode — the raw OIDC access token. */
    accessToken?: string;
    error?: "RefreshAccessTokenError";
  }

  interface User {
    role?: CoreValleyRole;
    org?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: CoreValleyRole;
    org?: string | null;
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    /** Unix seconds at which `accessToken` expires. */
    expiresAt?: number;
    error?: "RefreshAccessTokenError";
  }
}
