import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/navigation/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RitmoFlow | Cuban Salsa Studio Operating System",
  description: "Production-grade platform for Cuban Salsa classes, level progression, and international guest artist masterclasses.",
};

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
        select: { role: true },
      })
    : null;

  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <SiteHeader role={viewer?.role ?? null} />
          <div className="flex-1">{children}</div>
        </body>
      </html>
    </ClerkProvider>
  );
}
