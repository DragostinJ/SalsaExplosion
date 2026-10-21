"use client";

import { useState, useTransition } from "react";
import {
  Copy,
  Check,
  Gift,
  Users,
  Coins,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { redeemReferralCodeAction } from "@/actions/referral.actions";

export interface ReferralStats {
  friendsInvited: number;
  creditsEarned: number;
  hasRedeemedWelcomeBonus: boolean;
}

interface ReferralDashboardClientProps {
  referralCode: string;
  studentName: string;
  stats?: ReferralStats;
}

export function ReferralDashboardClient({
  referralCode,
  studentName,
  stats = {
    friendsInvited: 0,
    creditsEarned: 0,
    hasRedeemedWelcomeBonus: false,
  },
}: ReferralDashboardClientProps) {
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const referralUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/sign-up?ref=${referralCode}`
      : `https://salsaexplosion.co.uk/sign-up?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await redeemReferralCodeAction({ code: inputCode });
      if (res.success) {
        setFeedback({
          type: "success",
          text: res.message || "Referral bonus credited!",
        });
        setInputCode("");
      } else {
        const msg =
          typeof res.error === "string"
            ? res.error
            : res.error?.message ?? "Failed to redeem code.";
        setFeedback({ type: "error", text: msg });
      }
    });
  };

  const shareText = encodeURIComponent(
    `Hey! ${studentName} invited you to dance Cuban Salsa at Salsa Explosion Bournemouth! Use this link to get 1 free class credit at BOH Studios: ${referralUrl}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}`;

  return (
    <div className="space-y-8">
      {/* Referral Code Banner Box */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.08] via-orange-500/[0.04] to-background p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge className="bg-amber-600 text-white font-bold text-xs uppercase tracking-wider mb-2">
              <Gift className="mr-1 h-3.5 w-3.5" />
              Give 1 Class, Get 1 Class
            </Badge>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Your Personal Dancer Invite Code
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
              Invite friends to try Cuban Salsa or Rueda de Casino at BOH Studios. They get 1 free welcome credit, and you earn 1 class credit when they join!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              asChild
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-1.5 h-4 w-4" />
                Share on WhatsApp
              </a>
            </Button>
          </div>
        </div>

        {/* Copy Link Input Bar */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-background/80 backdrop-blur-xs p-2 rounded-2xl border shadow-inner">
          <div className="flex-1 px-3 py-2 font-mono text-xs sm:text-sm text-foreground truncate flex items-center">
            {referralUrl}
          </div>
          <Button
            type="button"
            onClick={handleCopy}
            className={`font-bold text-xs shrink-0 transition-all ${
              copied
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-amber-600 text-white hover:bg-amber-700"
            }`}
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-4 w-4" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-4 w-4" />
                Copy Invite Link
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Referral Code:</span>
          <span className="font-mono font-black text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
            {referralCode}
          </span>
        </div>
      </div>

      {/* Redeem a Friend's Code Form */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary-base" />
          <h3 className="text-base font-bold text-foreground">
            Have a Friend&apos;s Salsa Explosion Code?
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Enter an invite code from another dancer to claim your 1 complimentary welcome class credit.
        </p>

        {feedback && (
          <div
            className={`rounded-xl border p-3.5 text-xs font-semibold ${
              feedback.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            {feedback.text}
          </div>
        )}

        <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row gap-2 max-w-md">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="e.g. SALSA-ENRI-ABCD"
            disabled={isPending || stats.hasRedeemedWelcomeBonus}
            className="flex-1 rounded-xl border bg-background px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={isPending || !inputCode.trim() || stats.hasRedeemedWelcomeBonus}
            className="bg-primary-base hover:bg-primary-hover text-white font-bold text-xs"
          >
            {isPending ? "Validating..." : stats.hasRedeemedWelcomeBonus ? "Bonus Claimed" : "Redeem Credit"}
          </Button>
        </form>
      </div>

      {/* Referral Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground">
                Friends Referred
              </span>
              <div className="text-2xl font-black mt-1">{stats.friendsInvited}</div>
              <span className="text-[10px] text-muted-foreground">
                Dancers who joined with your code
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground">
                Total Earned Credits
              </span>
              <div className="text-2xl font-black mt-1 text-amber-600">
                {stats.creditsEarned} {stats.creditsEarned === 1 ? "Credit" : "Credits"}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">
                Available in your studio wallet
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Coins className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs sm:col-span-2 lg:col-span-1">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground">
                Welcome Bonus Status
              </span>
              <div className="text-lg font-black mt-1 text-foreground">
                {stats.hasRedeemedWelcomeBonus ? "Claimed (1 Credit)" : "Available to Claim"}
              </div>
              <span className="text-[10px] text-muted-foreground">
                1 bonus credit per student account
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Gift className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3-Step Walkthrough */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">How the Salsa Explosion Referral Program Works</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-5 space-y-2.5 shadow-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 font-extrabold text-sm">
              1
            </div>
            <h4 className="font-bold text-sm">Send Your Personal Link</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Share your link via WhatsApp, Instagram DM, or message with anyone in Bournemouth, Poole, or Christchurch who wants to learn salsa.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5 space-y-2.5 shadow-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 font-extrabold text-sm">
              2
            </div>
            <h4 className="font-bold text-sm">They Get 1 Free Class Credit</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When they create an account and redeem your code, 1 complimentary welcome class credit is credited immediately to their wallet.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5 space-y-2.5 shadow-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-extrabold text-sm">
              3
            </div>
            <h4 className="font-bold text-sm">You Get 1 Class Credit</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              As soon as your friend redeems your code, you also receive 1 free class credit added directly to your studio balance!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
