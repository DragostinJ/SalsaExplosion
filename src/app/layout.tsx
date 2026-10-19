import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://salsaexplosion.co.uk"
  ),
  title: "Salsa Explosion | Bournemouth's Cuban Salsa & Rueda Academy",
  description:
    "Official dance platform for Salsa Explosion UK. Directed by Cuban maestro Enrique Perez Valdes. Weekly classes at BOH Studios Bournemouth, Rueda de Casino, end-of-class recaps, and congress passes.",
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

import { canSwitchRoles } from "@/lib/auth-user";

import { Toaster } from "sonner";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Role lookup only (no provisioning) — cheap indexed read on clerkId
  const { userId } = await auth();
  const viewer = userId
    ? await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { role: true, email: true },
      })
    : null;

  const userCanSwitchRoles = viewer ? canSwitchRoles(viewer.email) : false;

  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <head>
          <link rel="preconnect" href="https://images.unsplash.com" />
          <link rel="dns-prefetch" href="https://images.unsplash.com" />
        </head>
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <SiteHeader role={viewer?.role ?? null} canSwitchRoles={userCanSwitchRoles} />
          <div className="flex-1 pb-20 md:pb-0">{children}</div>
          <SiteFooter />
          <MobileBottomNav />
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
