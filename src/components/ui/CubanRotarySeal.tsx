"use client";

import React from "react";

interface CubanRotarySealProps {
  className?: string;
  size?: number;
}

export function CubanRotarySeal({
  className = "",
  size = 110,
}: CubanRotarySealProps) {
  return (
    <div
      className={`pointer-events-none select-none relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Outer Rotating SVG Typography */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full animate-spin-slow origin-center"
        style={{ willChange: "transform" }}
      >
        <defs>
          <path
            id="sealTextPath"
            d="M 100, 100 m -76, 0 a 76,76 0 1,1 152,0 a 76,76 0 1,1 -152,0"
            fill="none"
          />
        </defs>

        {/* Outer Circular Hairlines */}
        <circle
          cx="100"
          cy="100"
          r="96"
          fill="none"
          stroke="#E59819"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="none"
          stroke="#E59819"
          strokeWidth="1"
          strokeDasharray="3 3"
          strokeOpacity="0.6"
        />

        {/* Circular Curved Text Path */}
        <text
          fill="#F59E0B"
          fontSize="10"
          fontWeight="900"
          letterSpacing="2.8"
          className="uppercase tracking-widest font-mono"
        >
          <textPath href="#sealTextPath" startOffset="0%">
            • SALSA EXPLOSION UK • DE LA HABANA A BOURNEMOUTH • BOH STUDIOS •
          </textPath>
        </text>
      </svg>

      {/* Static Inner Medallion Badge */}
      <div className="absolute inset-[24%] rounded-full bg-gradient-to-br from-[#260907] via-[#120605] to-[#080605] border border-amber-500/50 flex flex-col items-center justify-center shadow-lg shadow-black/80 text-center p-1">
        <span className="text-amber-400 text-xs sm:text-sm leading-none select-none">
          ★
        </span>
        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-amber-300 leading-tight mt-0.5">
          EST. 1993
        </span>
        <span className="text-[7px] font-extrabold uppercase tracking-widest text-zinc-300 leading-none">
          33 AÑOS
        </span>
      </div>
    </div>
  );
}
