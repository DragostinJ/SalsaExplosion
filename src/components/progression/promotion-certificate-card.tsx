"use client";

import { useState } from "react";
import { DanceLevel, DanceRole } from "@prisma/client";
import {
  Award,
  Share2,
  CheckCircle2,
  Flame,
  Sparkles,
  Smartphone,
  X,
  Copy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PromotionCertificateCardProps {
  studentName: string;
  currentLevel: DanceLevel;
  preferredRole: DanceRole;
  approvedCount: number;
}

export function PromotionCertificateCard({
  studentName,
  currentLevel,
  preferredRole,
  approvedCount,
}: PromotionCertificateCardProps) {
  const [copied, setCopied] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);

  const shareText = `🔥 Officially verified ${currentLevel} Cuban Salsa (${preferredRole}) dancer at Salsa Explosion Cuban Salsa & Rueda Academy! #CubanSalsa #RuedaDeCasino #SalsaExplosion`;

  const handleShareBadge = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      setCopied(true);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-bold text-amber-300">
              <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>Salsa Explosion Verified Dancer Credential</span>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
                Official Cuban Salsa & Rueda Tier
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5 flex items-center gap-2.5">
                <span>{studentName}</span>
                <Badge className="bg-amber-500 text-black font-extrabold text-xs">
                  {currentLevel}
                </Badge>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300">
              <span className="inline-flex items-center gap-1 font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Role: {preferredRole}
              </span>
              <span>•</span>
              <span>Style: Cuban Casino & Rueda de Casino</span>
              {approvedCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">
                    {approvedCount} Video Assessment(s) Passed
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2.5 shrink-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/25">
              <Award className="h-8 w-8" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => setShowStoryModal(true)}
                className="bg-amber-500 text-black hover:bg-amber-400 font-bold text-xs"
              >
                <Smartphone className="mr-1.5 h-3.5 w-3.5" />
                9:16 Instagram Story Badge
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleShareBadge}
                className="bg-white text-black hover:bg-zinc-200 font-bold text-xs"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                    Copied Caption!
                  </>
                ) : (
                  <>
                    <Share2 className="mr-1.5 h-3.5 w-3.5" />
                    Copy Brag Text
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 9:16 Instagram Story / WhatsApp Social Brag Badge Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative flex flex-col items-center gap-4 max-w-sm w-full">
            <div className="flex w-full items-center justify-between text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                9:16 Instagram / WhatsApp Story Card
              </span>
              <button
                type="button"
                onClick={() => setShowStoryModal(false)}
                className="rounded-full bg-zinc-800 p-1.5 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 9:16 Aspect Ratio Card */}
            <div className="w-72 aspect-[9/16] rounded-3xl border-2 border-amber-500/60 bg-gradient-to-b from-zinc-950 via-zinc-900 to-amber-950 p-6 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-black">
                    <Flame className="h-4 w-4 fill-black" />
                  </div>
                  <span className="text-xs font-extrabold tracking-tight">
                    Ritmo<span className="text-amber-400">Flow</span>
                  </span>
                </div>
                <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
                  VERIFIED PASSPORT
                </Badge>
              </div>

              <div className="my-auto space-y-4 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-400 text-black shadow-xl shadow-amber-500/30">
                  <Award className="h-11 w-11" />
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                    Official Level Unlocked
                  </p>
                  <h3 className="text-2xl font-black tracking-tight">
                    {currentLevel}
                  </h3>
                  <p className="text-sm font-bold text-zinc-200">
                    {studentName}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-[11px] space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>Style</span>
                    <span className="font-bold text-white">Cuban Casino & Rueda</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Partner Role</span>
                    <span className="font-bold text-amber-300">{preferredRole}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Mastery Checks</span>
                    <span className="font-bold text-emerald-400">
                      {approvedCount} Verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1 border-t border-white/10 pt-3">
                <p className="text-[10px] font-semibold text-zinc-300">
                  Come dance with us this week! 💃🕺
                </p>
                <p className="text-[9px] text-amber-400/90 font-mono">
                  salsaexplosion.co.uk • #LaRuedaNoPara
                </p>
              </div>
            </div>

            <div className="flex w-full gap-2">
              <Button
                type="button"
                onClick={handleShareBadge}
                className="flex-1 bg-amber-500 text-black hover:bg-amber-400 font-bold text-xs"
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                {copied ? "Caption Copied!" : "Copy Story Caption"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowStoryModal(false)}
                className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
