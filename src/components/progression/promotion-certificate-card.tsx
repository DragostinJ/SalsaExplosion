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
      {/* Outer credential wrapper — Havana Architecture */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface-2 p-4 sm:p-8 text-ivory shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 border border-gold/30 px-3 py-1 text-xs font-bold text-gold">
              <Flame className="h-3.5 w-3.5 fill-gold text-gold" />
              <span>Salsa Explosion Verified Dancer Credential</span>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-ivory-muted font-semibold">
                Official Cuban Salsa & Rueda Tier
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5 flex items-center gap-2.5">
                <span>{studentName}</span>
                <Badge className="bg-gold text-stone-950 font-extrabold text-xs">
                  {currentLevel}
                </Badge>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-ivory-muted">
              <span className="inline-flex items-center gap-1 font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold text-stone-950 shadow-lg shadow-gold/20">
              <Award className="h-8 w-8" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => setShowStoryModal(true)}
                className="bg-brand hover:bg-brand-hover text-white font-bold text-xs rounded-xl"
              >
                <Smartphone className="mr-1.5 h-3.5 w-3.5" />
                9:16 Story Badge
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleShareBadge}
                className="border-line bg-surface-3 text-ivory hover:bg-surface-1 font-bold text-xs rounded-xl"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
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
            <div className="flex w-full items-center justify-between text-ivory">
              <span className="text-xs font-bold uppercase tracking-wider text-gold">
                9:16 Instagram / WhatsApp Story Card
              </span>
              <button
                type="button"
                onClick={() => setShowStoryModal(false)}
                className="rounded-full bg-surface-3 p-1.5 text-ivory-muted hover:bg-surface-1 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Print-fidelity and social story canvas — intentionally styled for export contrast */}
            <div className="w-72 aspect-[9/16] rounded-3xl border-2 border-gold/60 bg-surface-1 p-6 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold text-stone-950">
                    <Flame className="h-4 w-4 fill-stone-950" />
                  </div>
                  <span className="text-xs font-extrabold tracking-tight">
                    Ritmo<span className="text-gold">Flow</span>
                  </span>
                </div>
                <Badge className="bg-gold/20 text-gold border border-gold/40 text-xs">
                  VERIFIED PASSPORT
                </Badge>
              </div>

              <div className="my-auto space-y-4 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gold text-stone-950 shadow-xl shadow-gold/30">
                  <Award className="h-11 w-11" />
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gold">
                    Official Level Unlocked
                  </p>
                  <h3 className="text-2xl font-black tracking-tight">
                    {currentLevel}
                  </h3>
                  <p className="text-sm font-bold text-stone-200">
                    {studentName}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-[11px] space-y-1">
                  <div className="flex justify-between text-ivory-muted">
                    <span>Style</span>
                    <span className="font-bold text-white">Cuban Casino & Rueda</span>
                  </div>
                  <div className="flex justify-between text-ivory-muted">
                    <span>Partner Role</span>
                    <span className="font-bold text-gold">{preferredRole}</span>
                  </div>
                  <div className="flex justify-between text-ivory-muted">
                    <span>Mastery Checks</span>
                    <span className="font-bold text-emerald-400">
                      {approvedCount} Verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1 border-t border-white/10 pt-3">
                <p className="text-xs font-semibold text-ivory-muted">
                  Come dance with us this week!
                </p>
                <p className="text-xs text-gold/90 font-mono">
                  salsaexplosion.co.uk • #LaRuedaNoPara
                </p>
              </div>
            </div>

            <div className="flex w-full gap-2">
              <Button
                type="button"
                onClick={handleShareBadge}
                className="flex-1 bg-brand hover:bg-brand-hover text-white font-bold text-xs rounded-xl"
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                {copied ? "Caption Copied!" : "Copy Story Caption"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowStoryModal(false)}
                className="border-line bg-surface-3 text-ivory hover:bg-surface-1 text-xs rounded-xl"
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
