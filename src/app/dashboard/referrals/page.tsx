import Link from "next/link";
import { Gift, ArrowRight, Users, Sparkles, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { BackButton } from "@/components/navigation/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ReferralDashboardClient,
  ReferralStats,
} from "@/components/referrals/referral-dashboard-client";
import { VENUE_INFO } from "@/lib/academy-data";

export const metadata = {
  title: "Refer a Dancer | Give 1 Class, Get 1 Class | Salsa Explosion",
  description:
    "Invite your friends to dance Cuban Salsa at BOH Studios Bournemouth. They get 1 free welcome credit, and you earn 1 credit.",
};

export default async function ReferralsPage() {
  const user = await getOrProvisionCurrentUser();
  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold px-3 py-1 flex items-center gap-1.5"
          >
            <Gift className="h-3.5 w-3.5 text-amber-600" />
            Dancer Referral Network
          </Badge>
        </div>

        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#120d0a] via-[#0c0908] to-[#070605] p-6 sm:p-10 text-white shadow-xl space-y-6">
          <div className="space-y-3 max-w-2xl">
            <Badge className="bg-amber-500 text-black font-black text-xs uppercase tracking-wider">
              Give 1 Class, Get 1 Class
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Invite Friends, Earn Free Class Credits
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Help grow Bournemouth&apos;s authentic Cuban Salsa &amp; Rueda de Casino community at {VENUE_INFO.name}. When a friend joins their first Thursday or Sunday session using your personal code, you both receive a complimentary class credit.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1">
              <Users className="h-5 w-5 text-amber-300 mb-1" />
              <div className="text-sm font-black text-white">1. Share Your Code</div>
              <p className="text-xs text-zinc-300">
                Send your personal Salsa Explosion invite link via WhatsApp or Instagram.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1">
              <Sparkles className="h-5 w-5 text-amber-300 mb-1" />
              <div className="text-sm font-black text-white">2. Friend Joins Class</div>
              <p className="text-xs text-zinc-300">
                Your friend claims their free welcome credit for Thursday or Sunday at BOH Studios.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mb-1" />
              <div className="text-sm font-black text-white">3. Earn Automatic Credit</div>
              <p className="text-xs text-zinc-300">
                1 free class credit is added directly to your digital studio wallet.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              asChild
              className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs sm:text-sm h-11 px-6 rounded-xl"
            >
              <Link href="/sign-in">
                Sign In to Get Your Referral Code
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs sm:text-sm h-11 px-6 rounded-xl"
            >
              <Link href="/dashboard/schedule">
                Explore Thursday &amp; Sunday Schedule
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Deterministic, readable student referral code
  const cleanName = (user.firstName || "SALSA")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 4);
  const cleanSuffix = user.id.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase();
  const referralCode = `SALSA-${cleanName}-${cleanSuffix}`;

  // Fetch real referral stats from CreditLedger
  const referralEarnings = await prisma.creditLedger.findMany({
    where: {
      userId: user.id,
      description: { startsWith: "REFERRAL_REWARD_EARNED_FROM:" },
    },
  });

  const redeemedRecord = await prisma.creditLedger.findFirst({
    where: {
      userId: user.id,
      description: { startsWith: "REFERRAL_BONUS_REDEEMED:" },
    },
  });

  const stats: ReferralStats = {
    friendsInvited: referralEarnings.length,
    creditsEarned: referralEarnings.reduce((acc, curr) => acc + curr.amount, 0),
    hasRedeemedWelcomeBonus: Boolean(redeemedRecord),
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <BackButton fallbackUrl="/dashboard/schedule" label="Back to Schedule" />
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold px-3 py-1 flex items-center gap-1.5"
        >
          <Gift className="h-3.5 w-3.5 text-amber-600" />
          Dancer Referral Network
        </Badge>
      </div>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Refer-a-Dancer Program
            </h1>
            <Badge className="bg-amber-500 text-zinc-950 font-bold">
              Give 1 Class, Get 1 Class
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-3xl">
            Help grow Bournemouth&apos;s authentic Cuban salsa scene. Share your link with friends, colleagues, or dance partners.
          </p>
        </div>
      </div>

      {/* Referral Client Hub */}
      <ReferralDashboardClient
        referralCode={referralCode}
        studentName={`${user.firstName} ${user.lastName}`}
        stats={stats}
      />
    </main>
  );
}
