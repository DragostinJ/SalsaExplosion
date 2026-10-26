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
  const [passCode, setPassCode] = useState("#BOH-2026");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<QuickBookPayload>;
      if (customEvent.detail) {
        setSession(customEvent.detail);
        setStep("configure");
        const suffix = Math.floor(1000 + Math.random() * 9000);
        const dayTag = customEvent.detail.day === "sunday" ? "SUN" : "THU";
        setPassCode(`#BOH-2026-${dayTag}-${suffix}`);
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
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border-t sm:border border-line bg-surface-2 text-ivory p-5 sm:p-7 shadow-2xl space-y-5">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-widest text-gold">
              2-TAP QUICKBOOK • HAVANA RESIDENCY PASS
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1.5 text-ivory-muted hover:text-ivory hover:bg-surface-3 transition-colors"
            aria-label="Close booking drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "configure" ? (
          <div className="space-y-4">
            {/* Session Summary Card */}
            <div className="p-3.5 rounded-xl bg-surface-3 text-ivory border border-line space-y-1">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                <span className="text-gold">{session.time}</span>
                {session.level && (
                  <span className="bg-surface-2 text-gold px-2 py-0.5 rounded-full text-xs border border-line">
                    {session.level}
                  </span>
                )}
              </div>
              <h4 className="text-base font-black text-ivory">{session.title}</h4>
              <div className="flex items-center justify-between text-xs text-ivory-muted pt-1">
                <span>{session.instructor ? `Directed by ${session.instructor}` : "Salsa Explosion Team"}</span>
                <span className="font-bold text-gold">BOH Studios Bournemouth</span>
              </div>
            </div>

            {/* Step 1: Role Selection & Live Balance Meter */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-ivory-muted">
                ROLE SELECTION
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole("lead")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    role === "lead"
                      ? "border-role-lead bg-role-lead-soft text-ivory shadow-xs"
                      : "border-line bg-surface-3 text-ivory-muted hover:text-ivory hover:bg-surface-1"
                  }`}
                >
                  <div className="text-sm font-black">LEAD • Lead Partner</div>
                  <div className="text-xs text-role-lead font-semibold mt-0.5">Spot Open</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("follow")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    role === "follow"
                      ? "border-role-follow bg-role-follow-soft text-ivory shadow-xs"
                      : "border-line bg-surface-3 text-ivory-muted hover:text-ivory hover:bg-surface-1"
                  }`}
                >
                  <div className="text-sm font-black">FOLLOW • Follow Partner</div>
                  <div className="text-xs text-role-follow font-semibold mt-0.5">Spot Open</div>
                </button>
              </div>

              {/* Live Partner Ratio Balance Meter */}
              <div className="p-2.5 rounded-xl border border-success-line bg-success-soft text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-success">
                  <span>LIVE RATIO LOCK: 50% LEADS / 50% FOLLOWS</span>
                  <span>BALANCED CIRCLE</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-1 overflow-hidden flex">
                  <div className="w-1/2 bg-role-lead h-full" />
                  <div className="w-1/2 bg-role-follow h-full" />
                </div>
              </div>
            </div>

            {/* Step 2: Entry Tier Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-ivory-muted">
                PASS OPTION
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setTier("trial")}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    tier === "trial"
                      ? "border-gold bg-gold/20 text-ivory"
                      : "border-line bg-surface-3 text-ivory-muted hover:border-gold/30 hover:bg-surface-1"
                  }`}
                >
                  <div>
                    <div className="text-xs font-black flex items-center gap-1.5">
                      <span>FIRST-TIMER TRIAL (£0)</span>
                      <span className="text-[11px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                        FREE
                      </span>
                    </div>
                    <div className="text-xs text-ivory-muted">Valid for new local dancers</div>
                  </div>
                  <span className="text-xs font-black text-gold">Claim Trial</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTier("dropin")}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    tier === "dropin"
                      ? "border-gold bg-gold/20 text-ivory"
                      : "border-line bg-surface-3 text-ivory-muted hover:border-gold/30 hover:bg-surface-1"
                  }`}
                >
                  <div>
                    <div className="text-xs font-black">SINGLE DROP-IN (£12)</div>
                    <div className="text-xs text-ivory-muted">Includes evening classes + social fiesta</div>
                  </div>
                  <span className="text-xs font-black text-gold">£12 Drop-In</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTier("pack")}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    tier === "pack"
                      ? "border-gold bg-gold/20 text-ivory"
                      : "border-line bg-surface-3 text-ivory-muted hover:border-gold/30 hover:bg-surface-1"
                  }`}
                >
                  <div>
                    <div className="text-xs font-black flex items-center gap-1.5">
                      <span>5-CLASS PACK (£40)</span>
                      <span className="text-[11px] font-black uppercase px-1.5 py-0.2 rounded bg-gold text-stone-950 font-bold">
                        SAVE 20%
                      </span>
                    </div>
                    <div className="text-xs text-ivory-muted">£8 per session • Valid 60 days</div>
                  </div>
                  <span className="text-xs font-black text-gold">£40</span>
                </button>
              </div>
            </div>

            {/* Attendee Name Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-ivory-muted">Attendee Name (For Door Check-In)</label>
                <button
                  type="button"
                  onClick={() => setUserName("Alex Rivera")}
                  className="text-[11px] font-semibold text-gold hover:underline"
                >
                  Autofill Guest
                </button>
              </div>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full h-11 px-3.5 rounded-xl border border-line bg-surface-3 text-ivory placeholder:text-ivory-muted text-sm focus:outline-hidden focus:border-gold"
              />
            </div>

            {/* Submit Action */}
            <Button
              type="button"
              onClick={handleGeneratePass}
              className="w-full h-12 text-xs sm:text-sm font-black uppercase tracking-wider bg-brand hover:bg-brand-hover text-white rounded-xl shadow-lg transition-transform active:scale-[0.99]"
            >
              CONFIRM &amp; GENERATE QR PASS →
            </Button>
          </div>
        ) : (
          /* Step 2: Perforated Havana VIP Ticket Stub */
          <div className="space-y-4">
            <div className="p-5 rounded-xl border-2 border-dashed border-gold/40 bg-surface-3 relative space-y-4">
              {/* Top Perforation Notches */}
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-success">
                    CONFIRMED RESERVATION
                  </span>
                  <h4 className="text-lg font-black text-ivory">{session.title}</h4>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-gold text-stone-950 font-black text-xs uppercase">
                  {role}
                </div>
              </div>

              {/* Scannable SVG QR Code Stub */}
              <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
                <div className="p-3 rounded-xl bg-white border border-gold/30 shrink-0 flex items-center justify-center">
                  <svg className="w-24 h-24 text-black" viewBox="0 0 100 100" fill="currentColor">
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
                  <div className="font-mono text-xs font-bold text-gold">{passCode}</div>
                  <div className="font-bold text-ivory text-sm">{userName || "Guest Dancer"}</div>
                  <div className="text-ivory-muted flex items-center justify-center sm:justify-start gap-1">
                    <Clock className="h-3 w-3 text-gold" />
                    <span>{session.time} • BOH Studios Doors Open</span>
                  </div>
                  <div className="text-ivory-muted flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="h-3 w-3 text-gold" />
                    <span>104 Commercial Rd, Bournemouth</span>
                  </div>
                </div>
              </div>

              {/* Perforated Hairline Divider */}
              <div className="border-t border-dashed border-line pt-3 flex items-center justify-between text-[11px] text-ivory-muted font-medium">
                <span>Pass tier: <strong>{tier.toUpperCase()}</strong></span>
                <span>Maestro Enrique Perez Valdes</span>
              </div>
            </div>

            {/* Post-Pass Actions */}
            <div className="space-y-2">
              <Button
                type="button"
                onClick={handleCopyPass}
                className="w-full h-11 text-xs font-bold bg-brand hover:bg-brand-hover text-white rounded-xl"
              >
                {isCopied ? "Pass Code Copied to Clipboard!" : "Save Pass to Phone (Copy Code)"}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="h-10 text-xs font-semibold border-line bg-surface-3 text-ivory hover:bg-surface-1"
                >
                  <Link href="/instructor/roster" onClick={() => setIsOpen(false)}>
                    <span>Test Door Scanner (/instructor/roster) →</span>
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="h-10 text-xs font-semibold text-ivory-muted hover:text-ivory"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
