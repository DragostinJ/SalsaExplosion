import type { Metadata } from "next";
import { Anton, Archivo, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { ImmersiveRouteGate } from "@/components/navigation/immersive-route-gate";
import { JsonLdSchema } from "@/components/seo/JsonLdSchema";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { getSiteOrigin } from "@/lib/safe-url";
import "./globals.css";

// ICAIC Poster type: Anton for the headlines, Archivo for everything else
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: {
    default: "Cuban Salsa Classes in Bournemouth | Salsa Explosion",
    template: "%s | Salsa Explosion",
  },
  description:
    "Cuban salsa and rueda classes every Thursday and Sunday at BOH Studios, Bournemouth. £12 at the door, no partner needed. Practise the class songs at home.",
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    // iOS ignores SVG touch icons: the poster mark rendered as a 180px PNG
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  creator: "Enrique Perez Valdes",
  keywords: [
    "Cuban Salsa Bournemouth",
    "Salsa Explosion",
    "Enrique Perez Valdes",
    "Rueda de Casino Bournemouth",
    "BOH Studios",
    "DANZA Bournemouth",
    "Made in Cuba Dance Weekend",
    "Bournemouth Cuban Salsa Congress",
    "Dance Classes Dorset",
  ],
  openGraph: {
    title: "Cuban Salsa Classes in Bournemouth | Salsa Explosion",
    description:
      "Cuban salsa and rueda classes every Thursday and Sunday at BOH Studios, Bournemouth. £12 at the door, no partner needed. Practise the class songs at home.",
    url: getSiteOrigin(),
    siteName: "Salsa Explosion",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/images/opengraph.png",
        width: 1200,
        height: 630,
        alt: "Salsa Explosion Bournemouth Cuban Salsa Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cuban Salsa Classes in Bournemouth | Salsa Explosion",
    description:
      "Cuban salsa and rueda classes every Thursday and Sunday at BOH Studios, Bournemouth. £12 at the door, no partner needed. Practise the class songs at home.",
    images: ["/images/opengraph.png"],
  },
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <html
        lang="en"
        className={`${archivo.variable} ${geistMono.variable} ${anton.variable} h-full antialiased`}
      >
        <head>
          <JsonLdSchema />
        </head>
        <body className="min-h-full flex flex-col bg-canvas text-ivory overflow-x-hidden paper-grain relative">
          <a
            href="#main-content"
            data-testid="skip-to-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-ink focus:text-paper focus:font-bold focus:rounded-xl focus:shadow-lg focus:outline-none"
          >
            Skip to main content
          </a>
          <div className="film-grain" aria-hidden="true" />
          <ImmersiveRouteGate>
            <SiteHeader />
          </ImmersiveRouteGate>
          <div className="flex-1 overflow-x-hidden relative z-10 min-h-screen">{children}</div>
          <ImmersiveRouteGate>
            <SiteFooter />
            <MobileBottomNav />
          </ImmersiveRouteGate>
          <GoogleAnalytics />
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
