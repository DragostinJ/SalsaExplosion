import Link from "next/link";
import { ArrowRight, Users, Sparkles, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser, isFallbackUser } from "@/lib/auth-user";
import { PageHeader } from "@/components/layout/page-header";
import { DataUnavailableNotice } from "@/components/ui/data-unavailable-notice";
import { Button } from "@/components/ui/button";
import {
  ReferralDashboardClient,
  ReferralStats,
} from "@/components/referrals/referral-dashboard-client";
import { VENUE_INFO } from "@/lib/academy-data";
import { reportError } from "@/lib/monitoring";

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
        <PageHeader
          title="Invite Friends,"
          titleHighlight="Earn Free Class Credits"
          description={`Help grow Bournemouth's authentic Cuban Salsa & Rueda de Casino community at ${VENUE_INFO.name}. When a friend joins their first Thursday or Sunday session using your personal code, you both receive a complimentary class credit.`}
          badge="Give 1 Class, Get 1 Class"
          eyebrow="DANCER REFERRAL NETWORK • BOH STUDIOS"
          backHref="/dashboard/schedule"
          backLabel="Back to Schedule"
        />

        <div className="border-4 border-ink bg-paper p-6 sm:p-10 text-ink shadow-[6px_6px_0_var(--color-ink)] space-y-6">
          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            <div className="border-2 border-ink bg-paper-light p-4 space-y-1 shadow-[3px_3px_0_var(--color-ink)]">
              <Users className="h-5 w-5 text-accent-red mb-1" />
              <div className="text-sm font-black uppercase text-ink">1. Share Your Code</div>
              <p className="text-xs text-ink">
                Send your personal Salsa Explosion invite link via WhatsApp or Instagram.
              </p>
            </div>
            <div className="border-2 border-ink bg-paper-light p-4 space-y-1 shadow-[3px_3px_0_var(--color-ink)]">
              <Sparkles className="h-5 w-5 text-accent-red mb-1" />
              <div className="text-sm font-black uppercase text-ink">2. Friend Joins Class</div>
              <p className="text-xs text-ink">
                Your friend claims their free welcome credit for Thursday or Sunday at BOH Studios.
              </p>
            </div>
            <div className="border-2 border-ink bg-paper-light p-4 space-y-1 shadow-[3px_3px_0_var(--color-ink)]">
              <CheckCircle2 className="h-5 w-5 text-accent-teal mb-1" />
              <div className="text-sm font-black uppercase text-ink">3. Earn Automatic Credit</div>
              <p className="text-xs text-ink">
                1 free class credit is added directly to your digital studio wallet.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              asChild
              className="border-2 border-ink bg-poster-red hover:bg-ink text-ink font-black text-xs sm:text-sm h-11 px-6 shadow-[2px_2px_0_var(--color-ink)] rounded-none"
            >
              <Link href="/sign-in">
                Sign In to Get Your Referral Code
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-2 border-ink bg-paper hover:bg-ink hover:text-paper text-ink font-bold text-xs sm:text-sm h-11 px-6 shadow-[2px_2px_0_var(--color-ink)] rounded-none"
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

  // Fetch real referral stats from CreditLedger inside defensive try/catch
  let referralEarnings: Array<{ amount: number }> = [];
  let redeemedRecord = null;
  let loadFailed = isFallbackUser(user);
  try {
    const [earnings, redeemed] = await Promise.all([
      prisma.creditLedger.findMany({
        where: {
          userId: user.id,
          description: { startsWith: "REFERRAL_REWARD_EARNED_FROM:" },
        },
      }),
      prisma.creditLedger.findFirst({
        where: {
          userId: user.id,
          description: { startsWith: "REFERRAL_BONUS_REDEEMED:" },
        },
      }),
    ]);
    referralEarnings = earnings;
    redeemedRecord = redeemed;
  } catch (err) {
    loadFailed = true;
    reportError("ReferralsPage:queries", err);
  }

  const stats: ReferralStats = {
    friendsInvited: referralEarnings.length,
    creditsEarned: referralEarnings.reduce((acc, curr) => acc + curr.amount, 0),
    hasRedeemedWelcomeBonus: Boolean(redeemedRecord),
  };

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {loadFailed && <DataUnavailableNotice />}
      <PageHeader
        title="Refer-a-Dancer"
        titleHighlight="Program"
        description="Help grow Bournemouth's authentic Cuban salsa scene. Share your link with friends, colleagues, or dance partners."
        badge="Give 1 Class, Get 1 Class"
        eyebrow="DANCER REFERRAL NETWORK • BOH STUDIOS"
        backHref="/dashboard/schedule"
        backLabel="Back to Schedule"
      />

      {/* Referral Client Hub */}
      <ReferralDashboardClient
        referralCode={referralCode}
        studentName={`${user.firstName} ${user.lastName}`}
        stats={stats}
      />
    </main>
  );
}
