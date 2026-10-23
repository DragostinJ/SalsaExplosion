import React from "react";

interface MarqueePhrase {
  text: string;
  isSerif?: boolean;
}

interface KineticMarqueeRibbonProps {
  direction?: "left" | "right";
  phrases: (string | MarqueePhrase)[];
  skew?: "-rotate-1" | "rotate-1" | "none";
  className?: string;
}

export function KineticMarqueeRibbon({
  direction = "left",
  phrases,
  skew = "none",
  className = "",
}: KineticMarqueeRibbonProps) {
  const normalizedPhrases: MarqueePhrase[] = phrases.map((p, idx) =>
    typeof p === "string" ? { text: p, isSerif: idx % 2 === 1 } : p
  );

  const animationClass =
    direction === "right" ? "animate-marquee-right" : "animate-marquee-left";
  const skewClass =
    skew === "-rotate-1"
      ? "-rotate-1 scale-[1.02]"
      : skew === "rotate-1"
        ? "rotate-1 scale-[1.02]"
        : "";

  return (
    <div
      aria-hidden="true"
      className={`relative w-full overflow-hidden select-none pointer-events-none py-3.5 sm:py-5 border-y border-amber-500/15 bg-black/60 backdrop-blur-xs z-10 ${skewClass} ${className}`}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
      }}
    >
      <div className={animationClass}>
        {/* First track */}
        <div className="flex items-center gap-6 sm:gap-10 shrink-0 pr-6 sm:pr-10">
          {normalizedPhrases.map((phrase, idx) => (
            <span
              key={`p1-${idx}`}
              className={
                phrase.isSerif
                  ? "font-display italic font-normal text-amber-300 drop-shadow-sm text-xl sm:text-3xl lg:text-4xl whitespace-nowrap"
                  : "font-black tracking-widest uppercase text-stroke-amber text-xl sm:text-3xl lg:text-4xl whitespace-nowrap"
              }
            >
              {phrase.text} <span className="text-amber-500/40 text-lg sm:text-2xl select-none ml-3 sm:ml-5">✦</span>
            </span>
          ))}
        </div>

        {/* Second track (seamless loop mirror) */}
        <div className="flex items-center gap-6 sm:gap-10 shrink-0 pr-6 sm:pr-10">
          {normalizedPhrases.map((phrase, idx) => (
            <span
              key={`p2-${idx}`}
              className={
                phrase.isSerif
                  ? "font-display italic font-normal text-amber-300 drop-shadow-sm text-xl sm:text-3xl lg:text-4xl whitespace-nowrap"
                  : "font-black tracking-widest uppercase text-stroke-amber text-xl sm:text-3xl lg:text-4xl whitespace-nowrap"
              }
            >
              {phrase.text} <span className="text-amber-500/40 text-lg sm:text-2xl select-none ml-3 sm:ml-5">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
