import { redirect } from "next/navigation";
import { Gift } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser } from "@/lib/auth-user";
import { BackButton } from "@/components/navigation/back-button";
import { Badge } from "@/components/ui/badge";
import {
  ReferralDashboardClient,
  ReferralStats,
} from "@/components/referrals/referral-dashboard-client";

export const metadata = {
  title: "Refer a Dancer | Give 1 Class, Get 1 Class | Salsa Explosion",
  description:
    "Invite your friends to dance Cuban Salsa at BOH Studios Bournemouth. They get 1 free welcome credit, and you earn 1 credit.",
};

export default async function ReferralsPage() {
  const user = await getOrProvisionCurrentUser();
  if (!user) {
    redirect("/sign-in");
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
