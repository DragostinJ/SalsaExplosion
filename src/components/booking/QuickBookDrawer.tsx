"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface QuickBookPayload {
  title: string;
  time: string;
  level?: string;
  instructor?: string;
  isSocial?: boolean;
  day?: "thursday" | "sunday";
}

export function triggerQuickBookDrawer(payload: QuickBookPayload) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("open-quick-book-drawer", { detail: payload })
    );
  }
}

export function QuickBookDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<QuickBookPayload | null>(null);
  const [step, setStep] = useState<"configure" | "pass">("configure");
  const [role, setRole] = useState<"lead" | "follow">("lead");
  const [tier, setTier] = useState<"trial" | "dropin" | "pack">("trial");
  const [userName, setUserName] = useState("");
  const [passCode, setPassCode] = useState("#SE-BOH-2026");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<QuickBookPayload>;
      if (customEvent.detail) {
        setSession(customEvent.detail);
        setStep("configure");
        setPassCode(`#SE-BOH-2026-${Math.floor(1000 + Math.random() * 9000)}`);
        setIsOpen(true);
      }
    };

    window.addEventListener("open-quick-book-drawer", handleOpen);
    return () => window.removeEventListener("open-quick-book-drawer", handleOpen);
  }, []);

  // Body scroll lock when drawer is active
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !session) return null;

  const handleGeneratePass = () => {
    if (!userName.trim()) {
      setUserName("Guest Dancer");
    }
    setStep("pass");
  };

  const handleCopyPass = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`Salsa Explosion VIP Pass: ${passCode} for ${session.title}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quick Class Booking Drawer"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border-t sm:border border-amber-500/40 bg-[#0C0908] text-white p-5 sm:p-7 shadow-2xl space-y-5">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-300">
              Havana FastPass • 2-Tap Booking
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close booking drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "configure" ? (
          <div className="space-y-4">
            {/* Session Summary Card */}
            <div className="p-3.5 rounded-2xl bg-[#F4ECE1] text-[#120D0A] border border-black/15 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                <span className="text-[#A83800]">{session.time}</span>
                {session.level && (
                  <span className="bg-[#120D0A] text-[#F4ECE1] px-2 py-0.5 rounded-full text-[9px]">
                    {session.level}
                  </span>
                )}
              </div>
              <h4 className="text-base font-black text-[#120D0A]">{session.title}</h4>
              <div className="flex items-center justify-between text-xs text-[#524336] pt-1">
                <span>{session.instructor ? `Directed by ${session.instructor}` : "Salsa Explosion Team"}</span>
                <span className="font-bold">BOH Studios Bournemouth</span>
              </div>
            </div>

            {/* Step 2: Role Selection & Live Balance Meter */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                1. Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole("lead")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    role === "lead"
                      ? "border-amber-400 bg-amber-500/15 text-white shadow-sm"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="text-sm font-black">🕺 Lead Role</div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Spot Open</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("follow")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    role === "follow"
                      ? "border-amber-400 bg-amber-500/15 text-white shadow-sm"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="text-sm font-black">💃 Follow Role</div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Spot Open</div>
                </button>
              </div>

              {/* Live Partner Ratio Balance Meter */}
              <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
                  <span>⚖️ 50% Leads / 50% Follows</span>
                  <span>Rotation Guaranteed</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden flex">
                  <div className="w-1/2 bg-amber-400 h-full" />
                  <div className="w-1/2 bg-emerald-400 h-full" />
                </div>
              </div>
            </div>

            {/* Step 3: Entry Tier Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                2. Choose Entry Option
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setTier("trial")}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    tier === "trial"
                      ? "border-amber-400 bg-amber-500/20 text-white"
                      : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="text-xs font-black flex items-center gap-1.5">
                      <span>✨ 1st-Timer Free Welcome Pass</span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                        FREE
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400">Valid for new local dancers</div>
                  </div>
                  <span className="text-xs font-black text-amber-300">Claim Trial</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTier("dropin")}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    tier === "dropin"
                      ? "border-amber-400 bg-amber-500/20 text-white"
                      : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="text-xs font-black">🎟️ Single Class &amp; Social Fiesta</div>
                    <div className="text-[10px] text-zinc-400">Includes 7pm/8:15pm classes + party</div>
                  </div>
                  <span className="text-xs font-black text-amber-300">£10 Drop-In</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTier("pack")}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    tier === "pack"
                      ? "border-amber-400 bg-amber-500/20 text-white"
                      : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="text-xs font-black flex items-center gap-1.5">
                      <span>🔥 5-Class Havana Rhythm Pack</span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400 text-black">
                        SAVE 20%
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400">£8 per session • Valid 60 days</div>
                  </div>
                  <span className="text-xs font-black text-amber-300">£40</span>
                </button>
              </div>
            </div>

            {/* Fast Name Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-zinc-300">Attendee Name (For Door Check-In)</label>
                <button
                  type="button"
                  onClick={() => setUserName("Alex Rivera")}
                  className="text-[11px] font-semibold text-amber-400 hover:underline"
                >
                  ⚡ Autofill Guest
                </button>
              </div>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full h-11 px-3.5 rounded-xl border border-white/20 bg-black/60 text-white placeholder-zinc-500 text-sm focus:outline-hidden focus:border-amber-400"
              />
            </div>

            {/* Submit Action */}
            <Button
              type="button"
              onClick={handleGeneratePass}
              className="w-full h-12 text-xs sm:text-sm font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black rounded-xl shadow-lg transition-transform active:scale-[0.99]"
            >
              <span>GENERATE INSTANT QR PASS / APPLE PAY →</span>
            </Button>
          </div>
        ) : (
          /* Step 2: Perforated Havana VIP Ticket Stub */
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border-2 border-dashed border-amber-500/40 bg-[#16110D] relative space-y-4">
              {/* Top Perforation Notches */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    🟢 CONFIRMED RESERVATION
                  </span>
                  <h4 className="text-lg font-black text-white">{session.title}</h4>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-amber-500 text-black font-black text-xs uppercase">
                  {role}
                </div>
              </div>

              {/* Scannable SVG QR Code Stub */}
              <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
                <div className="p-3 rounded-xl bg-white border border-amber-500/30 shrink-0 flex items-center justify-center">
                  <svg className="w-24 h-24 text-black" viewBox="0 0 100 100" fill="currentColor">
                    {/* Simulated SVG High-Contrast QR Matrix */}
                    <rect x="5" y="5" width="25" height="25" rx="3" />
                    <rect x="10" y="10" width="15" height="15" fill="white" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="70" y="5" width="25" height="25" rx="3" />
                    <rect x="75" y="10" width="15" height="15" fill="white" />
                    <rect x="79" y="14" width="7" height="7" />
                    <rect x="5" y="70" width="25" height="25" rx="3" />
                    <rect x="10" y="75" width="15" height="15" fill="white" />
                    <rect x="14" y="79" width="7" height="7" />
                    <rect x="36" y="8" width="6" height="6" />
                    <rect x="48" y="14" width="6" height="6" />
                    <rect x="40" y="24" width="12" height="6" />
                    <rect x="10" y="42" width="6" height="12" />
                    <rect x="22" y="48" width="10" height="6" />
                    <rect x="40" y="40" width="20" height="20" />
                    <rect x="46" y="46" width="8" height="8" fill="white" />
                    <rect x="68" y="40" width="12" height="6" />
                    <rect x="78" y="52" width="6" height="12" />
                    <rect x="40" y="70" width="6" height="12" />
                    <rect x="52" y="78" width="12" height="6" />
                    <rect x="70" y="70" width="22" height="22" />
                  </svg>
                </div>

                <div className="space-y-1.5 text-xs text-center sm:text-left">
                  <div className="font-mono text-xs font-bold text-amber-300">{passCode}</div>
                  <div className="font-bold text-white text-sm">{userName || "Guest Dancer"}</div>
                  <div className="text-zinc-400 flex items-center justify-center sm:justify-start gap-1">
                    <Clock className="h-3 w-3 text-amber-400" />
                    <span>{session.time} • BOH Studios Doors Open</span>
                  </div>
                  <div className="text-zinc-400 flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="h-3 w-3 text-amber-400" />
                    <span>104 Commercial Rd, Bournemouth</span>
                  </div>
                </div>
              </div>

              {/* Perforated Hairline Divider */}
              <div className="border-t border-dashed border-white/20 pt-3 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                <span>Pass tier: <strong>{tier.toUpperCase()}</strong></span>
                <span>Maestro Enrique Perez Valdes</span>
              </div>
            </div>

            {/* Post-Pass Actions */}
            <div className="space-y-2">
              <Button
                type="button"
                onClick={handleCopyPass}
                className="w-full h-11 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black rounded-xl"
              >
                {isCopied ? "✓ Pass Code Copied to Clipboard!" : "Save Pass to Phone (Copy Code)"}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="h-10 text-xs font-semibold border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  <Link href="/instructor/roster" onClick={() => setIsOpen(false)}>
                    <span>Door Scanner →</span>
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="h-10 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Done / Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
