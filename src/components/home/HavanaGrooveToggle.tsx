"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, Music, Pause, Disc3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";

type RhythmMode = "son-clave" | "guaguanco";

export function HavanaGrooveToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<RhythmMode>("son-clave");
  const [beatPulse, setBeatPulse] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false);
  const modeRef = useRef<RhythmMode>("son-clave");

  // Play a synthesized clave click (authentic resonant rosewood woodblock tone)
  const playClaveHit = useCallback((ctx: AudioContext, time: number, isAccented: boolean) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    const baseFreq = isAccented ? 2600 : 2350;
    osc.frequency.setValueAtTime(baseFreq, time);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, time + 0.045);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(baseFreq, time);
    filter.Q.setValueAtTime(14, time);

    gain.gain.setValueAtTime(isAccented ? 0.35 : 0.22, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.055);
  }, []);

  // Play a soft conga hit (slap or open tone)
  const playCongaHit = useCallback((ctx: AudioContext, time: number, pitch = 200, isSlap = false) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isSlap ? "triangle" : "sine";
    osc.frequency.setValueAtTime(pitch, time);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.45, time + (isSlap ? 0.05 : 0.09));

    gain.gain.setValueAtTime(isSlap ? 0.22 : 0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + (isSlap ? 0.06 : 0.11));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.12);
  }, []);

  // Play an authentic Cuban Campana (Bongo Cowbell / Cencerro) strike
  const playCowbellHit = useCallback((ctx: AudioContext, time: number, isAccented: boolean) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = "square";
    osc2.type = "square";
    osc1.frequency.setValueAtTime(560, time);
    osc2.frequency.setValueAtTime(845, time);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(isAccented ? 820 : 640, time);
    filter.Q.setValueAtTime(11, time);

    const duration = isAccented ? 0.09 : 0.065;
    const initialGain = isAccented ? 0.2 : 0.13;

    gain.gain.setValueAtTime(initialGain, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration + 0.01);
    osc2.stop(time + duration + 0.01);
  }, []);

  const stopGroove = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setBeatPulse(false);

    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.suspend().catch(() => {});
    }
  }, []);

  const startGrooveWithMode = useCallback((targetMode: RhythmMode) => {
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioCtxClass) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioCtxClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }

      isPlayingRef.current = true;
      setIsPlaying(true);
      modeRef.current = targetMode;
      setMode(targetMode);

      const bpm = 98; // Traditional relaxed Son / Cuban Casino tempo
      const beatDuration = 60 / bpm; // ~0.612s per beat
      const sixteenth = beatDuration / 4; // ~0.153s
      const loopDuration = beatDuration * 8; // 2 measures (8 beats) ~4.897s

      let nextLoopTime = ctx.currentTime + 0.05;

      const scheduleLoop = () => {
        if (!isPlayingRef.current) return;

        const baseTime = nextLoopTime;
        const currentMode = modeRef.current;

        if (currentMode === "son-clave") {
          // Mode A: 2-3 Son Clave Pattern across 8 beats (16 sixteenth notes per bar)
          // Measure 1 (2-side): Beat 2, Beat 3
          playClaveHit(ctx, baseTime + beatDuration * 1, false);
          playClaveHit(ctx, baseTime + beatDuration * 2, true);

          // Measure 2 (3-side): Beat 5 (Bar 2 Beat 1), Beat 6.5 (Bar 2 Beat 2.5), Beat 8 (Bar 2 Beat 4)
          playClaveHit(ctx, baseTime + beatDuration * 4, true);
          playClaveHit(ctx, baseTime + beatDuration * 5 + sixteenth * 2, true);
          playClaveHit(ctx, baseTime + beatDuration * 7, false);

          // Soft Conga Tumbao groove accents (beats 4 & 4.5 of each measure)
          playCongaHit(ctx, baseTime + beatDuration * 3.5, 175);
          playCongaHit(ctx, baseTime + beatDuration * 7.5, 195);
        } else {
          // Mode B: Traditional Rumba Guaguancó & Campana (Cowbell) Pulse
          // 3-2 Rumba Clave:
          // Bar 1 (3-side): Beat 1, Beat 2.5, Beat 3.5 (delayed rumba 3rd stroke)
          playClaveHit(ctx, baseTime, true);
          playClaveHit(ctx, baseTime + beatDuration * 1.5, true);
          playClaveHit(ctx, baseTime + beatDuration * 2.5, true);

          // Bar 2 (2-side): Beat 6 (Bar 2 Beat 2), Beat 7 (Bar 2 Beat 3)
          playClaveHit(ctx, baseTime + beatDuration * 5, false);
          playClaveHit(ctx, baseTime + beatDuration * 6, true);

          // Campana (Cowbell) accompaniment across both bars
          for (let bar = 0; bar < 2; bar++) {
            const barStart = baseTime + beatDuration * (bar * 4);
            playCowbellHit(ctx, barStart, false);                       // Beat 1 (low)
            playCowbellHit(ctx, barStart + beatDuration, true);         // Beat 2 (high)
            playCowbellHit(ctx, barStart + beatDuration * 1.5, false);   // Beat 2.5 (low)
            playCowbellHit(ctx, barStart + beatDuration * 2, true);     // Beat 3 (high)
            playCowbellHit(ctx, barStart + beatDuration * 3, true);     // Beat 4 (high)
            playCowbellHit(ctx, barStart + beatDuration * 3.5, false);  // Beat 4.5 (low)
          }

          // Conga Quinto Slap on Beat 2 and Open Tone on Beat 4.5
          playCongaHit(ctx, baseTime + beatDuration, 310, true);
          playCongaHit(ctx, baseTime + beatDuration * 3.5, 185, false);
          playCongaHit(ctx, baseTime + beatDuration * 5, 310, true);
          playCongaHit(ctx, baseTime + beatDuration * 7.5, 185, false);
        }

        // Visual pulse trigger on beat (suppressed if prefers-reduced-motion)
        if (typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setBeatPulse(true);
          if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
          pulseTimeoutRef.current = setTimeout(() => setBeatPulse(false), 200);
        }

        nextLoopTime += loopDuration;
      };

      // Schedule first loop immediately
      scheduleLoop();

      // Schedule recurring loops
      timerIdRef.current = setInterval(() => {
        if (ctx.currentTime >= nextLoopTime - 0.25) {
          scheduleLoop();
        }
      }, (loopDuration * 1000) / 2);
    } catch {
      stopGroove();
    }
  }, [playClaveHit, playCongaHit, playCowbellHit, stopGroove]);

  const toggleGroove = () => {
    if (isPlaying) {
      stopGroove();
    } else {
      startGrooveWithMode(modeRef.current);
    }
  };

  const switchMode = (newMode: RhythmMode) => {
    modeRef.current = newMode;
    setMode(newMode);
    if (isPlaying) {
      startGrooveWithMode(newMode);
    }
  };

  useEffect(() => {
    return () => {
      stopGroove();
      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }
    };
  }, [stopGroove]);

  return (
    <>
      {/* 1. In-Hero Action Button */}
      <Button
        type="button"
        onClick={toggleGroove}
        variant="outline"
        size="sm"
        aria-label={
          isPlaying
            ? "Playing 98 BPM Havana Clave - tap to pause"
            : "Tap to Feel the Havana Clave"
        }
        className={`h-9 px-3.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-300 shadow-sm ${
          isPlaying
            ? "bg-amber-500/15 border-amber-400 text-amber-300 shadow-[0_0_20px_-3px_rgba(245,158,11,0.45)]"
            : "bg-background/80 hover:bg-background border-amber-500/30 text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {isPlaying && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 transition-colors duration-200 ${
                isPlaying
                  ? beatPulse
                    ? "bg-amber-300 scale-125"
                    : "bg-amber-500"
                  : "bg-muted-foreground/60"
              }`}
            />
          </span>
          {isPlaying ? (
            <>
              <Volume2 className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span className="font-medium text-amber-200">
                Playing 98 BPM Havana Clave
              </span>
            </>
          ) : (
            <>
              <Music className="h-3.5 w-3.5 text-amber-400/80" />
              <span>Tap to Feel the Havana Clave</span>
            </>
          )}
        </span>
      </Button>

      {/* 2. Floating Spinning Vinyl Dubplate Mini-Player (Active when playing) */}
      {isPlaying && (
        <aside
          aria-label="Havana Vinyl Dubplate Mini-Player"
          className="art-card fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 flex items-center gap-3.5 rounded-2xl border border-line bg-surface-1/95 p-3 pr-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[calc(100vw-1.5rem)] sm:max-w-md"
        >
          {/* Animated 12" Vinyl Dubplate Disc */}
          <div className="relative h-13 w-13 sm:h-14 sm:w-14 shrink-0 rounded-full bg-surface-2 shadow-lg flex items-center justify-center overflow-hidden border border-gold/40">
            <div
              className={`absolute inset-0 rounded-full ${
                isPlaying && !reducedMotion ? "animate-[spin_4s_linear_infinite]" : ""
              }`}
            >
              <svg viewBox="0 0 100 100" className="h-full w-full select-none" aria-hidden="true">
                {/* Vinyl Grooves */}
                <circle cx="50" cy="50" r="48" fill="#151413" stroke="#262422" strokeWidth="0.6" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

                {/* Center Gold Label */}
                <circle cx="50" cy="50" r="21" fill="#d97706" />
                <circle cx="50" cy="50" r="18.5" fill="#92400e" stroke="#fef08a" strokeWidth="0.6" />
                <circle cx="50" cy="50" r="3.5" fill="#0c0908" stroke="#fef08a" strokeWidth="0.3" />

                {/* Vinyl Label Typography */}
                <text
                  x="50"
                  y="43"
                  textAnchor="middle"
                  fill="#fef08a"
                  fontSize="4.4"
                  fontWeight="bold"
                  letterSpacing="0.4"
                >
                  SALSA
                </text>
                <text
                  x="50"
                  y="48"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="3.6"
                  fontWeight="bold"
                  letterSpacing="0.2"
                >
                  EXPLOSION
                </text>
                <text
                  x="50"
                  y="57"
                  textAnchor="middle"
                  fill="#fde68a"
                  fontSize="3.1"
                  fontWeight="bold"
                >
                  98 BPM
                </text>
              </svg>

              {/* Specular Radial Sweep Reflection */}
              <div
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Track & Mode Details */}
          <div className="flex flex-col min-w-0 pr-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Disc3 className="h-3 w-3 text-amber-400 animate-spin" />
                Havana Vinyl Dubplate
              </span>

              {/* 4-Bar Dancing Waveform Equalizer */}
              <div
                className="flex items-end gap-0.5 h-3.5 w-4 ml-auto"
                aria-label="Equalizer animating"
                aria-hidden="true"
              >
                <span className="w-0.5 bg-amber-400 rounded-full animate-eq-1" />
                <span className="w-0.5 bg-amber-300 rounded-full animate-eq-2" />
                <span className="w-0.5 bg-amber-400 rounded-full animate-eq-3" />
                <span className="w-0.5 bg-amber-300 rounded-full animate-eq-4" />
              </div>
            </div>

            {/* Rhythm Mode Switcher */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <button
                type="button"
                onClick={() => switchMode("son-clave")}
                aria-pressed={mode === "son-clave"}
                className={`text-xs font-semibold px-2 py-0.5 rounded-md transition-colors ${
                  mode === "son-clave"
                    ? "bg-amber-500/25 text-amber-200 border border-amber-400/50 shadow-sm"
                    : "text-ivory-muted hover:text-stone-200 hover:bg-white/5"
                }`}
              >
                Son Clave
              </button>
              <button
                type="button"
                onClick={() => switchMode("guaguanco")}
                aria-pressed={mode === "guaguanco"}
                className={`text-xs font-semibold px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${
                  mode === "guaguanco"
                    ? "bg-amber-500/25 text-amber-200 border border-amber-400/50 shadow-sm"
                    : "text-ivory-muted hover:text-stone-200 hover:bg-white/5"
                }`}
              >
                <Sparkles className="h-2.5 w-2.5 text-amber-400" />
                Guaguancó & Campana
              </button>
            </div>
          </div>

          {/* Pause / Close Control */}
          <button
            type="button"
            onClick={stopGroove}
            aria-label="Pause rhythm"
            className="p-1.5 rounded-full text-ivory-muted hover:text-amber-300 hover:bg-white/10 transition-colors shrink-0 ml-1"
          >
            <Pause className="h-4 w-4" />
          </button>
        </aside>
      )}
    </>
  );
}
