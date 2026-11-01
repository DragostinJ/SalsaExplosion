"use client";

import { usePathname } from "next/navigation";

/**
 * Full-screen experiences that hide the site header, footer and bottom nav:
 * the practice player, the art-direction mock-ups (each has its own header) and the
 * printable wall poster.
 */
export function isImmersiveRoute(pathname: string): boolean {
  return (
    /^\/music\/[^/]+\/?$/.test(pathname) || /^\/mockups(\/|$)/.test(pathname) || /^\/cartel\/pared\/?$/.test(pathname)
  );
}

export function ImmersiveRouteGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isImmersiveRoute(pathname ?? "")) return null;
  return <>{children}</>;
}
