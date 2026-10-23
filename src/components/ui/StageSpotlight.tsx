"use client";

import { useEffect, useRef } from "react";

export function StageSpotlight() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Default coordinates in percent
    let currentX = 50;
    let currentY = 30;
    let targetX = 50;
    let targetY = 30;
    let isMouseActive = false;
    let lastMouseMoveTime = 0;
    let animFrameId: number;
    const startTime = performance.now();

    const onMouseMove = (e: MouseEvent) => {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      targetX = (e.clientX / width) * 100;
      targetY = (e.clientY / height) * 100;
      isMouseActive = true;
      lastMouseMoveTime = performance.now();
    };

    const updateLoop = (now: number) => {
      // If no mouse interaction in last 2.5s or on mobile/touch devices, drift autonomously in a gentle figure-8
      if (!isMouseActive || now - lastMouseMoveTime > 2500) {
        const elapsed = (now - startTime) * 0.0006;
        // Lissajous figure-8 drift centered at (50%, 35%)
        targetX = 50 + Math.sin(elapsed) * 22;
        targetY = 35 + Math.sin(elapsed * 2) * 14;
      }

      // Smooth lerp easing (inertia)
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      el.style.setProperty("--spot-x", `${currentX.toFixed(2)}%`);
      el.style.setProperty("--spot-y", `${currentY.toFixed(2)}%`);

      animFrameId = requestAnimationFrame(updateLoop);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    animFrameId = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      style={
        {
          "--spot-x": "50%",
          "--spot-y": "30%",
        } as React.CSSProperties
      }
    >
      {/* Primary Reactive Stage Spotlight */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-out"
        style={{
          background:
            "radial-gradient(650px circle at var(--spot-x, 50%) var(--spot-y, 30%), rgba(245, 158, 11, 0.08), rgba(185, 28, 28, 0.035) 45%, transparent 75%)",
        }}
      />
      {/* Ambient Warm Rim Secondary Spotlight */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          background:
            "radial-gradient(400px circle at calc(100% - var(--spot-x, 50%)) calc(100% - var(--spot-y, 30%)), rgba(245, 158, 11, 0.04), transparent 70%)",
        }}
      />
    </div>
  );
}
