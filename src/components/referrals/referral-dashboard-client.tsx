"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Gift,
  Users,
  Coins,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ReferralDashboardClientProps {
  referralCode: string;
  studentName: string;
}

export function ReferralDashboardClient({
  referralCode,
  studentName,
}: ReferralDashboardClientProps) {
  const [copied, setCopied] = useState(false);
  const referralUrl = typeof window !== "undefined"
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

  const shareText = encodeURIComponent(
    `Hey! ${studentName} invited you to dance Cuban Salsa at Salsa Explosion Bournemouth! Use this link to get £5 off your first class at BOH Studios: ${referralUrl}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}`;

  return (
    <div className="space-y-8">
      {/* Referral Code Banner Box */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.08] via-orange-500/[0.04] to-background p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge className="bg-amber-600 text-white font-bold text-xs uppercase tracking-wider mb-2">
              <Gift className="mr-1 h-3.5 w-3.5" />
              Give £5, Get £5
            </Badge>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Your Personal Dancer Invite Code
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
              Invite friends to try Cuban Salsa or Rueda de Casino at BOH Studios. They get £5 off their first class, and you earn £5 credit when they attend!
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
        <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-2xl border shadow-inner">
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

      {/* Referral Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Friends Invited</span>
              <div className="text-2xl font-black mt-1">2</div>
              <span className="text-[10px] text-muted-foreground">Link clicks & sign-ups</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Classes Attended</span>
              <div className="text-2xl font-black mt-1">1</div>
              <span className="text-[10px] text-emerald-600 font-semibold">1 active dancer</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Check className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Total Earned Credit</span>
              <div className="text-2xl font-black mt-1 text-amber-600">£5.00</div>
              <span className="text-[10px] text-muted-foreground">Applied to class passes</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Coins className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Pending Rewards</span>
              <div className="text-2xl font-black mt-1">£5.00</div>
              <span className="text-[10px] text-muted-foreground">Unlocks after door check-in</span>
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
            <h4 className="font-bold text-sm">They Get £5 Off First Class</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When they create an account with your link, an automatic £5 discount applies to their first session booking at BOH Studios.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5 space-y-2.5 shadow-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-extrabold text-sm">
              3
            </div>
            <h4 className="font-bold text-sm">You Get £5 Class Credit</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              As soon as they scan their door QR code at BOH Studios, £5 credit is added to your account for future classes or congress passes!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
