import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
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
});

export const metadata: Metadata = {
  title: "Salsa Explosion | Bournemouth's Cuban Salsa & Rueda Academy",
  description:
    "Official dance platform for Salsa Explosion UK. Directed by Cuban maestro Enrique Perez Valdes. Weekly classes at BOH Studios Bournemouth, Rueda de Casino, end-of-class recaps, and congress passes.",
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
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <SiteHeader role={viewer?.role ?? null} canSwitchRoles={userCanSwitchRoles} />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
