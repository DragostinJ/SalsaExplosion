"use client";

import { useState } from "react";
import { DanceLevel, DanceRole } from "@prisma/client";
import {
  Award,
  Share2,
  CheckCircle2,
  Flame,
  Sparkles,
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

  const handleShareBadge = async () => {
    const shareText = `🔥 Officially verified ${currentLevel} Cuban Salsa (${preferredRole}) dancer at RitmoFlow Casino & Rueda Academy!`;
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
    <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950 p-6 sm:p-8 text-white shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-bold text-amber-300">
            <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>RitmoFlow Verified Dancer Credential</span>
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

        <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/25">
            <Award className="h-9 w-9" />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleShareBadge}
            className="bg-white text-black hover:bg-zinc-200 font-bold text-xs"
          >
            {copied ? (
              <>
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                Copied Story Badge!
              </>
            ) : (
              <>
                <Share2 className="mr-1.5 h-3.5 w-3.5" />
                Share Milestone Badge
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
