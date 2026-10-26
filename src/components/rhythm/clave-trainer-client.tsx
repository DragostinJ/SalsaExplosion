"use client";

import { useState, useEffect, useRef } from "react";
import {
  Play,
  Square,
  Volume2,
  VolumeX,
  Gauge,
  Music,
  Sparkles,
  Info,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type ClavePattern = "2-3" | "3-2";

export function ClaveTrainerClient() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(90);
  const [clavePattern, setClavePattern] = useState<ClavePattern>("2-3");
  const [isMuted, setIsMuted] = useState(false);

  // Individual instrument volume / enablement
  const [playClave, setPlayClave] = useState(true);
  const [playCampana, setPlayCampana] = useState(false);
  const [playConga, setPlayConga] = useState(true);
  const [playMetronome, setPlayMetronome] = useState(true);

  // Active step in 8-count bar (0 to 7)
  const [currentStep, setCurrentStep] = useState<number | null>(null);

  // Audio Context & Scheduling refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerWorkerRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const stepRef = useRef<number>(0);

  // Ensure AudioContext exists
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Sound synthesis helpers using standard Web Audio oscillators & filters
  const playWoodblock = (time: number, freq = 1200) => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, time + 0.04);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.06);
  };

  const playCowbell = (time: number) => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "square";
    osc2.type = "square";
    osc1.frequency.setValueAtTime(540, time);
    osc2.frequency.setValueAtTime(800, time);

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, time);
    filter.Q.setValueAtTime(3, time);

    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.09);
    osc2.stop(time + 0.09);
  };

  const playCongaTumbao = (time: number, isHigh: boolean) => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const startFreq = isHigh ? 380 : 220;
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.6, time + 0.09);

    gain.gain.setValueAtTime(isHigh ? 0.6 : 0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.13);
  };

  const playClick = (time: number, isAccent: boolean) => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(isAccent ? 1400 : 700, time);

    gain.gain.setValueAtTime(isAccent ? 0.4 : 0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.04);
  };

  // Scheduler logic: run every 25ms, look ahead 100ms
  const scheduleNote = (step: number, time: number) => {
    // 16-subdivision index (0 to 15, corresponding to two 4/4 bars)
    // Here we count 8 beats: 1, 2, 3, 4, 5, 6, 7, 8
    // In Cuban Son Clave:
    // 2-3 Clave on beats: [Beat 2, Beat 3], [Beat 5, Beat 6.5 (and of 6), Beat 8]
    // 3-2 Clave on beats: [Beat 1, Beat 2.5 (and of 2), Beat 4], [Beat 6, Beat 7]

    if (playMetronome) {
      // Metronome count on 1, 2, 3, 4, 5, 6, 7, 8
      const isStartOfBar = step === 0 || step === 4;
      playClick(time, isStartOfBar);
    }

    if (playClave) {
      if (clavePattern === "2-3") {
        // Beats 2, 3, 5, 6.5, 8 (0-indexed: 1, 2, 4, 7)
        if (step === 1 || step === 2 || step === 4 || step === 7) {
          playWoodblock(time, 1400);
        }
      } else {
        // 3-2 Clave: Beats 1, 4, 6, 7 (0-indexed: 0, 3, 5, 6)
        if (step === 0 || step === 3 || step === 5 || step === 6) {
          playWoodblock(time, 1400);
        }
      }
    }

    if (playCampana) {
      // Bongocero / Timbalero Campana typically marks strong 1, 3, 5, 7
      if (step === 0 || step === 2 || step === 4 || step === 6) {
        playCowbell(time);
      }
    }

    if (playConga) {
      // Tumbao open slaps / tones on 4 & 4.5, 8 & 8.5
      if (step === 1 || step === 5) {
        playCongaTumbao(time, true); // Slap on 2 and 6
      }
      if (step === 3 || step === 7) {
        playCongaTumbao(time, false); // Open tone on 4 and 8
      }
    }

    // Schedule UI highlight update synchronized with audio
    if (audioCtxRef.current) {
      const delay = Math.max(0, (time - audioCtxRef.current.currentTime) * 1000);
      setTimeout(() => {
        setCurrentStep(step);
      }, delay);
    }
  };

  const nextStep = () => {
    // 60 / tempo is quarter note duration (one salsa count)
    const secondsPerBeat = 60.0 / tempo;
    nextNoteTimeRef.current += secondsPerBeat;
    stepRef.current = (stepRef.current + 1) % 8;
  };

  const scheduleNoteRef = useRef(scheduleNote);
  const nextStepRef = useRef(nextStep);

  useEffect(() => {
    scheduleNoteRef.current = scheduleNote;
    nextStepRef.current = nextStep;
  });

  useEffect(() => {
    if (!isPlaying) {
      if (timerWorkerRef.current) {
        clearInterval(timerWorkerRef.current);
        timerWorkerRef.current = null;
      }
      return;
    }

    const ctx = getAudioContext();
    nextNoteTimeRef.current = ctx.currentTime + 0.05;
    stepRef.current = 0;

    const intervalId = window.setInterval(() => {
      // Schedule ahead
      while (nextNoteTimeRef.current < ctx.currentTime + 0.1) {
        scheduleNoteRef.current(stepRef.current, nextNoteTimeRef.current);
        nextStepRef.current();
      }
    }, 25);

    timerWorkerRef.current = intervalId;

    return () => {
      clearInterval(intervalId);
    };
  }, [isPlaying, tempo, clavePattern, playClave, playCampana, playConga, playMetronome, isMuted]);

  const togglePlayback = () => {
    getAudioContext();
    setIsPlaying((prev) => {
      if (prev) {
        setCurrentStep(null);
      }
      return !prev;
    });
  };

  // Salsa dancing steps mapping
  const BEAT_DEFINITIONS = [
    { count: 1, label: "Break Step", isDanceStep: true, bar: 1 },
    { count: 2, label: "Weight Transfer", isDanceStep: true, bar: 1 },
    { count: 3, label: "Return & Neutral", isDanceStep: true, bar: 1 },
    { count: 4, label: "Pause / Hold", isDanceStep: false, bar: 1 },
    { count: 5, label: "Break Step", isDanceStep: true, bar: 2 },
    { count: 6, label: "Weight Transfer", isDanceStep: true, bar: 2 },
    { count: 7, label: "Return & Neutral", isDanceStep: true, bar: 2 },
    { count: 8, label: "Pause / Hold", isDanceStep: false, bar: 2 },
  ];

  return (
    <div className="space-y-8">
      {/* Visual Step Display */}
      <Card className="border-2 border-amber-500/30 bg-gradient-to-b from-card to-amber-500/[0.03] shadow-md overflow-hidden">
        <CardHeader className="text-center pb-3">
          <div className="inline-flex items-center justify-center gap-2 mx-auto">
            <Badge className="bg-amber-600 text-white font-bold text-xs uppercase tracking-wider">
              8-Count Salsa Bar
            </Badge>
            <Badge variant="outline" className="text-xs">
              Pattern: {clavePattern} Son Clave
            </Badge>
          </div>
          <CardTitle className="text-2xl font-black mt-2">
            Visual Footwork & Timing Indicator
          </CardTitle>
          <CardDescription className="text-xs">
            Notice how dancers step on counts 1-2-3 and 5-6-7, holding or gliding through counts 4 and 8.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
            {BEAT_DEFINITIONS.map((beat, idx) => {
              const isActive = currentStep === idx;
              const isClaveHit =
                clavePattern === "2-3"
                  ? idx === 1 || idx === 2 || idx === 4 || idx === 7
                  : idx === 0 || idx === 3 || idx === 5 || idx === 6;

              return (
                <div
                  key={beat.count}
                  className={`relative rounded-2xl border p-3 flex flex-col items-center justify-between text-center transition-all duration-100 min-h-[110px] ${
                    isActive
                      ? "scale-105 border-amber-500 bg-amber-500 text-stone-950 font-black shadow-lg ring-4 ring-amber-500/30 z-10"
                      : beat.isDanceStep
                      ? "border-amber-500/30 bg-card hover:bg-muted/40"
                      : "border-border/60 bg-muted/20 opacity-60"
                  }`}
                >
                  {/* Top Clave Dot Indicator */}
                  <div className="h-2 w-2 mb-1">
                    {isClaveHit && (
                      <span
                        className={`block h-2 w-2 rounded-full ${
                          isActive ? "bg-stone-950" : "bg-rose-500 shadow-xs"
                        }`}
                        title="Clave Accent"
                      />
                    )}
                  </div>

                  <span className="text-3xl font-black">{beat.count}</span>

                  <span
                    className={`text-[10px] leading-tight font-bold mt-1 ${
                      isActive ? "text-stone-950" : "text-muted-foreground"
                    }`}
                  >
                    {beat.label}
                  </span>

                  <span
                    className={`text-[9px] uppercase tracking-widest mt-1 px-1.5 py-0.5 rounded ${
                      beat.isDanceStep
                        ? isActive
                          ? "bg-stone-950 text-amber-400 font-extrabold"
                          : "bg-emerald-500/10 text-emerald-600 font-bold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {beat.isDanceStep ? "Step" : "Hold"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Master Transport Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border bg-muted/30">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                size="lg"
                onClick={togglePlayback}
                className={`w-full sm:w-auto font-black text-sm px-8 shadow-md transition-all ${
                  isPlaying
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-amber-600 hover:bg-amber-700 text-white"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Square className="mr-2 h-4 w-4 fill-current" />
                    Stop Trainer
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4 fill-current" />
                    Start Clave & Rhythm
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setIsMuted((prev) => !prev)}
                className="shrink-0"
                title={isMuted ? "Unmute" : "Mute audio"}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-rose-500" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Tempo Slider */}
            <div className="flex items-center gap-4 w-full sm:w-72">
              <Gauge className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>Tempo:</span>
                  <span className="font-mono text-amber-400">
                    {tempo} BPM
                  </span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="115"
                  step="1"
                  value={tempo}
                  onChange={(e) => setTempo(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>75 (Drill)</span>
                  <span>90 (Casino)</span>
                  <span>115 (Timba)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rhythm Customization & Instrument Layers */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Instrument Layer Toggles */}
        <Card className="border shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Music className="h-4 w-4 text-amber-600" />
              Instrument Layers (Web Audio Synth)
            </CardTitle>
            <CardDescription className="text-xs">
              Isolate or combine traditional Afro-Cuban percussion layers to train your ear.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl border bg-card">
              <div>
                <span className="text-xs font-bold block">Cuban Wood Clave</span>
                <span className="text-[11px] text-muted-foreground">
                  The foundational heartbeat of all Cuban music
                </span>
              </div>
              <Button
                size="sm"
                variant={playClave ? "default" : "outline"}
                onClick={() => setPlayClave((prev) => !prev)}
                className={playClave ? "bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs" : "text-xs"}
              >
                {playClave ? "Active" : "Muted"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border bg-card">
              <div>
                <span className="text-xs font-bold block">Conga Tumbao</span>
                <span className="text-[11px] text-muted-foreground">
                  Slap on 2 & 6, open tones on 4 & 8
                </span>
              </div>
              <Button
                size="sm"
                variant={playConga ? "default" : "outline"}
                onClick={() => setPlayConga((prev) => !prev)}
                className={playConga ? "bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs" : "text-xs"}
              >
                {playConga ? "Active" : "Muted"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border bg-card">
              <div>
                <span className="text-xs font-bold block">Campana (Bongo Cowbell)</span>
                <span className="text-[11px] text-muted-foreground">
                  Drives counts 1, 3, 5, 7 during energetic montuno choruses
                </span>
              </div>
              <Button
                size="sm"
                variant={playCampana ? "default" : "outline"}
                onClick={() => setPlayCampana((prev) => !prev)}
                className={playCampana ? "bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs" : "text-xs"}
              >
                {playCampana ? "Active" : "Muted"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border bg-card">
              <div>
                <span className="text-xs font-bold block">Timing Click (8 Beats)</span>
                <span className="text-[11px] text-muted-foreground">
                  Acoustic reference click for counts 1 through 8
                </span>
              </div>
              <Button
                size="sm"
                variant={playMetronome ? "default" : "outline"}
                onClick={() => setPlayMetronome((prev) => !prev)}
                className={playMetronome ? "bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs" : "text-xs"}
              >
                {playMetronome ? "Active" : "Muted"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clave Direction & Maestro Advice */}
        <Card className="border shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Clave Direction Selector
              </CardTitle>
              <CardDescription className="text-xs">
                Switch between 2-3 and 3-2 Son Clave orientation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setClavePattern("2-3")}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    clavePattern === "2-3"
                      ? "border-amber-500 bg-amber-500/[0.08] ring-2 ring-amber-500/40"
                      : "bg-card hover:bg-muted/40"
                  }`}
                >
                  <span className="font-bold text-sm block">2-3 Son Clave</span>
                  <span className="text-[11px] text-muted-foreground mt-1 block">
                    Two strokes in first bar, three in second. Most common in classic Cuban Casino.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setClavePattern("3-2")}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    clavePattern === "3-2"
                      ? "border-amber-500 bg-amber-500/[0.08] ring-2 ring-amber-500/40"
                      : "bg-card hover:bg-muted/40"
                  }`}
                >
                  <span className="font-bold text-sm block">3-2 Son Clave</span>
                  <span className="text-[11px] text-muted-foreground mt-1 block">
                    Three strokes in first bar, two in second. Frequent in Afro-Cuban & modern Timba.
                  </span>
                </button>
              </div>

              {/* Maestro Note */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-3.5 space-y-1.5 text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-amber-600" />
                  Maestro Enrique&apos;s Timing Advice:
                </span>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  &ldquo;In Bournemouth classes, remember that you don&apos;t just listen with your ears — you feel the conga slap on count 2 and count 6 in your hips! If you ever lose beat 1, pause for one bar, listen for the singer&apos;s breath or piano montuno, and step forward firmly on 1.&rdquo;
                </p>
              </div>
            </CardContent>
          </div>

          <div className="p-6 pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTempo(90);
                setClavePattern("2-3");
                setPlayClave(true);
                setPlayCampana(false);
                setPlayConga(true);
                setPlayMetronome(true);
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Reset Default Settings (90 BPM)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
