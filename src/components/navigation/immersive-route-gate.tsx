"use client";

import { usePathname } from "next/navigation";

/**
 * Full-screen experiences that hide the site header, footer and bottom nav:
 * the practice player, and the art-direction mock-ups (each has its own header).
 */
export function isImmersiveRoute(pathname: string): boolean {
  return /^\/music\/[^/]+\/?$/.test(pathname) || /^\/mockups(\/|$)/.test(pathname);
}

export function ImmersiveRouteGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isImmersiveRoute(pathname ?? "")) return null;
  return <>{children}</>;
}
