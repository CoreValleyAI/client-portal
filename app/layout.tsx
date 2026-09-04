import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import { AuthProvider } from "@/components/layout/auth-provider";
import {
  AUTH_PROVIDER_ID,
  AUTH_REGISTER_PROVIDER_ID,
  MOCK_SESSION,
  isKeycloakEnabled,
} from "@/lib/auth";
import "./globals.css";

/* Both faces are variable fonts: omitting `weight` ships one woff2 per family
   covering the whole design-system range (300-800) instead of nine static
   instances. `fallback` carries the stack tokens/typography.css declared;
   next/font prepends a metric-adjusted local fallback to keep CLS at zero. */
const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://corevalley.ai"),
  title: {
    default: "CoreValley - Nepal's Sovereign AI Cloud",
    template: "%s · CoreValley",
  },
  description:
    "Build, fine-tune and deploy AI without leaving Nepal. NVIDIA H100 and H200 infrastructure hosted in Kathmandu, billed in NPR, with data residency and support in Nepal time.",
  openGraph: {
    type: "website",
    siteName: "CoreValley",
    locale: "en_NP",
  },
};

/* Tells the UA to render scrollbars and form controls dark. Without it you get
   a white scrollbar against a #05080D page. */
export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#05080D",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      {/* No bg/text utilities needed: design_system/tokens/base.css (imported
          into layer(base)) already sets --bg-base, --text-primary and the
          Manrope 300 / 1.6 body defaults. */}
      <body className="min-h-dvh antialiased">
        <AuthProvider
          keycloak={isKeycloakEnabled}
          staticDemo={process.env.NEXT_PUBLIC_STATIC_DEMO === "true"}
          providerId={AUTH_PROVIDER_ID}
          registerProviderId={AUTH_REGISTER_PROVIDER_ID}
          demoSession={MOCK_SESSION}
        >
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
