"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HavanaGrooveToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatPulse, setBeatPulse] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false);

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

  // Play a soft conga open tone (subtle low-end groove support)
  const playCongaHit = useCallback((ctx: AudioContext, time: number, pitch = 200) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(pitch, time);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, time + 0.09);

    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.11);
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

  const startGroove = useCallback(() => {
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

      isPlayingRef.current = true;
      setIsPlaying(true);

      const bpm = 98; // Traditional relaxed Son / Cuban Casino tempo
      const beatDuration = 60 / bpm; // ~0.612s per beat
      const sixteenth = beatDuration / 4; // ~0.153s
      const loopDuration = beatDuration * 8; // 2 measures (8 beats) ~4.897s

      let nextLoopTime = ctx.currentTime + 0.05;

      const scheduleLoop = () => {
        if (!isPlayingRef.current) return;

        const baseTime = nextLoopTime;

        // 2-3 Son Clave Pattern across 8 beats (16 sixteenth notes per bar)
        // Measure 1 (2-side): Beat 2, Beat 3
        playClaveHit(ctx, baseTime + beatDuration * 1, false); // Beat 2
        playClaveHit(ctx, baseTime + beatDuration * 2, true);  // Beat 3

        // Measure 2 (3-side): Beat 5 (Bar 2 Beat 1), Beat 6.5 (Bar 2 Beat 2.5), Beat 8 (Bar 2 Beat 4)
        playClaveHit(ctx, baseTime + beatDuration * 4, true);              // Beat 1 of bar 2
        playClaveHit(ctx, baseTime + beatDuration * 5 + sixteenth * 2, true); // Beat 2.5 ("and" of 2)
        playClaveHit(ctx, baseTime + beatDuration * 7, false);             // Beat 4 of bar 2

        // Soft Conga Tumbao groove accents (beats 4 & 4.5 of each measure)
        playCongaHit(ctx, baseTime + beatDuration * 3.5, 175);
        playCongaHit(ctx, baseTime + beatDuration * 7.5, 195);

        // Visual pulse trigger on beat
        setBeatPulse(true);
        setTimeout(() => setBeatPulse(false), 200);

        nextLoopTime += loopDuration;
      };

      // Schedule first loop immediately
      scheduleLoop();

      // Schedule recurring loops
      timerIdRef.current = setInterval(() => {
        if (ctx.currentTime >= nextLoopTime - 0.2) {
          scheduleLoop();
        }
      }, (loopDuration * 1000) / 2);
    } catch {
      stopGroove();
    }
  }, [playClaveHit, playCongaHit, stopGroove]);

  const toggleGroove = () => {
    if (isPlaying) {
      stopGroove();
    } else {
      startGroove();
    }
  };

  useEffect(() => {
    return () => {
      stopGroove();
    };
  }, [stopGroove]);

  return (
    <Button
      type="button"
      onClick={toggleGroove}
      variant="outline"
      size="sm"
      aria-label={isPlaying ? "Playing 98 BPM Havana Clave - tap to pause" : "Tap to Feel the Havana Clave"}
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
            <span className="font-medium text-amber-200">Playing 98 BPM Havana Clave</span>
          </>
        ) : (
          <>
            <Music className="h-3.5 w-3.5 text-amber-400/80" />
            <span>Tap to Feel the Havana Clave</span>
          </>
        )}
      </span>
    </Button>
  );
}
