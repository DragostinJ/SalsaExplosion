"use client";

import { usePathname } from "next/navigation";

/** Full-screen experiences that hide the site header, footer and bottom nav. */
export function isImmersiveRoute(pathname: string): boolean {
  return /^\/music\/[^/]+\/?$/.test(pathname);
}

export function ImmersiveRouteGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isImmersiveRoute(pathname ?? "")) return null;
  return <>{children}</>;
}
