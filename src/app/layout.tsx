import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { JsonLdSchema } from "@/components/seo/JsonLdSchema";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { StageSpotlight } from "@/components/ui/StageSpotlight";
import { getSafeAppUrl } from "@/lib/safe-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: getSafeAppUrl(process.env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "Salsa Explosion | Bournemouth's Cuban Salsa & Rueda Academy",
    template: "%s | Salsa Explosion",
  },
  description:
    "Official dance platform for Salsa Explosion UK. Directed by Cuban maestro Enrique Perez Valdes. Weekly classes at BOH Studios Bournemouth (£12 for 1 class / £14 for 2 classes at the door), Rueda de Casino, and online festival passes for Made in Cuba Dance Weekend.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/favicon.svg", type: "image/svg+xml" },
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
    title: "Salsa Explosion | Bournemouth's Cuban Salsa & Rueda Academy",
    description:
      "Official dance platform for Salsa Explosion UK. Directed by Cuban maestro Enrique Perez Valdes. Weekly classes at BOH Studios Bournemouth, Rueda de Casino, end-of-class recaps, and congress passes.",
    url: "https://salsaexplosion.co.uk",
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
    title: "Salsa Explosion | Bournemouth's Cuban Salsa & Rueda Academy",
    description:
      "Official dance platform for Salsa Explosion UK. Directed by Cuban maestro Enrique Perez Valdes. Weekly classes at BOH Studios Bournemouth.",
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
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
      >
        <head>
          <JsonLdSchema />
        </head>
        <body className="min-h-full flex flex-col bg-canvas text-ivory overflow-x-hidden havana-stage-lighting relative">
          <a
            href="#main-content"
            data-testid="skip-to-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gold focus:text-stone-950 focus:font-bold focus:rounded-xl focus:shadow-lg focus:outline-none"
          >
            Skip to main content
          </a>
          <div className="film-grain" aria-hidden="true" />
          <StageSpotlight />
          <SiteHeader />
          <div className="flex-1 overflow-x-hidden relative z-10">{children}</div>
          <SiteFooter />
          <MobileBottomNav />
          <GoogleAnalytics />
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
