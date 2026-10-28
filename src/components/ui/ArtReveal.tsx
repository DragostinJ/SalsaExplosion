"use client";

import type { ReactNode } from "react";

interface ArtRevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}

/**
 * Architectural wrapper that guarantees immediate 100% visibility (opacity: 1)
 * without IntersectionObserver opacity:0 gating that can cause blank voids
 * during fast scrolling or full-page visual audits.
 */
export function ArtReveal({ children, className = "" }: ArtRevealProps) {
  return <div className={`${className} opacity-100`}>{children}</div>;
}
